"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import EventScreen from "@/components/screens/event-screen"
import EventsScreen from "@/components/screens/events-screen"
import ProfileScreen from "@/components/screens/profile-screen"
import CreateEventScreen from "@/components/screens/create-event-screen"
import CreateBandScreen from "@/components/screens/create-band-screen"
import BandsScreen from "@/components/screens/bands-screen"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeScreen, setActiveScreen] = useState<string>("events")
  const [activeEventView, setActiveEventView] = useState<"chat" | "details">("chat")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          router.push('/login')
        } else {
          setIsLoading(false)
          
          // Check URL parameters for navigation
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            
            // Check for event parameter
            const eventId = params.get('event');
            if (eventId) {
              setSelectedEvent(eventId);
              setActiveScreen('event');
            }
            
            // Check for tab parameter
            const tab = params.get('tab');
            if (tab === 'profile') {
              setActiveScreen('profile');
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        router.push('/login')
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])
  
  // Add listener for custom event navigation from profile page
  useEffect(() => {
    const handleOpenEventFromProfile = (e: Event) => {
      const customEvent = e as CustomEvent;
      const eventId = customEvent.detail?.eventId;
      if (eventId) {
        // We're using a function reference here instead of direct call
        // to avoid initialization issues
        const openEvent = (id: string) => {
          setSelectedEvent(id);
          setActiveScreen("event");
          setActiveEventView("chat");
        };
        openEvent(eventId);
      }
    };
    
    window.addEventListener('openEvent', handleOpenEventFromProfile);
    
    return () => {
      window.removeEventListener('openEvent', handleOpenEventFromProfile);
    };
  }, []);
  


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Function to handle opening an event
  const handleOpenEvent = (eventId: string) => {
    setSelectedEvent(eventId)
    setActiveScreen("event")
    setActiveEventView("chat") // Default to chat view when opening an event
  }


  // Function to go back to events list
  const handleBackToEvents = () => {
    setSelectedEvent(null)
    setActiveScreen("events")
  }

  // Function to handle creating a new event
  const handleCreateEvent = () => {
    setActiveScreen("create-event")
  }

  // Function to handle creating a new band
  const handleCreateBand = () => {
    setActiveScreen("create-band")
  }

  // Function to render the active screen
  const renderScreen = () => {
    switch (activeScreen) {
      case "event":
        return (
          <EventScreen
            eventId={selectedEvent || "default-event"}
            activeView={activeEventView}
            setActiveView={setActiveEventView}
            onBack={handleBackToEvents}
          />
        )
      case "events":
        return <EventsScreen onOpenEvent={handleOpenEvent} onCreateEvent={handleCreateEvent} />
      case "profile":
        return <ProfileScreen />
      case "create-event":
        return <CreateEventScreen onCancel={handleBackToEvents} />
      case "create-band":
        return <CreateBandScreen onCancel={() => setActiveScreen("bands")} />
      case "bands":
        return <BandsScreen onCreateBand={handleCreateBand} />
      default:
        return <EventsScreen onOpenEvent={handleOpenEvent} onCreateEvent={handleCreateEvent} />
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {isDesktop && (
          <Sidebar
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            selectedEvent={selectedEvent}
            onOpenEvent={handleOpenEvent}
          />
        )}

        <main className="flex-1 lg:overflow-hidden w-full">{renderScreen()}</main>
      </div>

      {!isDesktop && (
        <MobileNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} selectedEvent={selectedEvent} />
      )}
    </div>
  )
}
