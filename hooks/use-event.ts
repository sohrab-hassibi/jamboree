import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Participant {
  id: string;
  full_name: string;
  avatar_url: string;
  instruments?: string[];
  genres?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  image_url?: string; // Updated to match database schema
  image?: string; // Keep for backward compatibility
  created_at: string;
  updated_at: string;
  participants_going: Participant[];
  participants_maybe: Participant[];
  slug: string;
  creator_id: string;
}

interface SupabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

// Helper function to fetch user details
const fetchUserDetails = async (userId: string): Promise<Participant> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user details:', error);
    return {
      id: userId,
      full_name: 'Unknown User',
      avatar_url: '/placeholder.svg'
    };
  }

  return {
    id: data.id,
    full_name: data.full_name || 'User',
    avatar_url: data.avatar_url // Use actual profile image URL
  };
};

export const useEvent = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<{
    going: Participant[];
    maybe: Participant[];
  }>({ going: [], maybe: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper to parse participant data (handles both string and object formats)
  const parseParticipant = useCallback((p: any): Participant | null => {
    if (!p) return null;
    
    try {
      // If it's a string, try to parse it as JSON
      if (typeof p === 'string') {
        const parsed = JSON.parse(p);
        return {
          id: parsed.id,
          full_name: parsed.full_name || 'User',
          avatar_url: parsed.avatar_url || '/placeholder.svg'
        };
      }
      
      // If it's already an object with an id
      if (p && typeof p === 'object' && p.id) {
        return {
          id: p.id,
          full_name: p.full_name || 'User',
          avatar_url: p.avatar_url || '/placeholder.svg'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing participant:', p, error);
      return null;
    }
  }, []);

  const fetchParticipants = useCallback(async (participants: any[]): Promise<Participant[]> => {
    if (!participants || !participants.length) return [];
    
    // Parse all participants first
    const parsedParticipants = participants
      .map(parseParticipant)
      .filter((p): p is Participant => p !== null);
      
    if (!parsedParticipants.length) return [];
    
    // Get unique user IDs
    const userIds = [...new Set(parsedParticipants.map(p => p.id))];
    
    try {
      // Only fetch users that we don't have complete data for
      const usersToFetch = parsedParticipants.filter(p => !p.full_name || p.full_name === 'User' || !p.avatar_url);
      const userIdsToFetch = [...new Set(usersToFetch.map(p => p.id))];
      
      if (userIdsToFetch.length > 0) {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIdsToFetch);

        if (error) {
          console.error('Error fetching participants:', error);
          return parsedParticipants; // Return what we have
        }

        // Create a map of user data
        const userMap = new Map(users.map(user => [user.id, {
          id: user.id,
          full_name: user.full_name || 'User',
          avatar_url: user.avatar_url || '/placeholder.svg'
        }]));

        // Update the participants with user data
        return parsedParticipants.map(p => ({
          ...p,
          ...(userMap.get(p.id) || {})
        }));
      }
      
      return parsedParticipants;
        
    } catch (error) {
      console.error('Error in fetchParticipants:', error);
      return parsedParticipants; // Return what we have
    }
  }, [parseParticipant]);

  useEffect(() => {
    if (!eventId) {
      setError(new Error('No event ID provided'));
      setIsLoading(false);
      return;
    }

    const fetchEvent = async () => {
      if (!eventId) return;

      setIsLoading(true);
      try {
        // First, get the basic event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        // Process participants_going and participants_maybe arrays
        const processParticipants = async (participants: any[] | undefined): Promise<Participant[]> => {
          if (!Array.isArray(participants) || !participants.length) return [];
          
          // If participants are already in the correct format, return them
          if (participants.every(p => p && typeof p === 'object' && 'id' in p && 'full_name' in p)) {
            return participants.map(p => ({
              id: p.id,
              full_name: p.full_name || 'User',
              avatar_url: p.avatar_url || '/placeholder.svg'
            }));
          }
          
          // Otherwise, fetch user details
          return fetchParticipants(participants);
        };

        // Process both participant arrays in parallel
        const [participantsGoing, participantsMaybe] = await Promise.all([
          processParticipants(eventData.participants_going),
          processParticipants(eventData.participants_maybe)
        ]);

        // Update state with the full participant data
        setEvent({
          ...eventData,
          participants_going: participantsGoing,
          participants_maybe: participantsMaybe
        });
        
        setParticipants({
          going: participantsGoing,
          maybe: participantsMaybe
        });
        
        console.log('Event data loaded:', {
          event: eventData,
          participants: {
            going: participantsGoing,
            maybe: participantsMaybe
          }
        });
      } catch (err) {
        const error = err instanceof Error 
          ? err 
          : new Error('Failed to fetch event');
        
        console.error('Error in useEvent:', {
          message: error.message,
          name: error.name,
          ...(error as any).code && { code: (error as any).code },
          ...(error as any).details && { details: (error as any).details },
          ...(error as any).hint && { hint: (error as any).hint },
        });
        
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const isNotFound = error?.message?.includes('not found') || error?.message?.includes('404');

  return {
    event,
    participants,
    isLoading,
    error,
    isNotFound,
  };
};

export default useEvent;
