import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
// No need for auth helpers, we'll use the auth state directly

interface EventParticipation {
  status: 'going' | 'maybe' | null
  isLoading: boolean
  handleGoing: () => Promise<void>
  handleMaybe: () => Promise<void>
  participants: {
    going: Array<{ id: string; full_name: string; avatar_url: string }>
    maybe: Array<{ id: string; full_name: string; avatar_url: string }>
  }
}

export function useEventParticipation(eventId: string): EventParticipation {
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);
  const [participationStatus, setParticipationStatus] = useState<'going' | 'maybe' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<{
    going: Array<{ id: string; full_name: string; avatar_url: string }>
    maybe: Array<{ id: string; full_name: string; avatar_url: string }>
  }>({ going: [], maybe: [] });

  // Load participation status from database
  const loadParticipation = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('participants_going, participants_maybe')
        .eq('id', eventId)
        .single()

      if (error) {
        console.error('Error fetching event data:', error)
        return
      }

      if (data) {
        type Participant = { id: string; full_name: string; avatar_url: string };
        const parseParticipant = (p: unknown): Participant | null => {
          if (!p) return null;
          
          // Handle string input (JSON)
          if (typeof p === 'string') {
            try {
              const parsed = JSON.parse(p);
              if (parsed && typeof parsed === 'object' && 'id' in parsed) {
                return {
                  id: String(parsed.id),
                  full_name: (parsed as any).full_name || 'User',
                  avatar_url: (parsed as any).avatar_url || '/placeholder.svg'
                };
              }
              return { 
                id: p, 
                full_name: 'User', 
                avatar_url: '/placeholder.svg' 
              };
            } catch (e) {
              return { 
                id: p, 
                full_name: 'User', 
                avatar_url: '/placeholder.svg' 
              };
            }
          }
          
          // Handle object input
          if (typeof p === 'object' && p !== null && 'id' in p) {
            const participant = p as Record<string, unknown>;
            return {
              id: String(participant.id),
              full_name: typeof participant.full_name === 'string' ? participant.full_name : 'User',
              avatar_url: typeof participant.avatar_url === 'string' ? participant.avatar_url : '/placeholder.svg'
            };
          }
          
          return null;
        }

        const going = (Array.isArray(data.participants_going) 
          ? data.participants_going.map(parseParticipant)
          : []).filter((p: Participant | null): p is Participant => p !== null);
          
        const maybe = (Array.isArray(data.participants_maybe)
          ? data.participants_maybe.map(parseParticipant)
          : []).filter((p: Participant | null): p is Participant => p !== null);

        console.log('Loaded participants:', { going, maybe });
        setParticipants({ going, maybe });

        // Update participation status
        if (going.some((p: Participant) => p.id === userId)) {
          setParticipationStatus('going');
        } else if (maybe.some((p: Participant) => p.id === userId)) {
          setParticipationStatus('maybe');
        } else {
          setParticipationStatus(null);
        }
      }
    } catch (error) {
      console.error('Error loading participation:', error)
    } finally {
      setIsLoading(false)
    }
  }, [eventId, userId]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadParticipation();
    }
  }, [userId, loadParticipation]);

  // Subscribe to changes
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`event_${eventId}_changes`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'events',
        filter: `id=eq.${eventId}`
      }, (payload) => {
        loadParticipation();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, loadParticipation]);

  const updateParticipation = useCallback(async (status: 'going' | 'maybe' | null) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    console.log('Starting updateParticipation:', { userId, eventId, status });
    
    try {
      setIsLoading(true);
      
      // First, get the current user's profile
      console.log('Fetching user profile for:', userId);
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }
      
      if (!userProfile) {
        const error = new Error('User profile not found');
        console.error(error.message);
        throw error;
      }

      console.log('User profile found:', userProfile);

      // Create participant object with required fields
      const participant = {
        id: userProfile.id,
        full_name: userProfile.full_name || 'User',
        avatar_url: userProfile.avatar_url || '/placeholder.svg'
      };
      
      console.log('Created participant object:', participant);
      
      // Helper to parse participant data
      const parseParticipant = (p: any) => {
        if (!p) return null;
        if (typeof p === 'string') {
          try {
            return JSON.parse(p);
          } catch {
            return { id: p };
          }
        }
        return p;
      };

      // Get current event data
      const { data: eventData, error: fetchError } = await supabase
        .from('events')
        .select('participants_going, participants_maybe')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        console.error('Error fetching event data:', fetchError);
        throw fetchError;
      }

      // Process current participants
      type Participant = { id: string; full_name: string; avatar_url: string };
      const processParticipants = (participants: any[] = []): Participant[] => 
        participants
          .map(parseParticipant)
          .filter((p: Participant | null): p is Participant => p !== null);

      let updatedGoing = processParticipants(eventData.participants_going);
      let updatedMaybe = processParticipants(eventData.participants_maybe);

      // Remove user from both arrays first
      updatedGoing = updatedGoing.filter(p => p.id !== userId);
      updatedMaybe = updatedMaybe.filter(p => p.id !== userId);

      // Add to the appropriate array if status is not null
      if (status === 'going') {
        console.log('Adding user to going list');
        updatedGoing.push(participant);
      } else if (status === 'maybe') {
        console.log('Adding user to maybe list');
        updatedMaybe.push(participant);
      }
      
      console.log('Updated participant arrays:', {
        updatedGoing,
        updatedMaybe
      });

      // Stringify the participant objects for storage
      const stringifyParticipants = (participants: any[]) => 
        participants.map(p => JSON.stringify(p));

      // Update the event with the new participant arrays
      const updateData = {
        participants_going: stringifyParticipants(updatedGoing),
        participants_maybe: stringifyParticipants(updatedMaybe),
        updated_at: new Date().toISOString()
      };
      
      console.log('Update data being sent:', JSON.stringify(updateData, null, 2));
      
      // Update the event
      const { error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId);

      if (updateError) {
        console.error('Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }
      
      console.log('Successfully updated event');

      // Update local state
      setParticipants({
        going: updatedGoing,
        maybe: updatedMaybe
      });
      setParticipationStatus(status);
      
    } catch (error) {
      console.error('Error in updateParticipation:', error);
      // Reload participation data to ensure consistency
      await loadParticipation();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, userId, loadParticipation]);

  const handleGoing = useCallback(async () => {
    const newStatus = participationStatus === 'going' ? null : 'going';
    await updateParticipation(newStatus);
  }, [participationStatus, updateParticipation]);

  const handleMaybe = useCallback(async () => {
    const newStatus = participationStatus === 'maybe' ? null : 'maybe';
    await updateParticipation(newStatus);
  }, [participationStatus, updateParticipation]);

  return {
    status: participationStatus,
    isLoading,
    handleGoing,
    handleMaybe,
    participants
  };
}
