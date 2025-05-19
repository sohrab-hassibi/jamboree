import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
// No need for auth helpers, we'll use the auth state directly

interface Participant {
  id: string
  full_name: string
  avatar_url: string
  instruments?: string[]
  genres?: string[]
}

interface EventParticipation {
  status: 'going' | 'maybe' | null
  isLoading: boolean
  handleGoing: () => Promise<void>
  handleMaybe: () => Promise<void>
  participants: {
    going: Participant[]
    maybe: Participant[]
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
  type Participant = { 
    id: string; 
    full_name: string; 
    avatar_url: string;
    instruments: string[];
    genres: string[];
  };

  type ParticipantsState = {
    going: Participant[];
    maybe: Participant[];
  };

  const [participants, setParticipants] = useState<ParticipantsState>({ going: [], maybe: [] });

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
        const parseParticipant = (p: unknown): Participant => {
          const defaultParticipant: Participant = {
            id: 'unknown',
            full_name: 'User',
            avatar_url: '/placeholder.svg',
            instruments: [],
            genres: []
          };
          
          if (!p) return defaultParticipant;
          
          // Handle string input (JSON)
          if (typeof p === 'string') {
            try {
              const parsed = JSON.parse(p);
              if (parsed && typeof parsed === 'object' && 'id' in parsed) {
                return {
                  id: String(parsed.id || 'unknown'),
                  full_name: (parsed as any).full_name || 'User',
                  avatar_url: (parsed as any).avatar_url || '/placeholder.svg',
                  instruments: Array.isArray((parsed as any).instruments) 
                    ? (parsed as any).instruments.map(String) 
                    : [],
                  genres: Array.isArray((parsed as any).genres) 
                    ? (parsed as any).genres.map(String) 
                    : []
                };
              }
              return { 
                ...defaultParticipant,
                id: p || 'unknown'
              };
            } catch (e) {
              return { 
                ...defaultParticipant,
                id: p || 'unknown'
              };
            }
          }
          
          // Handle object input
          if (typeof p === 'object' && p !== null && 'id' in p) {
            const participant = p as Record<string, unknown>;
            return {
              id: String(participant.id || 'unknown'),
              full_name: typeof participant.full_name === 'string' ? participant.full_name : 'User',
              avatar_url: typeof participant.avatar_url === 'string' ? participant.avatar_url : '/placeholder.svg',
              instruments: Array.isArray(participant.instruments) 
                ? participant.instruments.map(String) 
                : [],
              genres: Array.isArray(participant.genres) 
                ? participant.genres.map(String) 
                : []
            };
          }
          
          return defaultParticipant;
        }

        const going: Participant[] = Array.isArray(data.participants_going) 
          ? data.participants_going.map(parseParticipant)
          : [];
          
        const maybe: Participant[] = Array.isArray(data.participants_maybe)
          ? data.participants_maybe.map(parseParticipant)
          : [];

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

      // Get user's profile data for instruments and genres
      const { data: userProfileData, error: profileDataError } = await supabase
        .from('profiles')
        .select('instruments, genres')
        .eq('id', userId)
        .single();

      if (profileDataError) {
        console.error('Error fetching user profile data:', profileDataError);
        // Don't throw, we'll just use empty arrays
      }

      console.log('User profile data:', userProfileData);

      // Create participant object with required fields and additional data
      const participant = {
        id: userProfile.id,
        full_name: userProfile.full_name || 'User',
        avatar_url: userProfile.avatar_url || '/placeholder.svg',
        instruments: userProfileData?.instruments || [],
        genres: userProfileData?.genres || []
      };
      
      console.log('Created participant object:', participant);
      
      // Helper to parse participant data
      const parseParticipant = (p: any) => {
        if (!p) return null;
        
        // If it's a string, try to parse it as JSON
        if (typeof p === 'string') {
          try {
            const parsed = JSON.parse(p);
            // Ensure we have the required fields
            return {
              id: parsed.id || 'unknown',
              full_name: parsed.full_name || 'User',
              avatar_url: parsed.avatar_url || '/placeholder.svg',
              instruments: Array.isArray(parsed.instruments) ? parsed.instruments : [],
              genres: Array.isArray(parsed.genres) ? parsed.genres : []
            };
          } catch {
            // If parsing fails, return a basic participant object
            return { 
              id: p, 
              full_name: 'User', 
              avatar_url: '/placeholder.svg',
              instruments: [],
              genres: [] 
            };
          }
        }
        
        // If it's already an object, ensure it has the required fields
        if (typeof p === 'object' && p !== null) {
          return {
            id: p.id || 'unknown',
            full_name: p.full_name || 'User',
            avatar_url: p.avatar_url || '/placeholder.svg',
            instruments: Array.isArray(p.instruments) ? p.instruments : [],
            genres: Array.isArray(p.genres) ? p.genres : []
          };
        }
        
        // Default fallback
        return { 
          id: 'unknown', 
          full_name: 'User', 
          avatar_url: '/placeholder.svg',
          instruments: [],
          genres: [] 
        };
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
      type Participant = { 
        id: string; 
        full_name: string; 
        avatar_url: string;
        instruments: string[];
        genres: string[];
      };
      const processParticipants = (participants: any[] = []): Participant[] => 
        participants
          .map(parseParticipant)
          .filter((p: any): p is Participant => p !== null)
          .map(p => ({
            id: p.id,
            full_name: p.full_name || 'User',
            avatar_url: p.avatar_url || '/placeholder.svg',
            instruments: Array.isArray(p.instruments) ? p.instruments : [],
            genres: Array.isArray(p.genres) ? p.genres : []
          }));

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
