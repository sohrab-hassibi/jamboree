"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/SupabaseContext';

export interface BandLastMessage {
  id: string;
  band_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user_full_name?: string;
}

export interface Band {
  id: string;
  name: string;
  description?: string;
  creator_id?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  member_count?: number;
  last_message?: BandLastMessage;
}

export function useBands() {
  const [bands, setBands] = useState<Band[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Helper function to fetch the last message for each band
  const fetchLastMessagesForBands = async (bands: Band[]): Promise<Band[]> => {
    if (bands.length === 0) return bands;
    
    try {
      // Get all band IDs
      const bandIds = bands.map(band => band.id);
      
      // For each band, fetch the most recent message
      const lastMessagesPromises = bandIds.map(async (bandId) => {
        const { data, error } = await supabase
          .from('band_messages')
          .select('id, band_id, user_id, text, created_at')
          .eq('band_id', bandId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error || !data || data.length === 0) {
          console.log(`No messages for band ${bandId} or error:`, error);
          return null;
        }
        
        // Get user details for the message sender
        const message = data[0];
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', message.user_id)
          .single();
        
        if (!userError && userData) {
          return {
            ...message,
            user_full_name: userData.full_name
          };
        }
        
        return message;
      });
      
      // Wait for all promises to resolve
      const lastMessages = await Promise.all(lastMessagesPromises);
      
      // Combine bands with their last messages
      return bands.map((band, index) => ({
        ...band,
        last_message: lastMessages[index] || undefined
      }));
    } catch (err) {
      console.error('Error fetching last messages:', err);
      return bands; // Return original bands if there's an error
    }
  };
  
  // Fetch bands the user is a member of
  const fetchBands = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // First, get all band IDs where the user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('band_members')
        .select('band_id')
        .eq('user_id', user.id);
      
      if (memberError) {
        console.log('Error fetching band memberships:', memberError);
        setError(new Error(memberError.message || 'Failed to fetch band memberships'));
        setBands([]);
        return;
      }
      
      // If user is not a member of any bands, return empty array
      if (!memberData || memberData.length === 0) {
        console.log('User is not a member of any bands');
        setBands([]);
        setIsLoading(false);
        return;
      }
      
      // Extract band IDs from membership data
      const bandIds = memberData.map(member => member.band_id);
      console.log('User is a member of these bands:', bandIds);
      
      // Fetch the bands where user is a member
      const { data, error } = await supabase
        .from('bands')
        .select('*')
        .in('id', bandIds)
        .order('updated_at', { ascending: false });
      
      // Handle any errors gracefully
      if (error) {
        console.log('Error fetching bands:', error);
        setError(new Error(error.message || 'Failed to fetch bands'));
        setBands([]);
        return;
      }
      
      // The data should already be in the right format
      const bands = data || [];
      
      console.log('Fetched bands:', bands);
      
      // Fetch the last message for each band
      const bandsWithLastMessages = await fetchLastMessagesForBands(bands);
      
      setBands(bandsWithLastMessages);
    } catch (err) {
      console.error('Error in fetchBands:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a new band
  const createBand = useCallback(async (bandInfo: { name: string; description?: string }) => {
    if (!user) {
      return { error: new Error('User must be authenticated to create a band') };
    }

    try {
      // Create the band with a simpler approach to avoid RLS issues
      const { data: bandData, error: bandError } = await supabase
        .from('bands')
        .insert([
          {
            name: bandInfo.name,
            description: bandInfo.description || null,
            creator_id: user.id,
            image_url: '/placeholder.svg?height=200&width=400' // Default placeholder image
          }
        ])
        .select('id, name, description, creator_id, image_url, created_at, updated_at')
        .single();

      if (bandError) {
        console.log('Error creating band:', bandError);
        return { error: new Error(bandError.message || 'Failed to create band') };
      }
      
      // Return success and include the addBandMember function
      // This allows the create-band-screen to add members after band creation
      await fetchBands();
      return { 
        band: bandData, 
        error: null, 
        addBandMember: (bandId: string, userId: string, role: string = 'member') => addBandMember(bandId, userId, role)
      };
    } catch (err) {
      console.log('Error in createBand:', err);
      return { error: err instanceof Error ? err : new Error('Failed to create band') };
    }
  }, [user, fetchBands]);

  // Add a member to a band
  const addBandMember = useCallback(async (bandId: string, userId: string, role: string = 'member') => {
    if (!user) {
      return { error: new Error('User must be authenticated to add band members') };
    }

    try {
      // Check if the user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('band_members')
        .select('id')
        .eq('band_id', bandId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.log('Error checking existing member:', checkError);
        return { error: new Error(checkError.message || 'Failed to check if user is already a member') };
      }
      
      // If user is already a member, return success
      if (existingMember) {
        return { success: true, message: 'User is already a member of this band' };
      }
      
      // Add the user as a member
      const { data, error } = await supabase
        .from('band_members')
        .insert([
          {
            band_id: bandId,
            user_id: userId,
            role
          }
        ])
        .select();

      if (error) {
        console.log('Error adding band member:', error);
        return { error: new Error(error.message || 'Failed to add band member') };
      }

      // Refresh the bands list
      await fetchBands();
      return { success: true, data };
    } catch (err) {
      console.log('Error in addBandMember:', err);
      return { error: err instanceof Error ? err : new Error('Failed to add band member') };
    }
  }, [user, fetchBands]);

  // Get a specific band
  const getBand = useCallback(async (bandId: string) => {
    if (!user) {
      return { error: new Error('User must be authenticated to view band details') };
    }

    try {
      const { data, error } = await supabase
        .from('bands')
        .select(`
          *,
          band_members(user_id, role, joined_at)
        `)
        .eq('id', bandId)
        .single();

      if (error) {
        console.log('Error fetching band details:', error);
        return { error: new Error(error.message || 'Failed to fetch band details') };
      }

      return { band: data, error: null };
    } catch (err) {
      console.log('Error in getBand:', err);
      return { error: err instanceof Error ? err : new Error('Failed to fetch band details') };
    }
  }, [user]);

  // Initialize by fetching bands
  useEffect(() => {
    fetchBands();
  }, [fetchBands]);

  return {
    bands,
    isLoading,
    error,
    fetchBands,
    createBand,
    addBandMember,
    getBand
  };
}
