"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ProfileScreen } from "@/components/screens/profile-view-screen";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ProfileLayout } from "@/components/layout/profile-layout";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserExists() {
      try {
        setLoading(true);
        
        // Check if user exists in the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user:', error);
          setError('Failed to load user profile');
          return;
        }

        // If no data but no error, or PGRST116 (not found), check if the user exists in auth
        if (!data) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('Error checking user in users table:', userError);
            setError('Failed to load user profile');
            return;
          }

          // Set userExists based on whether we found a user
          setUserExists(!!userData);
        } else {
          // User exists in the profiles table
          setUserExists(true);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      checkUserExists();
    }
  }, [userId]);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffac6d]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
      </div>
    );
  }

  if (!userExists) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <ProfileLayout isCurrentUser={false}>
      <ProfileScreen userId={userId} isCurrentUser={false} />
    </ProfileLayout>
  );
}
