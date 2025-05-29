"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserEvents, type UserEvent } from "@/hooks/use-user-events";
import { formatDate, formatEventCardDate } from "@/utils/date-utils";
import Image from "next/image";

interface ProfileData {
  name: string;
  bio?: string;
  instruments?: string[];
  genres?: string[];
}

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedEvent: string | null;
  onOpenEvent: (eventId: string) => void;
  isViewingProfile?: boolean;
  isCurrentUser?: boolean;
}

export function Sidebar({
  activeScreen,
  setActiveScreen,
  selectedEvent,
  onOpenEvent,
  isViewingProfile = false,
  isCurrentUser = true,
}: SidebarProps) {
  const [profile, setProfile] = useState<ProfileData & { avatar_url?: string }>(
    { name: "" }
  );
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('No authenticated user found')
          return
        }
        
        console.log('Fetching sidebar profile for user:', user.id)
        
        // First try to get the name and avatar from user_metadata (from signup/auth)
        const userName = user.user_metadata?.full_name || ''
        const userAvatar = user.user_metadata?.avatar_url
        
        // Set basic profile immediately for better UX
        setProfile(prev => ({
          ...prev,
          name: userName || 'User',
          avatar_url: userAvatar
        }))
        
        // Then try to get the full profile with retry mechanism
        let profileData = null
        let attempts = 0
        const maxAttempts = 3
        
        while (!profileData && attempts < maxAttempts) {
          attempts++
          try {
            console.log(`Sidebar profile fetch attempt ${attempts}`)
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (error) {
              console.warn(`Sidebar profile fetch attempt ${attempts} failed:`, error)
              // Wait before retry
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            } else {
              profileData = data
              console.log('Sidebar profile data fetched successfully:', profileData)
            }
          } catch (err) {
            console.error(`Error in sidebar profile fetch attempt ${attempts}:`, err)
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
        
        // If we got profile data, update the state with complete info
        if (profileData) {
          setProfile({
            name: userName || profileData.full_name || 'User',
            bio: profileData.bio || '',
            instruments: profileData.instruments || [],
            genres: profileData.genres || [],
            // Prioritize the avatar from auth metadata as it's updated immediately
            avatar_url: userAvatar || profileData.avatar_url
          })
        }
        
        // Mark profile as loaded
        setProfileLoaded(true)
      } catch (err) {
        console.error('Unexpected error in sidebar fetchProfile:', err)
        // Set a basic profile as fallback
        setProfile(prev => ({
          ...prev,
          name: 'User'
        }))
        setProfileLoaded(true)
      }
    };

    // Set up realtime subscription for profile updates
    const channel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${(async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            return user?.id;
          })()}`,
        },
        async (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT"
          ) {
            // When profile changes, get the latest auth metadata too
            const {
              data: { user },
            } = await supabase.auth.getUser();
            const userAvatar = user?.user_metadata?.avatar_url;

            setProfile((prev) => ({
              ...prev,
              ...payload.new,
              name: payload.new.full_name || prev.name,
              // Prioritize auth metadata for avatar_url as it's updated immediately
              avatar_url:
                userAvatar || payload.new.avatar_url || prev.avatar_url,
            }));
          }
        }
      )
      .subscribe();

    // Also listen for auth state changes which include metadata updates
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "USER_UPDATED" && session?.user) {
        const userAvatar = session.user.user_metadata?.avatar_url;
        if (userAvatar) {
          setProfile((prev) => ({
            ...prev,
            avatar_url: userAvatar,
          }));
        }
      }
    });

    fetchProfile();

    return () => {
      supabase.removeChannel(channel);
      // Also clean up the auth subscription
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);
  const navItems = [
    { id: "events", label: "Events", icon: Calendar },
    { id: "bands", label: "Your Bands", icon: Users },
  ];

  // Get real user events
  const { upcomingEvents, isLoading } = useUserEvents();

  return (
    <div className="w-72 border-r bg-white h-screen sticky top-0 flex flex-col shrink-0">
      <div className="p-5 border-b">
        <Link
          href="#"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={() => setActiveScreen("events")}
        >
          <Home className="h-5 w-5 text-[#ffac6d]" />
          <span>Jamboree</span>
        </Link>
      </div>

      <div className="p-5 border-b">
        <div 
          className={`flex items-center gap-3 ${(!isViewingProfile || isCurrentUser) ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={() => (!isViewingProfile || isCurrentUser) && setActiveScreen("profile")}
        >
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={profile.avatar_url || undefined}
              alt={profile.name}
            />
            <AvatarFallback>
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{profile.name}</div>
            <div className="text-xs text-gray-500">
              {profile.instruments?.length
                ? profile.instruments.join(", ")
                : "No instruments yet"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-5">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeScreen === item.id
                      ? "bg-[#ffd2b0] text-black font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5 text-[#ffac6d]" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <h3 className="px-3 text-sm font-medium text-gray-500 mb-2">
            YOUR EVENTS
          </h3>
          {isLoading ? (
            <div className="p-3 text-center">
              <div className="animate-spin h-4 w-4 border-2 border-[#ffac6d] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No upcoming events
            </div>
          ) : (
            <ul className="space-y-1">
              {upcomingEvents.map((event) => {
                // Format date using Pacific Time
                const dateStr = formatEventCardDate(event.start_time);

                return (
                  <li key={event.id}>
                    <button
                      onClick={() => onOpenEvent(event.id)}
                      className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeScreen === "event" && selectedEvent === event.id
                          ? "bg-[#ffd2b0] text-black font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex-1 relative">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md overflow-hidden relative flex-shrink-0">
                            <Image
                              src={
                                event.image_url ||
                                "/placeholder.svg?height=32&width=32"
                              }
                              alt={event.title}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                          <div className="truncate font-medium">
                            {event.title}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {dateStr}
                        </div>
                      </div>
                      {event.participationStatus === "going" ? (
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      <div className="p-5 border-t">
        {!isLoading && upcomingEvents.length > 0 ? (
          <div className="bg-[#ffd2b0] rounded-lg p-3">
            <h3 className="font-medium mb-1">Upcoming Jam</h3>
            {(() => {
              // Sort events by start time and get the closest one
              const nextEvent = [...upcomingEvents].sort(
                (a, b) =>
                  new Date(a.start_time).getTime() -
                  new Date(b.start_time).getTime()
              )[0];

              // Format date for display using Pacific Time
              const dateStr = formatDate(nextEvent.start_time);

              return (
                <>
                  <p className="text-sm">
                    {nextEvent.title} - {dateStr}
                  </p>
                  <button
                    className="text-xs mt-2 text-[#ffac6d] font-medium"
                    onClick={() => onOpenEvent(nextEvent.id)}
                  >
                    View details →
                  </button>
                </>
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
