"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/SupabaseContext';

export interface BandMember {
  id: string;
  band_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
    instruments?: string[];
    genres?: string[];
  };
}

export function useBandMembers(bandId: string) {
  const [members, setMembers] = useState<BandMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch members for a band
  const fetchMembers = useCallback(async () => {
    if (!user || !bandId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch band members with their user profiles
      const { data, error } = await supabase
        .from('band_members')
        .select(`
          id,
          band_id,
          user_id,
          role,
          joined_at,
          user:profiles!user_id(id, full_name, avatar_url, instruments, genres)
        `)
        .eq('band_id', bandId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.log('Error fetching band members:', error);
        // Check if it's a 'relation does not exist' error, which means the table hasn't been created yet
        if (error.message && (error.message.includes('does not exist') || error.message.includes('relation'))) {
          setMembers([]);
        } else {
          setError(new Error(error.message || 'Failed to fetch band members'));
        }
        setIsLoading(false);
        return;
      }

      if (!data) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      // Format the data to match our interface
      try {
        console.log('Raw band members data:', data);
        // The data should already be properly formatted with the user field
        // We're just ensuring the data structure is consistent
        const formattedMembers = data.map((member: any) => ({
          id: member.id,
          band_id: member.band_id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          user: member.user // This should now be correctly populated from the query
        }));
        
        console.log('Formatted members:', formattedMembers);
        setMembers(formattedMembers);
      } catch (formatError) {
        console.log('Error formatting member data:', formatError);
        setMembers([]);
      }
    } catch (err) {
      console.error('Unexpected error fetching band members:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch band members'));
    } finally {
      setIsLoading(false);
    }
  }, [bandId, user]);

  // Add a member to the band
  const addMember = useCallback(async (userId: string, role: string = 'member') => {
    if (!user) {
      throw new Error('User must be authenticated to add band members');
    }

    try {
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
        console.error('Error adding band member:', error);
        throw error;
      }

      // Refresh the members list
      await fetchMembers();

      return data;
    } catch (err) {
      console.error('Error in addMember:', err);
      throw err;
    }
  }, [bandId, user, fetchMembers]);

  // Remove a member from the band
  const removeMember = useCallback(async (memberId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to remove band members');
    }

    try {
      const { error } = await supabase
        .from('band_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing band member:', error);
        throw error;
      }

      // Refresh the members list
      await fetchMembers();
    } catch (err) {
      console.error('Error in removeMember:', err);
      throw err;
    }
  }, [bandId, user, fetchMembers]);
  
  // Leave a band (current user leaves the band)
  const leaveBand = useCallback(async () => {
    if (!user) {
      throw new Error('User must be authenticated to leave a band');
    }

    try {
      console.log('User attempting to leave band:', bandId);
      
      // Find the member record for the current user
      const { data: memberData, error: memberError } = await supabase
        .from('band_members')
        .select('id, role')
        .eq('band_id', bandId)
        .eq('user_id', user.id)
        .single();
      
      if (memberError) {
        console.error('Error finding member record:', memberError);
        throw memberError;
      }
      
      if (!memberData) {
        throw new Error('You are not a member of this band');
      }
      
      // Check if the user is the creator/admin of the band
      if (memberData.role === 'creator') {
        throw new Error('Band creators cannot leave their band. You must transfer ownership first or delete the band.');
      }
      
      // Delete the member record
      const { error: deleteError } = await supabase
        .from('band_members')
        .delete()
        .eq('id', memberData.id);

      if (deleteError) {
        console.error('Error leaving band:', deleteError);
        throw deleteError;
      }

      console.log('Successfully left band:', bandId);
      return { success: true };
    } catch (err) {
      console.error('Error in leaveBand:', err);
      throw err;
    }
  }, [bandId, user]);

  // Search for users to add to the band
  const searchUsers = useCallback(async (query: string) => {
    if (!user) {
      console.log('User not authenticated for search');
      return [];
    }

    try {
      console.log('Searching for users with query:', query);
      
      // Use a direct RPC call to bypass RLS issues
      // This will use the function we'll create in Supabase
      const { data, error } = await supabase
        .rpc('search_profiles', { 
          search_query: query.toLowerCase()
        });

      if (error) {
        console.log('Error searching users via RPC:', error);
        
        // Fallback to direct query if RPC fails
        console.log('Trying direct query as fallback...');
        const { data: directData, error: directError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, instruments, genres')
          .limit(20);
          
        if (directError) {
          console.log('Error in direct query:', directError);
          return [];
        }
        
        if (directData && directData.length > 0) {
          console.log('Found users in direct query:', directData.length);
          
          // Filter out users who are already members
          const existingMemberIds = members.map(member => member.user_id);
          const filteredUsers = directData.filter(user => !existingMemberIds.includes(user.id));
          
          return filteredUsers;
        }
        
        return [];
      }

      if (!data || data.length === 0) {
        console.log('No users found matching query:', query);
        
        // If no results, get all users
        const { data: allUsers, error: allError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, instruments, genres')
          .limit(20);
          
        if (allError) {
          console.log('Error fetching all users:', allError);
          return [];
        }
        
        if (allUsers && allUsers.length > 0) {
          console.log('Found users in all users query:', allUsers.length);
          
          // Filter out users who are already members
          const existingMemberIds = members.map(member => member.user_id);
          const filteredUsers = allUsers.filter(user => !existingMemberIds.includes(user.id));
          
          return filteredUsers;
        }
        
        return [];
      }

      console.log('Found users matching query:', data.length);
      
      // Filter out users who are already members
      const existingMemberIds = members.map(member => member.user_id);
      const filteredUsers = data.filter((user: any) => !existingMemberIds.includes(user.id));

      return filteredUsers;
    } catch (err) {
      console.log('Error in searchUsers:', err);
      return [];
    }
  }, [user, members]);

  // Initialize by fetching members
  useEffect(() => {
    if (bandId) {
      fetchMembers();

      // Set up real-time subscription for member updates
      const channel = supabase
        .channel(`band_members_${bandId}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'band_members',
            filter: `band_id=eq.${bandId}`
          }, 
          () => {
            // Refresh members when changes occur
            fetchMembers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [bandId, fetchMembers]);

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    addMember,
    removeMember,
    leaveBand,
    searchUsers
  };
}
