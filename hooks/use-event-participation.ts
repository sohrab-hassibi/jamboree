import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentISOString } from "@/utils/date-utils";
import { useAuth } from '@/context/SupabaseContext';
import { EventParticipant, createStandardParticipant, parseParticipant, stringifyParticipant } from '@/types/event';
// No need for auth helpers, we'll use the auth state directly

export interface EventParticipation {
  status: 'going' | 'maybe' | null;
  isLoading: boolean;
  error: Error | null;
  handleGoing: () => Promise<void>;
  handleMaybe: () => Promise<void>;
  participants: {
    going: EventParticipant[];
    maybe: EventParticipant[];
  };
}

export function useEventParticipation(eventId: string): EventParticipation {
  const [status, setStatus] = useState<'going' | 'maybe' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [participants, setParticipants] = useState<{
    going: EventParticipant[];
    maybe: EventParticipant[];
  }>({ going: [], maybe: [] });
  
  const { user } = useAuth();
  const userId = user?.id;

  // Function to update participation status
  const updateParticipation = useCallback(async (newStatus: 'going' | 'maybe' | null) => {
    if (!userId) {
      throw new Error('User must be logged in to update participation');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current event data
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('participants_going, participants_maybe')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Create standardized participant object
      const participant = createStandardParticipant({
        id: userId,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        instruments: profile.instruments,
        genres: profile.genres
      });

      // Parse existing participants
      const goingParticipants = (event.participants_going || [])
        .map(p => parseParticipant(p))
        .filter((p): p is EventParticipant => p !== null)
        .filter(p => p.id !== userId);

      const maybeParticipants = (event.participants_maybe || [])
        .map(p => parseParticipant(p))
        .filter((p): p is EventParticipant => p !== null)
        .filter(p => p.id !== userId);

      // Add user to appropriate list
      if (newStatus === 'going') {
        goingParticipants.push(participant);
      } else if (newStatus === 'maybe') {
        maybeParticipants.push(participant);
      }

      // Update event with new participant lists
      const { error: updateError } = await supabase
        .from('events')
        .update({
          participants_going: goingParticipants.map(stringifyParticipant),
          participants_maybe: maybeParticipants.map(stringifyParticipant),
          updated_at: getCurrentISOString()
        })
        .eq('id', eventId);

      if (updateError) throw updateError;

      // Update local state
      setStatus(newStatus);
      setParticipants({
        going: goingParticipants,
        maybe: maybeParticipants
      });

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update participation'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, userId]);

  // Handle going/maybe actions
  const handleGoing = useCallback(() => updateParticipation('going'), [updateParticipation]);
  const handleMaybe = useCallback(() => updateParticipation('maybe'), [updateParticipation]);

  // Load initial participation data
  useEffect(() => {
    async function loadParticipation() {
      if (!eventId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('participants_going, participants_maybe')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        // Parse participant lists
        const goingParticipants = (event.participants_going || [])
          .map(p => parseParticipant(p))
          .filter((p): p is EventParticipant => p !== null);

        const maybeParticipants = (event.participants_maybe || [])
          .map(p => parseParticipant(p))
          .filter((p): p is EventParticipant => p !== null);

        // Set participation status if user is logged in
        if (userId) {
          if (goingParticipants.some(p => p.id === userId)) {
            setStatus('going');
          } else if (maybeParticipants.some(p => p.id === userId)) {
            setStatus('maybe');
          } else {
            setStatus(null);
          }
        }

        setParticipants({
          going: goingParticipants,
          maybe: maybeParticipants
        });

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load participation data'));
      } finally {
        setIsLoading(false);
      }
    }

    loadParticipation();
  }, [eventId, userId]);

  return {
    status,
    isLoading,
    error,
    handleGoing,
    handleMaybe,
    participants
  };
}
