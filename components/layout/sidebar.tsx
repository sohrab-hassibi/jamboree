"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Home } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useUserEvents, type UserEvent } from "@/hooks/use-user-events"
import Image from "next/image"

interface ProfileData {
  name: string
  bio?: string
  instruments?: string[]
  genres?: string[]
}

interface SidebarProps {
  activeScreen: string
  setActiveScreen: (screen: string) => void
  selectedEvent: string | null
  onOpenEvent: (eventId: string) => void
}

export function Sidebar({ activeScreen, setActiveScreen, selectedEvent, onOpenEvent }: SidebarProps) {
  const [profile, setProfile] = useState<ProfileData & { avatar_url?: string }>({ name: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // First try to get the name from user_metadata (from signup)
        const userName = user.user_metadata?.full_name || ''
        
        // Then try to get the full profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile({
          name: userName || data?.full_name || 'User',
          bio: data?.bio,
          instruments: data?.instruments || [],
          genres: data?.genres || [],
          avatar_url: data?.avatar_url
        })
      }
    }


    // Set up realtime subscription for profile updates
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${(async () => {
            const { data: { user } } = await supabase.auth.getUser()
            return user?.id
          })()}`
        }, 
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setProfile(prev => ({
              ...prev,
              ...payload.new,
              name: payload.new.full_name || prev.name
            }))
          }
        }
      )
      .subscribe()

    fetchProfile()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  const navItems = [
    { id: "events", label: "Events", icon: Calendar },
    { id: "bands", label: "Your Bands", icon: Users },
  ]

  // Get real user events
  const { upcomingEvents, isLoading } = useUserEvents()

  return (
    <div className="w-72 border-r bg-white h-screen sticky top-0 flex flex-col shrink-0">
      <div className="p-5 border-b">
        <Link href="#" className="flex items-center gap-2 font-bold text-xl" onClick={() => setActiveScreen("events")}>
          <Home className="h-5 w-5 text-[#ffac6d]" />
          <span>Jamboree</span>
        </Link>
      </div>

      <div
        className={`p-5 border-b cursor-pointer transition-colors ${
          activeScreen === "profile" ? "bg-[#ffd2b0]" : "hover:bg-gray-100"
        }`}
        onClick={() => {
          // Always navigate to the current user's profile
          if (window.location.pathname.includes('/profile/')) {
            // If we're on another user's profile, go back to main app with profile tab selected
            window.location.href = '/?tab=profile';
          } else {
            // If we're already in the main app, just switch to profile tab
            setActiveScreen("profile");
          }
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg?height=40&width=40"} alt="Profile" />
            <AvatarFallback>{profile.name ? profile.name.charAt(0) : 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-lg">{profile.name}</div>
            <div className="text-xs text-gray-500">View Profile</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-5">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  data-screen={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeScreen === item.id ? "bg-[#ffd2b0] text-black font-medium" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>



        <div className="mt-6">
          <h3 className="px-3 text-sm font-medium text-gray-500 mb-2">YOUR EVENTS</h3>
          {isLoading ? (
            <div className="p-3 text-center">
              <div className="animate-spin h-4 w-4 border-2 border-[#ffac6d] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No upcoming events</div>
          ) : (
            <ul className="space-y-1">
              {upcomingEvents.map((event) => {
                // Format date
                const date = new Date(event.start_time);
                const dateStr = date.toLocaleDateString([], {
                  weekday: 'short',
                  month: 'numeric',
                  day: 'numeric'
                });
                
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
                              src={event.image_url || '/placeholder.svg?height=32&width=32'}
                              alt={event.title}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{event.title}</div>
                            <div className="text-xs text-gray-500">{dateStr}</div>
                          </div>
                        </div>
                        {/* Status indicator */}
                        <div 
                          className={`absolute top-0 right-0 w-2 h-2 rounded-full ${
                            event.participationStatus === 'going' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}
                        />
                      </div>
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
              const nextEvent = [...upcomingEvents].sort((a, b) => 
                new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
              )[0];
              
              // Format date for display
              const date = new Date(nextEvent.start_time);
              const dateStr = date.toLocaleDateString([], {
                weekday: 'long',
                month: 'numeric',
                day: 'numeric'
              });
              
              return (
                <>
                  <p className="text-sm">{nextEvent.title} - {dateStr}</p>
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
        ) : (
          <div className="bg-[#ffd2b0] rounded-lg p-3">
            <h3 className="font-medium mb-1">Upcoming Jam</h3>
            <p className="text-sm">No upcoming events</p>
          </div>
        )}
      </div>
    </div>
  )
}
