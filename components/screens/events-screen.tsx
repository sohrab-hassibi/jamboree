"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface EventsScreenProps {
  onOpenEvent: (eventId: string) => void
  onCreateEvent: () => void
}

export default function EventsScreen({ onOpenEvent, onCreateEvent }: EventsScreenProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const [events, setEvents] = useState<{
    upcoming: Array<{ id: string; title: string; date: string; start_time: string; image: string }>;
    past: Array<{ id: string; title: string; date: string; start_time: string; image: string }>;
  }>({ upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format date to a readable string
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE M/d'); // e.g., "Monday 5/15"
    } catch (e) {
      return '';
    }
  };

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const now = new Date().toISOString();
        
        // Fetch upcoming events (start_time >= now)
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('events')
          .select('*')
          .gte('start_time', now)
          .order('start_time', { ascending: true });

        // Fetch past events (start_time < now)
        const { data: pastData, error: pastError } = await supabase
          .from('events')
          .select('*')
          .lt('start_time', now)
          .order('start_time', { ascending: false })
          .limit(10); // Only get the 10 most recent past events

        if (upcomingError || pastError) {
          throw new Error(upcomingError?.message || pastError?.message || 'Failed to fetch events');
        }

        setEvents({
          upcoming: (upcomingData || []).map(event => ({
            ...event,
            date: formatEventDate(event.start_time),
            image: event.image_url || "/placeholder.svg"
          })),
          past: (pastData || []).map(event => ({
            ...event,
            date: formatEventDate(event.start_time),
            image: event.image_url || "/placeholder.svg"
          }))
        });
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription
    const subscription = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents(); // Refresh events when there are changes
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen lg:overflow-hidden">
      <header className="p-4 md:p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h1 className="text-xl md:text-2xl font-bold flex items-center">
          Events <span className="ml-1">🎵</span>
        </h1>
        <Button className="bg-[#ffac6d] hover:bg-[#fdc193] text-black" onClick={onCreateEvent}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </header>

      <div className="p-4 md:p-6 space-y-10 lg:overflow-y-auto lg:h-[calc(100vh-80px)]">
        {/* Past Events Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Post Games 👀</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
          ) : events.past.length === 0 ? (
            <p className="text-gray-500">No past events yet</p>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex space-x-6">
                  {events.past.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg overflow-hidden border shadow-sm opacity-70 cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[320px] bg-white"
                      onClick={() => onOpenEvent(event.id)}
                    >
                      <div className="relative">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          width={280}
                          height={160}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3">
                          <div className="font-bold text-lg">{event.title}</div>
                          <div className="text-base">{event.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming!</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
          ) : events.upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming events. Create one to get started!</p>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex space-x-6">
                  {events.upcoming.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[320px] bg-white"
                      onClick={() => onOpenEvent(event.id)}
                    >
                      <div className="relative">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          width={280}
                          height={160}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3">
                          <div className="font-bold text-lg">{event.title}</div>
                          <div className="text-base">{event.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
