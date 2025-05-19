import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/SupabaseContext';

export interface ChatMessage {
  id: string;
  event_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export function useEventChat(eventId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching messages for event:', eventId);
      
      // Step 1: First, try a simple query without joins to check basic access
      const { data: simpleData, error: simpleError } = await supabase
        .from('event_messages')
        .select('id, event_id, user_id, text, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (simpleError) {
        console.error('Basic query error:', {
          code: simpleError.code,
          message: simpleError.message,
          details: simpleError.details,
          hint: simpleError.hint
        });
        throw simpleError;
      }
      
      // Step 2: If the simple query worked, fetch user data separately
      const messages = simpleData || [];
      
      // Get unique user IDs from messages
      const userIds = [...new Set(messages.map(m => m.user_id))];
      
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')  // Assuming your user profiles are in a table called 'profiles'
          .select('id, full_name, avatar_url')
          .in('id', userIds);
          
        if (userError) {
          console.warn('Error fetching user data:', userError);
          // Continue anyway, we'll just show messages without user data
        }
        
        // Map users to messages
        if (userData) {
          // Define a proper interface for the user data
          interface UserProfile {
            id: string;
            full_name: string;
            avatar_url: string;
          }
          
          // Use Record type for the map with proper typing
          const userMap: Record<string, UserProfile> = {};
          userData.forEach((user: UserProfile) => {
            userMap[user.id] = user;
          });
          
          // Attach user data to messages
          messages.forEach(message => {
            message.user = userMap[message.user_id] || null;
          });
        }
      }
      
      setMessages(messages);
      console.log('Successfully fetched', messages.length, 'messages');
      
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
  }, [eventId]);

  // Send a new message
  const sendMessage = useCallback(async (text: string) => {
    if (!user) {
      console.error('Cannot send message: User not authenticated');
      return { error: new Error('User not authenticated') };
    }
    
    try {
      console.log('Sending message for event:', eventId, 'user:', user.id);
      
      // Simplify the insert - don't try to fetch related data in the same query
      const { data, error } = await supabase
        .from('event_messages')
        .insert([
          {
            event_id: eventId,
            user_id: user.id,
            text,
          },
        ])
        .select('id');  // Just get the ID to confirm insertion

      if (error) {
        console.error('Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      // Don't need to update state as the subscription will handle this
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error sending message:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      } else {
        console.error('Unknown error type when sending message:', typeof err, 'Error:', JSON.stringify(err));
      }
      return { error: err instanceof Error ? err : new Error(JSON.stringify(err) || 'Unknown error') };
    }
    
    return { success: true };
  }, [eventId, user]);

  // Subscribe to new messages
  useEffect(() => {
    fetchMessages();

    console.log('Setting up real-time subscription for event:', eventId);
    
    // Set up realtime subscription with improved error handling
    const channel = supabase
      .channel(`event_messages_${eventId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'event_messages',
          filter: `event_id=eq.${eventId}`
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
            
            const newMessage = {
              ...payload.new,
              user: userData || null
            };

            console.log('Adding new message to UI:', newMessage);
            setMessages(prevMessages => [...prevMessages, newMessage as ChatMessage]);
          } catch (err) {
            console.error('Error processing real-time message:', err);
          }
        }
      );
    
    // Start the subscription and handle connection status
    channel.subscribe((status) => {
      console.log(`Real-time subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to real-time updates for event:', eventId);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to real-time updates');
      }
    });

    return () => {
      // Clean up subscription
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
