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

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
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
          .from('profiles')  // Fetch user data from the profiles table
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
          messages.forEach((message: any) => {
            message.user = userMap[message.user_id] || undefined;
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
      
      // Create a temporary message object with a temporary ID
      const tempId = `temp-${Date.now()}`;
      const tempMessage: ChatMessage = {
        id: tempId,
        event_id: eventId,
        user_id: user.id,
        text,
        created_at: new Date().toISOString(),
        user: {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'You',
          avatar_url: user.avatar_url || user.user_metadata?.avatar_url || '/placeholder.svg'
        }
      };
      
      // Immediately add the message to the local state for instant feedback
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Then send it to the database
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
        
        // Remove the temporary message if there was an error
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      // The real message will be added by the subscription, and we'll filter out the temp message
      // when we receive the real one with the same text and user_id
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
            // When we receive a new message, fetch the user data from profiles table
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', payload.new.user_id)
              .single();

            if (userError) {
              console.warn('Error fetching user data for message:', userError);
            }
            
            // Create a properly typed ChatMessage object
            const newMessage: ChatMessage = {
              id: payload.new.id,
              event_id: payload.new.event_id,
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
