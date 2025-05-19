import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/SupabaseContext';

export interface UserEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  image_url?: string;
  creator_id: string;
  participationStatus: 'going' | 'maybe';
  isPast?: boolean;
}

export function useUserEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState<UserEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<UserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchUserEvents = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const now = new Date().toISOString();
      
      // Fetch upcoming events
      const { data: upcomingEventsData, error: upcomingError } = await supabase
        .from('events')
        .select('*')
        .gt('start_time', now) // Only get upcoming events
        .order('start_time', { ascending: true });

      if (upcomingError) throw upcomingError;
      
      // Fetch past events
      const { data: pastEventsData, error: pastError } = await supabase
        .from('events')
        .select('*')
        .lte('start_time', now) // Only get past events
        .order('start_time', { ascending: false }); // Most recent first

      if (pastError) throw pastError;

      // Process events to determine user participation
      const processEvents = (events: any[], isPast: boolean) => {
        const userEvents = [];
        
        for (const event of events || []) {
          const goingParticipants = event.participants_going || [];
          const maybeParticipants = event.participants_maybe || [];
          
          // Parse participants if they're stored as strings
          const parsedGoingParticipants = goingParticipants.map((p: any) => {
            if (typeof p === 'string') {
              try {
                return JSON.parse(p);
              } catch (e) {
                console.error('Error parsing participant:', e);
                return null;
              }
            }
            return p;
          }).filter(Boolean);
          
          const parsedMaybeParticipants = maybeParticipants.map((p: any) => {
            if (typeof p === 'string') {
              try {
                return JSON.parse(p);
              } catch (e) {
                console.error('Error parsing participant:', e);
                return null;
              }
            }
            return p;
          }).filter(Boolean);

          // Check if user is in going participants
          const isGoing = parsedGoingParticipants.some(
            (p: any) => p && p.id === user.id
          );
          
          // Check if user is in maybe participants
          const isMaybe = parsedMaybeParticipants.some(
            (p: any) => p && p.id === user.id
          );
          
          if (isGoing || isMaybe) {
            userEvents.push({
              ...event,
              participationStatus: isGoing ? 'going' : 'maybe',
              isPast
            });
          }
        }
        
        return userEvents;
      };
      
      // Process upcoming and past events
      const userUpcomingEvents = processEvents(upcomingEventsData || [], false);
      const userPastEvents = processEvents(pastEventsData || [], true);
      
      setUpcomingEvents(userUpcomingEvents);
      setPastEvents(userPastEvents);
    } catch (err) {
      console.error('Error fetching user events:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return {
    upcomingEvents,
    pastEvents,
    isLoading,
    error,
    refetch: fetchUserEvents,
  };
}
