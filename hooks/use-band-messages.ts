"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/SupabaseContext';
import { supabase } from '@/lib/supabase';

export interface BandMessage {
  id: string;
  band_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export function useBandMessages(bandId: string) {
  const [messages, setMessages] = useState<BandMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch messages for a band
  const fetchMessages = useCallback(async () => {
    if (!user || !bandId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching messages for band:', bandId);
      
      // First, try a simple query without joins to check basic access
      const { data: simpleData, error: simpleError } = await supabase
        .from('band_messages')
        .select('id, band_id, user_id, text, created_at')
        .eq('band_id', bandId)
        .order('created_at', { ascending: true });

      if (simpleError) {
        console.log('Basic query error:', {
          code: simpleError.code,
          message: simpleError.message,
          details: simpleError.details,
          hint: simpleError.hint
        });
        
        // Don't show error UI for certain types of errors
        if (simpleError.message.includes('does not exist') || 
            simpleError.message.includes('relation') || 
            simpleError.code === '42P01') {
          console.log('Table does not exist error detected - returning empty messages array');
          setMessages([]);
          setIsLoading(false);
          return;
        } else {
          setError(new Error(simpleError.message || 'Failed to fetch messages'));
          setIsLoading(false);
          return;
        }
      }
      
      // Step 2: If the simple query worked, fetch user data separately
      let messagesData = simpleData || [];
      
      // Get unique user IDs from messages
      const userIds = [...new Set(messagesData.map(m => m.user_id))];
      
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        if (userError) {
          console.log('Error fetching user data:', userError);
          // Continue without user data rather than failing completely
        } else if (userData) {
          // Create a map of user IDs to user data for quick lookup
          const userMap: Record<string, any> = {};
          userData.forEach((user: any) => {
            userMap[user.id] = user;
          });
          
          // Attach user data to messages
          messagesData = messagesData.map(message => ({
            ...message,
            user: userMap[message.user_id] || null
          }));
        }
      }
      
      setMessages(messagesData);
      console.log('Successfully fetched', messagesData.length, 'messages');
      
    } catch (err) {
      // Log detailed error information
      if (err instanceof Error) {
        console.error('Error fetching messages:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      } else {
        console.error('Unknown error type:', typeof err, 'Error:', err);
      }
      
      // Don't show error UI for certain types of errors
      if (err instanceof Error && 
          (err.message.includes('42P01') || err.message.includes('relation') || err.message.includes('does not exist'))) {
        console.log('Table does not exist error detected - hiding error from UI');
        setMessages([]);
      } else {
        setError(err instanceof Error ? err : new Error(JSON.stringify(err) || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [bandId, user]);

  // Send a new message
  const sendMessage = useCallback(async (text: string) => {
    if (!user) {
      console.log('Cannot send message: User not authenticated');
      return { error: new Error('User not authenticated') };
    }
    
    try {
      console.log('Sending message for band:', bandId, 'user:', user.id);
      
      // Create a temporary message object with a temporary ID
      const tempId = `temp-${Date.now()}`;
      const tempMessage: BandMessage = {
        id: tempId,
        band_id: bandId,
        user_id: user.id,
        text,
        created_at: new Date().toISOString(),
        user: {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'You',
          avatar_url: user.user_metadata?.avatar_url || '/placeholder.svg'
        }
      };
      
      // Immediately add the message to the local state for instant feedback
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Then send it to the database
      const { data, error } = await supabase
        .from('band_messages')
        .insert([
          {
            band_id: bandId,
            user_id: user.id,
            text,
          },
        ])
        .select()
        .single();

      if (error) {
        console.log('Error sending message:', error);
        // Check if it's a 'relation does not exist' error
        if (error.message && (error.message.includes('does not exist') || error.message.includes('relation'))) {
          console.log('Table does not exist error - creating band_messages table may be needed');
          // Keep the optimistic update to avoid disrupting the user experience
          return { success: true, message: tempMessage, isOptimistic: true };
        }
        
        // Remove the temporary message on error
        setMessages(prevMessages => prevMessages.filter(m => m.id !== tempId));
        return { error: new Error(error.message || 'Failed to send message') };
      }

      // Replace the temporary message with the real one
      setMessages(prevMessages => 
        prevMessages.map(m => m.id === tempId ? {
          ...data,
          user: tempMessage.user // Keep the user data we already have
        } : m)
      );

      return { success: true, message: data };
    } catch (err) {
      console.log('Unexpected error in sendMessage:', err);
      // Just remove any temporary messages that might be in the UI
      setMessages(prevMessages => prevMessages.filter(m => !m.id.toString().startsWith('temp-')));
      return { error: err instanceof Error ? err : new Error('Failed to send message') };
    }
  }, [bandId, user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!bandId) return;
    
    fetchMessages();

    console.log('Setting up real-time subscription for band:', bandId);
    
    // Set up realtime subscription with improved error handling
    const channel = supabase
      .channel(`band_messages_${bandId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'band_messages',
          filter: `band_id=eq.${bandId}`
        }, 
        async (payload) => {
          console.log('Received new message via real-time:', payload);
          
          try {
            // When we receive a new message, fetch the user data
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', payload.new.user_id)
              .single();

            if (userError) {
              console.warn('Error fetching user data for message:', userError);
            }
            
            // Create a properly typed BandMessage object
            const newMessage: BandMessage = {
              id: payload.new.id,
              band_id: payload.new.band_id,
              user_id: payload.new.user_id,
              text: payload.new.text,
              created_at: payload.new.created_at,
              user: userData || undefined
            };

            console.log('Adding new message to UI:', newMessage);
            
            // Check if we already have a temporary message with the same content
            // This prevents duplicate messages when we've already added a temp message
            setMessages(prevMessages => {
              // Look for temp messages with the same text and user_id
              const hasTempMessage = prevMessages.some(msg => 
                msg.id.toString().startsWith('temp-') && 
                msg.text === newMessage.text && 
                msg.user_id === newMessage.user_id &&
                // Only consider messages created in the last minute as potential duplicates
                (new Date().getTime() - new Date(msg.created_at).getTime() < 60000)
              );
              
              if (hasTempMessage) {
                // Replace the temp message with the real one
                return prevMessages
                  .filter(msg => !(
                    msg.id.toString().startsWith('temp-') && 
                    msg.text === newMessage.text && 
                    msg.user_id === newMessage.user_id
                  ))
                  .concat(newMessage);
              } else {
                // Just add the new message
                return [...prevMessages, newMessage];
              }
            });
          } catch (err) {
            console.error('Error processing real-time message:', err);
          }
        }
      );
    
    // Start the subscription and handle connection status
    channel.subscribe((status) => {
      console.log(`Real-time subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to real-time updates for band:', bandId);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to real-time updates');
      }
    });

    return () => {
      // Clean up subscription
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [bandId, fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
