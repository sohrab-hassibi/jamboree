"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Home } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  const [profile, setProfile] = useState<ProfileData>({ name: '' })

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
          genres: data?.genres || []
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

  // Mock recent events
  const recentEvents = [
    { id: "event-1", title: "Old Peeps Jam", date: "Sunday 5/4" },
    { id: "event-2", title: "Jazz Night", date: "Friday 5/10" },
  ]

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
        onClick={() => setActiveScreen("profile")}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
            <AvatarFallback>T</AvatarFallback>
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
          <ul className="space-y-1">
            {recentEvents.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => onOpenEvent(event.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    activeScreen === "event" && selectedEvent === event.id
                      ? "bg-[#ffd2b0] text-black font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.date}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-5 border-t">
        <div className="bg-[#ffd2b0] rounded-lg p-3">
          <h3 className="font-medium mb-1">Upcoming Jam</h3>
          <p className="text-sm">Old Peeps Jam - Sunday 5/4</p>
          <button className="text-xs mt-2 text-[#ffac6d] font-medium" onClick={() => onOpenEvent("event-1")}>
            View details →
          </button>
        </div>
      </div>
    </div>
  )
}
