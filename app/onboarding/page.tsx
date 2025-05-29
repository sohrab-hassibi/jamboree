"use client";

import OnboardingFlow from "@/components/onboarding/onboarding-flow";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/SupabaseContext";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user has already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('instruments, genres, bio, avatar_url')
        .eq('id', user.id)
        .single();

      // Only redirect if ALL onboarding steps are completed
      if (profile && 
          profile.instruments?.length > 0 && 
          profile.genres?.length > 0 && 
          profile.bio && 
          profile.avatar_url
      ) {
        router.push('/dashboard');
      }
    };

    checkOnboardingStatus();
  }, [user, router]);

  if (!user) return null;

  return <OnboardingFlow />;
} 