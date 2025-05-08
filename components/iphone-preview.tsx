"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronLeft, Send, Info, Users, User, Home, Camera, Search, X, Plus } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function IPhonePreview() {
  const [activeScreen, setActiveScreen] = useState<
    "events" | "event" | "profile" | "bands" | "chat" | "create-event" | "create-band"
  >("events")
  const [activeEventView, setActiveEventView] = useState<"chat" | "details">("chat")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [selectedBand, setSelectedBand] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; name: string; image: string }[]>([])

  // Create event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    location: "",
    dateTime: "",
    description: "",
    image: null as File | null,
  })

  // Function to handle event form input changes
  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Function to handle image selection
  const handleImageSelect = () => {
    console.log("Image selection would open here")
    // In a real app, this would open a file picker
    // For now, we'll just simulate setting an image
    setEventForm((prev) => ({
      ...prev,
      image: new File([], "mock-image.jpg"),
    }))
  }

  // Function to handle posting a new event
  const handlePostEvent = () => {
    // Basic validation
    if (!eventForm.title.trim()) {
      alert("Please enter an event title")
      return
    }

    console.log("Posting event:", eventForm)
    // In a real app, this would send the event data to a backend

    // Reset the form
    setEventForm({
      title: "",
      location: "",
      dateTime: "",
      description: "",
      image: null,
    })

    // Navigate back to events screen
    handleBackToEvents()
  }

  // Mock users data for member selection
  const users = [
    { id: "user-1", name: "Chloe", image: "/placeholder.svg?height=40&width=40" },
    { id: "user-2", name: "Sophie", image: "/placeholder.svg?height=40&width=40" },
    { id: "user-3", name: "Angel", image: "/placeholder.svg?height=40&width=40" },
    { id: "user-4", name: "Ruby", image: "/placeholder.svg?height=40&width=40" },
    { id: "user-5", name: "Katie", image: "/placeholder.svg?height=40&width=40" },
    { id: "user-6", name: "Paula", image: "/placeholder.svg?height=40&width=40" },
    { id: "user-7", name: "Nagisha", image: "/placeholder.svg?height=40&width=40" },
    { id: "user-8", name: "David", image: "/placeholder.svg?height=40&width=40" },
  ]

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedMembers.some((member) => member.id === user.id),
  )

  // Add member to selected members
  const addMember = (user: { id: string; name: string; image: string }) => {
    setSelectedMembers([...selectedMembers, user])
    setSearchTerm("")
  }

  // Remove member from selected members
  const removeMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== userId))
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

  // Function to handle opening a band chat
  const handleOpenBandChat = (bandId: string) => {
    setSelectedBand(bandId)
    setActiveScreen("chat")
  }

  // Function to go back to bands list
  const handleBackToBands = () => {
    setSelectedBand(null)
    setActiveScreen("bands")
  }

  // Function to handle creating a new event
  const handleCreateEvent = () => {
    setActiveScreen("create-event")
  }

  // Function to handle creating a new band
  const handleCreateBand = () => {
    setActiveScreen("create-band")
    setSelectedMembers([])
  }

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

  // Mock bands data
  const bands = [
    {
      id: "band-1",
      name: "The ideal conditions",
      message: "Candy: ya I think I have spare headphones",
      time: "10:42 AM",
      image: "/placeholder.svg?height=64&width=64",
      unread: 2,
    },
    {
      id: "band-2",
      name: "Lulu & Tommy",
      message: "You: I'm outside! :)",
      time: "Yesterday",
      image: "/placeholder.svg?height=64&width=64",
      unread: 0,
    },
    {
      id: "band-3",
      name: "Old Peeps Jam",
      message: "Sophia: white cheddar cheezits omg",
      time: "Tuesday",
      image: "/placeholder.svg?height=64&width=64",
      unread: 5,
    },
  ]

  // Mock event data
  const event = {
    id: "event-1",
    title: "Old Peeps Jam",
    date: "Sunday May 4",
    time: "7:30 PM",
    location: "Rooftop Farm",
    description:
      "Everyone is invited to this fun rooftop jam with some food and drinks! Bring your instruments if you want to join in. We'll have a small PA system set up and some basic equipment available.",
    image: "/placeholder.svg?height=400&width=800",
    participants: {
      going: [{ name: "Tommy", host: true }, { name: "Chloe" }, { name: "Sophie" }, { name: "Angel" }],
      maybe: [{ name: "Lisa" }, { name: "Mark" }, { name: "Olivia" }],
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

  const renderContent = () => {
    switch (activeScreen) {
      case "events":
        return (
          <div className="bg-white h-full overflow-hidden flex flex-col">
            <header className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-bold flex items-center">
                Events <span className="ml-1">🎵</span>
              </h1>
              <Button className="bg-[#ffac6d] hover:bg-[#fdc193] text-black" size="sm" onClick={handleCreateEvent}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Create
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Past Events Section */}
                <div>
                  <h2 className="text-lg font-bold mb-3">Post Games 👀</h2>
                  <div className="relative">
                    <div className="overflow-x-auto pb-4 hide-scrollbar">
                      <div className="flex space-x-3">
                        {events.past.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-lg overflow-hidden border shadow-sm opacity-70 cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[220px]"
                            onClick={() => handleOpenEvent(event.id)}
                          >
                            <div className="relative">
                              <Image
                                src={event.image || "/placeholder.svg"}
                                alt={event.title}
                                width={220}
                                height={120}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-2">
                                <div className="font-bold">{event.title}</div>
                                <div className="text-sm">{event.date}</div>
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
                  <h2 className="text-lg font-bold mb-3">Upcoming!</h2>
                  <div className="relative">
                    <div className="overflow-x-auto pb-4 hide-scrollbar">
                      <div className="flex space-x-3">
                        {events.upcoming.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[220px]"
                            onClick={() => handleOpenEvent(event.id)}
                          >
                            <div className="relative">
                              <Image
                                src={event.image || "/placeholder.svg"}
                                alt={event.title}
                                width={220}
                                height={120}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-2">
                                <div className="font-bold">{event.title}</div>
                                <div className="text-sm">{event.date}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="border-t h-16 flex items-center justify-around px-2">
              {[
                { id: "events", label: "Events", icon: Home },
                { id: "bands", label: "Bands", icon: Users },
                { id: "profile", label: "Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeScreen === item.id || (item.id === "events" && activeScreen === "event")

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "profile") {
                        setActiveScreen("profile")
                      } else if (item.id === "bands") {
                        setActiveScreen("bands")
                      } else {
                        setActiveScreen("events")
                      }
                    }}
                    className="flex flex-col items-center justify-center h-full w-full"
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        (item.id === "events" && activeScreen === "events") ||
                        (item.id === "profile" && activeScreen === "profile") ||
                        (item.id === "bands" && (activeScreen === "bands" || activeScreen === "chat"))
                          ? "text-[#ffac6d]"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-xs mt-1 ${
                        (item.id === "events" && activeScreen === "events") ||
                        (item.id === "profile" && activeScreen === "profile") ||
                        (item.id === "bands" && (activeScreen === "bands" || activeScreen === "chat"))
                          ? "text-[#ffac6d] font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case "bands":
        return (
          <div className="bg-white h-full overflow-hidden flex flex-col">
            <header className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-bold">Your bands</h1>
              <Button className="bg-[#ffac6d] hover:bg-[#fdc193] text-black" size="sm" onClick={handleCreateBand}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Create
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y">
                {bands.map((band) => (
                  <div
                    key={band.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOpenBandChat(band.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <Image src={band.image || "/placeholder.svg"} alt={band.name} width={48} height={48} />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold truncate">{band.name}</h3>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{band.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{band.message}</p>
                      </div>
                      {band.unread > 0 && (
                        <div className="ml-2 bg-[#ffac6d] text-black rounded-full h-5 min-w-5 flex items-center justify-center text-xs px-1">
                          {band.unread}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="border-t h-16 flex items-center justify-around px-2">
              {[
                { id: "events", label: "Events", icon: Home },
                { id: "bands", label: "Bands", icon: Users },
                { id: "profile", label: "Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "profile") {
                        setActiveScreen("profile")
                      } else if (item.id === "events") {
                        setActiveScreen("events")
                      }
                    }}
                    className="flex flex-col items-center justify-center h-full w-full"
                  >
                    <Icon className={`h-5 w-5 ${item.id === "bands" ? "text-[#ffac6d]" : "text-gray-500"}`} />
                    <span
                      className={`text-xs mt-1 ${item.id === "bands" ? "text-[#ffac6d] font-medium" : "text-gray-500"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case "create-band":
        return (
          <div className="bg-white h-full overflow-hidden flex flex-col">
            <header className="p-4 border-b flex items-center">
              <button className="mr-3" onClick={() => setActiveScreen("bands")}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold">Create band</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Band Name</label>
                  <Input placeholder="Enter band name" className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Band Image</label>
                  <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                    <div className="bg-white p-3 rounded-full">
                      <Camera className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea placeholder="Describe your band..." className="min-h-[100px]" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Add Members</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search for members..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Selected members */}
                    {selectedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedMembers.map((member) => (
                          <div key={member.id} className="flex items-center bg-[#ffd2b0] rounded-full pl-1 pr-2 py-1">
                            <Avatar className="h-6 w-6 mr-1">
                              <Image
                                src={member.image || "/placeholder.svg"}
                                alt={member.name}
                                width={24}
                                height={24}
                              />
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                            <button
                              className="ml-1 text-gray-600 hover:text-gray-900"
                              onClick={() => removeMember(member.id)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search results */}
                    {searchTerm && (
                      <div className="border rounded-md mt-1 max-h-60 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => addMember(user)}
                            >
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <Image
                                    src={user.image || "/placeholder.svg"}
                                    alt={user.name}
                                    width={32}
                                    height={32}
                                  />
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500">No users found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Primary Genre</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Select a genre</option>
                    <option value="rock">Rock</option>
                    <option value="pop">Pop</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="electronic">Electronic</option>
                    <option value="hiphop">Hip Hop</option>
                    <option value="country">Country</option>
                    <option value="reggae">Reggae</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end">
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setActiveScreen("bands")}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                  onClick={() => {
                    console.log("Band created!")
                    setActiveScreen("bands")
                  }}
                >
                  Create Band
                </Button>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="border-t h-16 flex items-center justify-around px-2">
              {[
                { id: "events", label: "Events", icon: Home },
                { id: "bands", label: "Bands", icon: Users },
                { id: "profile", label: "Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "profile") {
                        setActiveScreen("profile")
                      } else if (item.id === "events") {
                        setActiveScreen("events")
                      } else if (item.id === "bands") {
                        setActiveScreen("bands")
                      }
                    }}
                    className="flex flex-col items-center justify-center h-full w-full"
                  >
                    <Icon className={`h-5 w-5 ${item.id === "bands" ? "text-[#ffac6d]" : "text-gray-500"}`} />
                    <span
                      className={`text-xs mt-1 ${item.id === "bands" ? "text-[#ffac6d] font-medium" : "text-gray-500"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case "chat":
        // Band Chat View
        const selectedBandData = bands.find((band) => band.id === selectedBand) || bands[0]
        return (
          <div className="bg-white h-full overflow-hidden flex flex-col">
            <header className="flex items-center p-4 border-b">
              <button className="mr-2" onClick={handleBackToBands}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <Image
                    src={selectedBandData.image || "/placeholder.svg"}
                    alt={selectedBandData.name}
                    width={32}
                    height={32}
                  />
                </Avatar>
                <h1 className="text-lg font-medium">{selectedBandData.name}</h1>
              </div>
              <div className="ml-auto">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Sample messages - would be dynamic in a real app */}
              <div className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <Image src="/placeholder.svg?height=32&width=32" alt="User" width={32} height={32} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">Monday 7:41 PM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-xs">
                    <p className="text-sm">Hey everyone! When's our next practice?</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-end gap-2">
                <div>
                  <div className="bg-[#ffd2b0] rounded-lg p-2 mt-1 max-w-xs">
                    <p className="text-sm">I'm free on Thursday evening if that works</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <Image src="/placeholder.svg?height=32&width=32" alt="User" width={32} height={32} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">Wednesday 12:15 PM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-xs">
                    <p className="text-sm">Thursday works for me too!</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 my-4">Today</div>

              <div className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <Image src="/placeholder.svg?height=32&width=32" alt="Candy" width={32} height={32} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">10:42 AM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-xs">
                    <p className="text-sm">ya I think I have spare headphones</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="relative">
                <Input placeholder="Send a message..." className="pr-10 rounded-full" />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Send className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="border-t h-16 flex items-center justify-around px-2">
              {[
                { id: "events", label: "Events", icon: Home },
                { id: "bands", label: "Bands", icon: Users },
                { id: "profile", label: "Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "profile") {
                        setActiveScreen("profile")
                      } else if (item.id === "events") {
                        setActiveScreen("events")
                      } else if (item.id === "bands") {
                        handleBackToBands()
                      }
                    }}
                    className="flex flex-col items-center justify-center h-full w-full"
                  >
                    <Icon className={`h-5 w-5 ${item.id === "bands" ? "text-[#ffac6d]" : "text-gray-500"}`} />
                    <span
                      className={`text-xs mt-1 ${item.id === "bands" ? "text-[#ffac6d] font-medium" : "text-gray-500"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case "event":
        return activeEventView === "chat" ? (
          // Event Chat View
          <div className="bg-white h-full overflow-hidden flex flex-col">
            <header className="flex items-center p-4 border-b">
              <button className="mr-2" onClick={handleBackToEvents}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <Image src="/placeholder.svg?height=32&width=32" alt="Group" width={32} height={32} />
                </Avatar>
                <h1 className="text-lg font-medium">{event.title}</h1>
              </div>
              <div className="ml-auto">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setActiveEventView(activeEventView === "chat" ? "details" : "chat")}
                >
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

            <div className="p-4 border-t">
              <div className="relative">
                <Input placeholder="Send a message..." className="pr-10 rounded-full" />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Send className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="border-t h-16 flex items-center justify-around px-2">
              {[
                { id: "events", label: "Events", icon: Home },
                { id: "bands", label: "Bands", icon: Users },
                { id: "profile", label: "Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "events") {
                        handleBackToEvents()
                      } else if (item.id === "profile") {
                        setActiveScreen("profile")
                      } else if (item.id === "bands") {
                        setActiveScreen("bands")
                      }
                    }}
                    className="flex flex-col items-center justify-center h-full w-full"
                  >
                    <Icon className={`h-5 w-5 ${item.id === "events" ? "text-[#ffac6d]" : "text-gray-500"}`} />
                    <span
                      className={`text-xs mt-1 ${item.id === "events" ? "text-[#ffac6d] font-medium" : "text-gray-500"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          // Event Details View - omitted for brevity, same as before
          <div>Event Details View</div>
        )

      case "profile":
        // Profile View - omitted for brevity, same as before
        return <div>Profile View</div>

      case "create-event":
        return (
          <div className="bg-white h-full overflow-hidden flex flex-col">
            <header className="p-4 border-b flex items-center">
              <button className="mr-3" onClick={handleBackToEvents}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold">Create event</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Title</label>
                  <Input
                    placeholder="Title"
                    className="w-full"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Event Image</label>
                  <div
                    className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={handleImageSelect}
                  >
                    {eventForm.image ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 relative">
                        <div className="text-sm text-gray-600">Image selected</div>
                        <div className="absolute top-2 right-2 bg-white p-1 rounded-full">
                          <Camera className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded-full">
                        <Camera className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#b3261e]"
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
                    </div>
                    <Input
                      placeholder="Location"
                      className="pl-10"
                      name="location"
                      value={eventForm.location}
                      onChange={handleEventFormChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#49454f]"
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
                    </div>
                    <Input
                      placeholder="Date & Time"
                      className="pl-10"
                      name="dateTime"
                      value={eventForm.dateTime}
                      onChange={handleEventFormChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#49454f]"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <Textarea
                      placeholder="Description"
                      className="pl-10 min-h-[100px]"
                      name="description"
                      value={eventForm.description}
                      onChange={handleEventFormChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end">
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={handleBackToEvents}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                  onClick={handlePostEvent}
                  disabled={!eventForm.title.trim()}
                >
                  Post Event
                </Button>
              </div>
            </div>

            {/* Mobile Nav */}
            <div className="border-t h-16 flex items-center justify-around px-2">
              {[
                { id: "events", label: "Events", icon: Home },
                { id: "bands", label: "Bands", icon: Users },
                { id: "profile", label: "Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "profile") {
                        setActiveScreen("profile")
                      } else if (item.id === "events") {
                        handleBackToEvents()
                      } else if (item.id === "bands") {
                        setActiveScreen("bands")
                      }
                    }}
                    className="flex flex-col items-center justify-center h-full w-full"
                  >
                    <Icon className={`h-5 w-5 ${item.id === "events" ? "text-[#ffac6d]" : "text-gray-500"}`} />
                    <span
                      className={`text-xs mt-1 ${item.id === "events" ? "text-[#ffac6d] font-medium" : "text-gray-500"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex justify-center p-4 md:p-8">
      <div className="relative w-[390px] h-[844px] rounded-[54px] overflow-hidden border-8 border-gray-900 bg-gray-900 shadow-xl">
        {/* iPhone Notch */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-black z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl"></div>
        </div>

        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-6 z-20">
          <div className="text-white text-xs font-medium">9:41</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M12.33 4.67c.98-.98 2.56-.98 3.54 0l3.05 3.05c.98.98.98 2.56 0 3.54l-7.13 7.13c-.98.98-2.56.98-3.54 0l-3.05-3.05c-.98-.98-.98-2.56 0-3.54l7.13-7.13z" />
              </svg>
            </div>
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
              </svg>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-3 bg-white rounded-sm relative">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-r-sm"></div>
                <div className="absolute left-0.5 top-0.5 bottom-0.5 right-1.5 bg-black rounded-sm">
                  <div className="absolute left-0 top-0 bottom-0 right-1.5 bg-white rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="absolute top-10 left-0 right-0 bottom-0 bg-white overflow-hidden">{renderContent()}</div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
      </div>
    </div>
  )
}
