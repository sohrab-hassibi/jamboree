"use client"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Send, Info, MessageSquare } from "lucide-react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState } from "react"

interface EventScreenProps {
  eventId: string
  activeView: "chat" | "details"
  setActiveView: (view: "chat" | "details") => void
  onBack: () => void
}

export default function EventScreen({ eventId, activeView, setActiveView, onBack }: EventScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [activeTab, setActiveTab] = useState<"going" | "maybe">("going")

  // Mock event data
  const event = {
    id: eventId,
    title: "Old Peeps Jam",
    date: "Sunday May 4",
    time: "7:30 PM",
    location: "Rooftop Farm",
    description:
      "Everyone is invited to this fun rooftop jam with some food and drinks! Bring your instruments if you want to join in. We'll have a small PA system set up and some basic equipment available.",
    image: "/placeholder.svg?height=400&width=800",
    participants: {
      going: [
        { name: "Tommy", host: true },
        { name: "Chloe" },
        { name: "Sophie" },
        { name: "Angel" },
        { name: "Ruby" },
        { name: "Katie" },
        { name: "Paula" },
        { name: "Nagisha" },
        { name: "David" },
        { name: "Michael" },
        { name: "Sarah" },
        { name: "Emma" },
        { name: "John" },
        { name: "Alex" },
      ],
      maybe: [
        { name: "Lisa" },
        { name: "Mark" },
        { name: "Olivia" },
        { name: "James" },
        { name: "Ella" },
        { name: "Noah" },
        { name: "Ava" },
      ],
    },
    messages: [
      {
        id: 1,
        sender: "Tommy",
        text: "Guys, we should meet to do the poster design for the next jam!",
        time: "Monday 7:41 PM",
      },
      {
        id: 2,
        sender: "You",
        text: "I could meet on Friday if that works for you guys",
        time: "Monday 7:45 PM",
        isUser: true,
      },
      { id: 3, sender: "Sophie", text: "Friday works for me! What time would be good?", time: "Wednesday 12:15 PM" },
    ],
  }

  // Update the navigateToProfile function to go directly to the profile screen
  const navigateToProfile = (name: string) => {
    console.log(`Navigating to ${name}'s profile`)
    // In a real app with routing, we would use router.push or similar
    // For now, we'll just simulate by changing the active screen
    document.querySelector('button[data-screen="profile"]')?.click()
  }

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col">
      <header className="flex items-center p-4 md:p-6 border-b">
        <button className="mr-2" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <Image src="/placeholder.svg?height=32&width=32" alt="Group" width={32} height={32} />
          </Avatar>
          <h1 className="text-lg font-medium">{event.title}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          {isDesktop ? (
            <div className="flex gap-2">
              <Button
                variant={activeView === "chat" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("chat")}
                className={activeView === "chat" ? "bg-[#ffac6d] text-black hover:bg-[#fdc193]" : ""}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <Button
                variant={activeView === "details" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("details")}
                className={activeView === "details" ? "bg-[#ffac6d] text-black hover:bg-[#fdc193]" : ""}
              >
                <Info className="h-4 w-4 mr-1" />
                Details
              </Button>
            </div>
          ) : (
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setActiveView(activeView === "chat" ? "details" : "chat")}
            >
              {activeView === "chat" ? <Info className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            </button>
          )}
        </div>
      </header>

      {activeView === "chat" ? (
        // Chat View
        <>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {event.messages.map((message) => (
                <div key={message.id} className={`flex items-start ${message.isUser ? "justify-end gap-2" : "gap-2"}`}>
                  {!message.isUser && (
                    <Avatar className="w-8 h-8">
                      <Image src="/placeholder.svg?height=32&width=32" alt={message.sender} width={32} height={32} />
                    </Avatar>
                  )}
                  <div>
                    {!message.isUser && <div className="text-xs text-gray-500">{message.time}</div>}
                    <div className={`${message.isUser ? "bg-[#ffd2b0]" : "bg-gray-100"} rounded-lg p-2 mt-1 max-w-xs`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center text-xs text-gray-500 my-4">Your message previewed</div>

              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <Image src="/placeholder.svg?height=32&width=32" alt="User" width={32} height={32} />
                </Avatar>
                <div className="text-sm text-gray-500">David, Melissa, Olivia typing...</div>
              </div>
            </div>

            {isDesktop && (
              <div className="w-64 border-l hidden lg:block">
                <div className="p-4 border-b">
                  <h2 className="font-medium">Participants</h2>
                </div>
                <div className="p-2">
                  {/* Tabs for Going/Maybe */}
                  <div className="flex border-b mb-2">
                    <button
                      className={`py-1.5 px-3 text-xs font-medium ${
                        activeTab === "going"
                          ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("going")}
                    >
                      Going ({event.participants.going.length})
                    </button>
                    <button
                      className={`py-1.5 px-3 text-xs font-medium ${
                        activeTab === "maybe"
                          ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("maybe")}
                    >
                      Maybe ({event.participants.maybe.length})
                    </button>
                  </div>

                  <div className="space-y-1 mt-2">
                    {activeTab === "going"
                      ? event.participants.going.slice(0, 8).map((person, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => navigateToProfile(person.name)}
                          >
                            <Avatar className="w-6 h-6">
                              <Image
                                src="/placeholder.svg?height=24&width=24"
                                alt={person.name}
                                width={24}
                                height={24}
                              />
                            </Avatar>
                            <span className="text-sm">
                              {person.name} {person.host && "(HOST)"}
                            </span>
                          </div>
                        ))
                      : event.participants.maybe.slice(0, 8).map((person, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => navigateToProfile(person.name)}
                          >
                            <Avatar className="w-6 h-6">
                              <Image
                                src="/placeholder.svg?height=24&width=24"
                                alt={person.name}
                                width={24}
                                height={24}
                              />
                            </Avatar>
                            <span className="text-sm">{person.name}</span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="relative">
              <Input placeholder="Send a message..." className="pr-10 rounded-full" />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Send className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </>
      ) : (
        // Event Details View
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 md:p-8">
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-base">{event.location}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 6v6l4 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-base">{event.date}</span>
                </div>
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 6v6l4 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-base">{event.time}</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="font-medium text-lg mb-3">About</h2>
                <p className="text-base">{event.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-lg">Participants</h2>
                  <div className="text-base text-[#ffac6d]">
                    {event.participants.going.length} Going · {event.participants.maybe.length} Maybe
                  </div>
                </div>

                {/* Tabs for Going/Maybe */}
                <div className="flex border-b mb-4">
                  <button
                    className={`py-2 px-4 font-medium text-sm ${
                      activeTab === "going"
                        ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("going")}
                  >
                    Going ({event.participants.going.length})
                  </button>
                  <button
                    className={`py-2 px-4 font-medium text-sm ${
                      activeTab === "maybe"
                        ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("maybe")}
                  >
                    Maybe ({event.participants.maybe.length})
                  </button>
                </div>

                {/* Brick layout for participants */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
                  {activeTab === "going"
                    ? event.participants.going.map((person, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-[#ffd2b0] rounded-lg py-2 px-3 cursor-pointer hover:bg-[#fdc193] transition-colors shadow-sm h-14 w-full"
                          onClick={() => navigateToProfile(person.name)}
                        >
                          <Avatar className="w-7 h-7 mr-2 flex-shrink-0">
                            <Image src="/placeholder.svg?height=28&width=28" alt={person.name} width={28} height={28} />
                          </Avatar>
                          <span className="font-medium text-sm truncate">
                            {person.name} {person.host && "(HOST)"}
                          </span>
                        </div>
                      ))
                    : event.participants.maybe.map((person, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-[#ffd2b0] rounded-lg py-2 px-3 cursor-pointer hover:bg-[#fdc193] transition-colors shadow-sm h-14 w-full"
                          onClick={() => navigateToProfile(person.name)}
                        >
                          <Avatar className="w-7 h-7 mr-2 flex-shrink-0">
                            <Image src="/placeholder.svg?height=28&width=28" alt={person.name} width={28} height={28} />
                          </Avatar>
                          <span className="font-medium text-sm truncate">{person.name}</span>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex gap-2">
            <Button className="flex-1 bg-[#ffac6d] hover:bg-[#fdc193] text-black">I'm Going</Button>
            <Button variant="outline" className="flex-1">
              Maybe
            </Button>
          </div>
        </>
      )}

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
