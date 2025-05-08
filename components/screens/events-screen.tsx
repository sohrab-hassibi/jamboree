"use client"

import { useState } from "react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface EventsScreenProps {
  onOpenEvent: (eventId: string) => void
  onCreateEvent: () => void
}

export default function EventsScreen({ onOpenEvent, onCreateEvent }: EventsScreenProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Mock events data
  const events = {
    upcoming: [
      { id: "event-1", title: "Old Peeps Jam", date: "Sunday 5/4", image: "/placeholder.svg?height=200&width=400" },
      { id: "event-2", title: "Jazz Night", date: "Friday 5/10", image: "/placeholder.svg?height=200&width=400" },
      { id: "event-3", title: "Prom", date: "Wednesday 5/15", image: "/placeholder.svg?height=200&width=400" },
      { id: "event-4", title: "Day N Night", date: "Thursday 6/20", image: "/placeholder.svg?height=200&width=400" },
    ],
    past: [
      { id: "event-5", title: "Spring Jam", date: "Sunday 4/12", image: "/placeholder.svg?height=200&width=400" },
      { id: "event-6", title: "Open Mic Night", date: "Friday 3/15", image: "/placeholder.svg?height=200&width=400" },
    ],
  }

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
        </div>

        {/* Upcoming Events Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming!</h2>
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
        </div>
      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
