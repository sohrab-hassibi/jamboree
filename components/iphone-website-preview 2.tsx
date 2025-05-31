"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronLeft, Send, Info, Menu, MessageSquare, Camera, Search, X, Plus, Check } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MUSIC_ICONS } from "@/constants/music-icons"

// Define the music icon types
type MusicIcon = {
  id: string
  name: string
  emoji: string
  type: "instrument" | "genre"
}

export default function IPhoneWebsitePreview() {
  // Fix the TypeScript generic syntax that's causing the error
  const [activeScreen, setActiveScreen] = useState("events")
  const [activeEventView, setActiveEventView] = useState("chat")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [selectedBand, setSelectedBand] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editProfileMode, setEditProfileMode] = useState(false)
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [iconSelectorType, setIconSelectorType] = useState("instrument")
  const [participantsTab, setParticipantsTab] = useState("going")

  // Add a new state to track user's RSVP status for events
  const [userRsvpStatus, setUserRsvpStatus] = useState<Record<string, "going" | "maybe" | null>>({})

  // Add a state to track the user's previous RSVP status
  const [previousRsvpStatus, setPreviousRsvpStatus] = useState<Record<string, "going" | "maybe" | null>>({})

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

  // Update the event data structure to include dynamic participant counts
  const [eventParticipantCounts, setEventParticipantCounts] = useState<
    Record<string, { going: number; maybe: number }>
  >({
    "event-1": { going: event.participants.going.length, maybe: event.participants.maybe.length },
    "event-2": { going: 8, maybe: 5 },
    "event-3": { going: 12, maybe: 3 },
    "event-4": { going: 6, maybe: 10 },
    "event-5": { going: 15, maybe: 4 },
    "event-6": { going: 9, maybe: 7 },
  })

  // Add a new state to track user's events (events they've RSVP'd to)
  const [userEvents, setUserEvents] = useState<string[]>([])

  // Create event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    location: "",
    dateTime: "",
    description: "",
    image: null,
  })

  // Create band form state
  const [bandForm, setBandForm] = useState({
    name: "",
    description: "",
    genre: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; name: string; image: string }[]>([])

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

  // Profile state
  const [profile, setProfile] = useState({
    name: "Tommy Defenestrati",
    bio: "I find organello bell sounds how to get started with a jam while my favorite artist is Lady Gaga.",
    instruments: ["guitar", "piano", "drums"], // Default selected instruments
    genres: ["rock", "pop", "jazz", "electronic"], // Default selected genres
  })

  // Form state for editing
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio,
    instruments: [...profile.instruments],
    genres: [...profile.genres],
  })

  // Function to handle RSVP actions
  const handleRsvp = (eventId: string, status: "going" | "maybe") => {
    const currentStatus = userRsvpStatus[eventId]
    const prevStatus = previousRsvpStatus[eventId]

    // Update the counts based on the user's action
    setEventParticipantCounts((prev) => {
      const newCounts = { ...prev }

      // If the event doesn't have counts yet, initialize them
      if (!newCounts[eventId]) {
        newCounts[eventId] = { going: 0, maybe: 0 }
      }

      // If user had a previous status, decrement that count
      if (prevStatus) {
        newCounts[eventId][prevStatus] = Math.max(0, newCounts[eventId][prevStatus] - 1)
      }

      // If user is changing status (not toggling off the same one)
      if (currentStatus !== status) {
        // Increment the new status count
        newCounts[eventId][status] = (newCounts[eventId][status] || 0) + 1
      }

      return newCounts
    })

    // Update the RSVP status for this event
    if (currentStatus === status) {
      // If clicking the same button, toggle it off
      setUserRsvpStatus((prev) => ({
        ...prev,
        [eventId]: null,
      }))

      // Remove from user's events if toggling off
      setUserEvents((prev) => prev.filter((id) => id !== eventId))

      // Clear previous status
      setPreviousRsvpStatus((prev) => ({
        ...prev,
        [eventId]: null,
      }))
    } else {
      // Store the previous status before updating
      setPreviousRsvpStatus((prev) => ({
        ...prev,
        [eventId]: currentStatus,
      }))

      // Update to new status
      setUserRsvpStatus((prev) => ({
        ...prev,
        [eventId]: status,
      }))

      // Add the event to user's events if not already there
      if (!userEvents.includes(eventId)) {
        setUserEvents((prev) => [...prev, eventId])
      }
    }
  }

  // Function to handle creating a new event
  const handleCreateEvent = () => {
    setActiveScreen("create-event")
    setMenuOpen(false)
  }

  // Function to handle creating a new band
  const handleCreateBand = () => {
    setActiveScreen("create-band")
    setMenuOpen(false)
    // Reset form and selected members
    setBandForm({
      name: "",
      description: "",
      genre: "",
    })
    setSelectedMembers([])
  }

  // Function to handle event form input changes
  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Function to handle band form input changes
  const handleBandFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBandForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Function to handle posting a new event
  const handlePostEvent = () => {
    console.log("Posting event:", eventForm)
    // In a real app, this would send the event data to a backend
    // For now, we'll just go back to the events screen
    setActiveScreen("events")
    // Reset the form
    setEventForm({
      title: "",
      location: "",
      dateTime: "",
      description: "",
      image: null,
    })
  }

  // Function to handle creating a new band
  const handleSubmitBand = () => {
    console.log("Creating band:", bandForm, "with members:", selectedMembers)
    // In a real app, this would send the band data to a backend
    // For now, we'll just go back to the bands screen
    setActiveScreen("bands")
    // Reset the form
    setBandForm({
      name: "",
      description: "",
      genre: "",
    })
    setSelectedMembers([])
  }

  // Function to handle opening an event
  const handleOpenEvent = (eventId: string) => {
    setSelectedEvent(eventId)
    setActiveScreen("event")
    setActiveEventView("chat") // Default to chat view when opening an event
    setMenuOpen(false)
  }

  // Function to handle opening a band chat
  const handleOpenBandChat = (bandId: string) => {
    setSelectedBand(bandId)
    setActiveScreen("chat")
    setMenuOpen(false)
  }

  // Function to go back to events list
  const handleBackToEvents = () => {
    setSelectedEvent(null)
    setActiveScreen("events")
  }

  // Function to go back to bands list
  const handleBackToBands = () => {
    setSelectedBand(null)
    setActiveScreen("bands")
  }

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Function to save profile changes
  const handleSaveProfile = () => {
    setProfile({
      name: formData.name,
      bio: formData.bio,
      instruments: formData.instruments,
      genres: formData.genres,
    })
    setEditProfileMode(false)
    setShowIconSelector(false)
  }

  // Function to cancel profile editing
  const handleCancelEdit = () => {
    setFormData({
      name: profile.name,
      bio: profile.bio,
      instruments: [...profile.instruments],
      genres: [...profile.genres],
    })
    setEditProfileMode(false)
    setShowIconSelector(false)
  }

  // Function to toggle icon selection
  const toggleIconSelection = (iconId: string) => {
    setFormData((prev) => {
      if (prev.instruments.includes(iconId)) {
        return {
          ...prev,
          instruments: prev.instruments.filter((id) => id !== iconId),
        }
      } else {
        return {
          ...prev,
          instruments: [...prev.instruments, iconId],
        }
      }
    })
  }

  // Function to open icon selector
  const openIconSelector = (type: "instrument" | "genre") => {
    setIconSelectorType(type)
    setShowIconSelector(true)
  }

  // Function to navigate to a profile
  const navigateToProfile = (name: string) => {
    console.log(`Navigating to ${name}'s profile`)
    // For the iPhone preview, we'll directly set the active screen to profile
    setActiveScreen("profile")
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

  // Generate positions for profile icons in a circle around the profile picture
  const getRandomPosition = (index: number, total: number) => {
    // Calculate the profile circle radius (half of the width)
    const profileRadius = 12 // 24px / 2

    // Set the distance from the edge of the profile picture
    const distanceFromProfile = 20

    // Calculate the radius for the icon circle (profile radius + distance)
    const iconCircleRadius = profileRadius + distanceFromProfile

    // Distribute icons evenly around the circle
    const angle = (index / total) * 2 * Math.PI

    // Add a small random offset to the angle for a more natural look
    const angleOffset = Math.random() * 0.2 - 0.1
    const finalAngle = angle + angleOffset

    // Calculate position
    const x = Math.cos(finalAngle) * iconCircleRadius
    const y = Math.sin(finalAngle) * iconCircleRadius

    return { x, y }
  }

  // Shared hamburger menu content
  const renderHamburgerMenu = () => (
    <div className="absolute inset-0 bg-black bg-opacity-50 z-20" onClick={() => setMenuOpen(false)}>
      <div className="w-3/4 max-w-[280px] h-full bg-white" onClick={(e) => e.stopPropagation()}>
        <div
          className={`p-3 border-b cursor-pointer ${activeScreen === "profile" ? "bg-[#ffd2b0]" : ""}`}
          onClick={() => {
            setActiveScreen("profile")
            setMenuOpen(false)
          }}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <Image src="/placeholder.svg?height=32&width=32" alt="Profile" width={32} height={32} />
            </Avatar>
            <div>
              <div className="font-medium text-sm">{profile.name}</div>
              <div className="text-xs text-gray-500">View Profile</div>
            </div>
          </div>
        </div>
        <nav className="p-3">
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => {
                  setActiveScreen("events")
                  setMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeScreen === "events" ? "bg-[#ffd2b0] text-black font-medium" : "hover:bg-gray-100"
                } text-sm`}
              >
                <span>Events</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveScreen("bands")
                  setMenuOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeScreen === "bands" || activeScreen === "chat"
                    ? "bg-[#ffd2b0] text-black font-medium"
                    : "hover:bg-gray-100"
                } text-sm`}
              >
                <span>Your Bands</span>
              </button>
            </li>
          </ul>

          <div className="mt-4">
            <h3 className="px-2.5 text-xs font-medium text-gray-500 mb-1.5">YOUR EVENTS</h3>
            <ul className="space-y-1">
              {userEvents.length > 0 ? (
                userEvents.map((eventId) => {
                  const eventData = [...events.upcoming, ...events.past].find((e) => e.id === eventId)
                  if (!eventData) return null

                  return (
                    <li key={eventId}>
                      <button
                        onClick={() => handleOpenEvent(eventId)}
                        className="w-full flex items-start gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left hover:bg-gray-100"
                      >
                        <div>
                          <div className="font-medium text-sm">{eventData.title}</div>
                          <div className="text-xs text-gray-500">
                            {eventData.date} • {userRsvpStatus[eventId] === "going" ? "Going" : "Maybe"}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })
              ) : (
                <li className="px-2.5 py-1.5 text-xs text-gray-500">No events yet</li>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeScreen) {
      case "events":
        return (
          <div className="bg-white h-full flex flex-col">
            <header className="sticky top-0 z-10 p-3 border-b flex items-center justify-between bg-white">
              <div className="flex items-center">
                <button className="mr-2" onClick={() => setMenuOpen(!menuOpen)}>
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-bold flex items-center">
                  Events <span className="ml-1">🎵</span>
                </h1>
              </div>
              <Button
                className="bg-[#ffac6d] hover:bg-[#fdc193] text-black h-8 text-xs px-2.5"
                size="sm"
                onClick={handleCreateEvent}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Create
              </Button>
            </header>

            {menuOpen && renderHamburgerMenu()}

            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-4">
                {/* Past Events Section */}
                <div>
                  <h2 className="text-base font-bold mb-2">Post Games 👀</h2>
                  <div className="relative">
                    <div className="overflow-x-auto pb-3 hide-scrollbar">
                      <div className="flex space-x-2.5">
                        {events.past.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-lg overflow-hidden border shadow-sm opacity-70 cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[180px]"
                            onClick={() => handleOpenEvent(event.id)}
                          >
                            <div className="relative">
                              <Image
                                src={event.image || "/placeholder.svg"}
                                alt={event.title}
                                width={180}
                                height={100}
                                className="w-full h-24 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-1.5">
                                <div className="font-bold text-sm">{event.title}</div>
                                <div className="text-xs">{event.date}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events Section - Vertical scroll */}
                <div>
                  <h2 className="text-base font-bold mb-2">Upcoming!</h2>
                  <div className="space-y-3">
                    {events.upcoming.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full"
                        onClick={() => handleOpenEvent(event.id)}
                      >
                        <div className="relative">
                          <Image
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            width={340}
                            height={160}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2">
                            <div className="font-bold">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.date}</div>
                            {userRsvpStatus[event.id] && (
                              <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-[#ffd2b0]">
                                {userRsvpStatus[event.id] === "going" ? "Going" : "Maybe"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "profile":
        if (showIconSelector) {
          // Icon Selector View
          return (
            <div className="bg-white h-full flex flex-col">
              <header className="sticky top-0 z-10 p-3 border-b flex items-center bg-white">
                <button className="mr-3" onClick={() => setShowIconSelector(false)}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-base font-bold">
                  Select {iconSelectorType === "instrument" ? "Instruments" : "Genres"}
                </h1>
              </header>

              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-3">
                  {MUSIC_ICONS.filter((icon) => icon.type === iconSelectorType).map((icon) => {
                    const isSelected = formData.instruments.includes(icon.id) || formData.genres.includes(icon.id)
                    return (
                      <button
                        key={icon.id}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg relative ${
                          isSelected ? "bg-[#ffd2b0]" : "bg-gray-100"
                        }`}
                        onClick={() => toggleIconSelection(icon.id)}
                      >
                        <div className="text-2xl mb-1">{icon.emoji}</div>
                        <div className="text-xs">{icon.name}</div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#ffac6d] rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="sticky bottom-0 p-3 border-t bg-white">
                <Button
                  className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black h-9 text-xs"
                  onClick={() => setShowIconSelector(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          )
        } else if (editProfileMode) {
          // Edit Profile Mode
          return (
            <div className="bg-white h-full flex flex-col">
              <header className="sticky top-0 z-10 p-3 border-b flex items-center bg-white">
                <button className="mr-3" onClick={handleCancelEdit}>
                  <X className="h-5 w-5" />
                </button>
                <h1 className="text-base font-bold">Edit Profile</h1>
              </header>

              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="relative inline-block">
                      <div className="relative rounded-full overflow-hidden border-4 border-[#ffac6d] w-24 h-24">
                        <Image
                          src="/placeholder.svg?height=96&width=96"
                          alt="Profile"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-[#ffac6d] rounded-full p-1.5">
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium mb-1">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-xs font-medium mb-1">
                        Bio
                      </label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="min-h-[80px] text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-medium">Your Instruments</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#ffac6d] h-7 px-2"
                          onClick={() => openIconSelector("instrument")}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.instruments
                          .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
                          .filter((icon) => icon && icon.type === "instrument")
                          .map(
                            (icon) =>
                              icon && (
                                <div key={icon.id} className="bg-[#ffd2b0] rounded-full px-2 py-1 flex items-center">
                                  <span className="mr-1.5">{icon.emoji}</span>
                                  <span className="text-xs">{icon.name}</span>
                                </div>
                              ),
                          )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-medium">Your Genres</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#ffac6d] h-7 px-2"
                          onClick={() => openIconSelector("genre")}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.genres
                          .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
                          .filter((icon) => icon && icon.type === "genre")
                          .map(
                            (icon) =>
                              icon && (
                                <div key={icon.id} className="bg-[#ffd2b0] rounded-full px-2 py-1 flex items-center">
                                  <span className="mr-1.5">{icon.emoji}</span>
                                  <span className="text-xs">{icon.name}</span>
                                </div>
                              ),
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 p-3 border-t bg-white flex justify-end">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 h-9 text-xs" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#ffac6d] hover:bg-[#fdc193] text-black h-9 text-xs"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )
        } else {
          // Profile View Mode
          return (
            <div className="bg-white h-full flex flex-col">
              <header className="sticky top-0 z-10 p-3 border-b flex items-center justify-between bg-white">
                <div className="flex items-center">
                  <button className="mr-2" onClick={() => setMenuOpen(!menuOpen)}>
                    <Menu className="h-5 w-5" />
                  </button>
                  <h1 className="text-lg font-bold">Profile</h1>
                </div>
              </header>

              {menuOpen && renderHamburgerMenu()}

              <div className="flex-1 overflow-y-auto">
                <div className="p-3">
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative inline-block">
                      <div className="relative rounded-full overflow-hidden border-4 border-[#ffac6d] w-24 h-24">
                        <Image
                          src="/placeholder.svg?height=96&width=96"
                          alt="Profile"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>

                      {/* Music icons around profile picture */}
                      {profile.instruments
                        .concat(profile.genres)
                        .map((iconId, index) => {
                          const icon = MUSIC_ICONS.find((i) => i.id === iconId)
                          if (!icon) return null

                          // Calculate position in a circle around the profile picture
                          const totalIcons = profile.instruments.length + profile.genres.length
                          const angle = (index / totalIcons) * 2 * Math.PI

                          // Profile picture is 24px wide (radius 12px)
                          // But we need to account for the orange border (border-4 = 4px)
                          const profileRadius = 12
                          const borderWidth = 4
                          const totalProfileRadius = profileRadius + borderWidth

                          // Ensure icons are outside the orange border
                          // Use the total radius (including border) as the base
                          const iconPlacementRadius = totalProfileRadius * 1.25

                          // Calculate x and y coordinates
                          const x = Math.cos(angle) * iconPlacementRadius
                          const y = Math.sin(angle) * iconPlacementRadius

                          return (
                            <div
                              key={icon.id}
                              className="absolute bg-[#ffac6d] rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                              style={{
                                left: "50%",
                                top: "50%",
                                transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                                fontSize: "16px",
                                zIndex: 10,
                              }}
                            >
                              {icon.emoji}
                            </div>
                          )
                        })}
                    </div>

                    <h2 className="text-base font-bold mt-3">{profile.name}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Bio:</label>
                      <p className="text-xs bg-gray-50 p-2.5 rounded-lg">{profile.bio}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-medium">Instruments:</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.instruments
                          .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
                          .filter((icon) => icon && icon.type === "instrument")
                          .map(
                            (icon) =>
                              icon && (
                                <div key={icon.id} className="bg-[#ffd2b0] rounded-full px-2 py-1 flex items-center">
                                  <span className="mr-1.5">{icon.emoji}</span>
                                  <span className="text-xs">{icon.name}</span>
                                </div>
                              ),
                          )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-medium">Genres:</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.genres
                          .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
                          .filter((icon) => icon && icon.type === "genre")
                          .map(
                            (icon) =>
                              icon && (
                                <div key={icon.id} className="bg-[#ffd2b0] rounded-full px-2 py-1 flex items-center">
                                  <span className="mr-1.5">{icon.emoji}</span>
                                  <span className="text-xs">{icon.name}</span>
                                </div>
                              ),
                          )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Upcoming Events */}
                      <div>
                        <h3 className="text-xs font-medium mb-2">Upcoming Events</h3>
                        <div className="overflow-x-auto pb-2 hide-scrollbar">
                          <div className="flex space-x-2.5">
                            {userEvents.length > 0 ? (
                              userEvents
                                .map((eventId) => {
                                  const eventData = events.upcoming.find((e) => e.id === eventId)
                                  if (!eventData) return null
                                  return (
                                    <div
                                      key={eventData.id}
                                      className="rounded-lg overflow-hidden border flex-shrink-0 w-[160px]"
                                      onClick={() => handleOpenEvent(eventData.id)}
                                    >
                                      <Image
                                        src={eventData.image || "/placeholder.svg"}
                                        alt={eventData.title}
                                        width={160}
                                        height={80}
                                        className="w-full h-20 object-cover"
                                      />
                                      <div className="p-1.5">
                                        <div className="font-medium text-xs">{eventData.title}</div>
                                        <div className="text-xs text-gray-500">
                                          {eventData.date} •{" "}
                                          {userRsvpStatus[eventData.id] === "going" ? "Going" : "Maybe"}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })
                                .filter(Boolean)
                            ) : (
                              <div className="text-xs text-gray-500 p-2">No upcoming events yet</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Past Events */}
                      <div>
                        <h3 className="text-xs font-medium mb-2">Post Games 👀</h3>
                        <div className="overflow-x-auto pb-2 hide-scrollbar">
                          <div className="flex space-x-2.5">
                            {events.past.map((event) => (
                              <div
                                key={event.id}
                                className="rounded-lg overflow-hidden border opacity-70 flex-shrink-0 w-[160px]"
                                onClick={() => handleOpenEvent(event.id)}
                              >
                                <Image
                                  src={event.image || "/placeholder.svg"}
                                  alt={event.title}
                                  width={160}
                                  height={80}
                                  className="w-full h-20 object-cover"
                                />
                                <div className="p-1.5">
                                  <div className="font-medium text-xs">{event.title}</div>
                                  <div className="text-xs text-gray-500">{event.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 p-3 border-t bg-white">
                <Button
                  className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black h-9 text-xs"
                  onClick={() => {
                    setEditProfileMode(true)
                    setFormData({
                      name: profile.name,
                      bio: profile.bio,
                      instruments: [...profile.instruments],
                      genres: [...profile.genres],
                    })
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )
        }

      case "event":
        if (activeEventView === "chat") {
          // Event Chat View
          return (
            <div className="bg-white h-full flex flex-col">
              <header className="sticky top-0 z-10 p-3 border-b flex items-center justify-between bg-white">
                <div className="flex items-center">
                  <button className="mr-2" onClick={handleBackToEvents}>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-7 w-7 mr-2">
                    <Image src="/placeholder.svg?height=28&width=28" alt="Event" width={28} height={28} />
                  </Avatar>
                  <h1 className="text-base font-medium">{event.title}</h1>
                </div>
                <div className="flex">
                  <button
                    className={`p-1.5 rounded-full ${activeEventView === "chat" ? "bg-[#ffd2b0]" : "hover:bg-gray-100"}`}
                    onClick={() => setActiveEventView("chat")}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button
                    className={`p-1.5 ml-1 rounded-full ${activeEventView === "details" ? "bg-[#ffd2b0]" : "hover:bg-gray-100"}`}
                    onClick={() => setActiveEventView("details")}
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {event.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start ${message.isUser ? "justify-end gap-2" : "gap-2"}`}
                  >
                    {!message.isUser && (
                      <Avatar className="w-7 h-7">
                        <Image src="/placeholder.svg?height=28&width=28" alt={message.sender} width={28} height={28} />
                      </Avatar>
                    )}
                    <div>
                      {!message.isUser && <div className="text-xs text-gray-500">{message.time}</div>}
                      <div
                        className={`${message.isUser ? "bg-[#ffd2b0]" : "bg-gray-100"} rounded-lg p-2 mt-1 max-w-[240px]`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="text-center text-xs text-gray-500 my-3">Today</div>

                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <Image src="/placeholder.svg?height=28&width=28" alt="User" width={28} height={28} />
                  </Avatar>
                  <div className="text-xs text-gray-500">David, Melissa, Olivia typing...</div>
                </div>
              </div>

              <div className="sticky bottom-0 p-3 border-t bg-white">
                <div className="relative">
                  <Input placeholder="Send a message..." className="pr-9 h-9 text-sm rounded-full" />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Send className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )
        } else {
          // Event Details View
          return (
            <div className="bg-white h-full flex flex-col">
              <header className="sticky top-0 z-10 p-3 border-b flex items-center justify-between bg-white">
                <div className="flex items-center">
                  <button className="mr-2" onClick={handleBackToEvents}>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-7 w-7 mr-2">
                    <Image src="/placeholder.svg?height=28&width=28" alt="Event" width={28} height={28} />
                  </Avatar>
                  <h1 className="text-base font-medium">{event.title}</h1>
                </div>
                <div className="flex">
                  <button
                    className={`p-1.5 rounded-full ${activeEventView === "chat" ? "bg-[#ffd2b0]" : "hover:bg-gray-100"}`}
                    onClick={() => setActiveEventView("chat")}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button
                    className={`p-1.5 ml-1 rounded-full ${activeEventView === "details" ? "bg-[#ffd2b0]" : "hover:bg-gray-100"}`}
                    onClick={() => setActiveEventView("details")}
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto">
                <div className="relative w-full h-48">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 p-3 flex items-center">
                    <button
                      className="w-7 h-7 flex items-center justify-center bg-white bg-opacity-80 rounded-full"
                      onClick={handleBackToEvents}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 text-white">
                    <h1 className="text-base font-bold">{event.title}</h1>
                  </div>
                </div>

                <div className="p-3 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg
                        width="14"
                        height="14"
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
                      <span className="text-xs">{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        width="14"
                        height="14"
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
                      <span className="text-xs">{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        width="14"
                        height="14"
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
                      <span className="text-xs">{event.time}</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-medium mb-1">About</h2>
                    <p className="text-xs">{event.description}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-sm font-medium">Participants</h2>
                      <div className="text-xs text-[#ffac6d]">
                        {eventParticipantCounts[selectedEvent || "event-1"]?.going || event.participants.going.length}{" "}
                        Going ·
                        {eventParticipantCounts[selectedEvent || "event-1"]?.maybe || event.participants.maybe.length}{" "}
                        Maybe
                      </div>
                    </div>

                    {/* Tabs for Going/Maybe */}
                    <div className="flex border-b mb-3">
                      <button
                        className={`py-1.5 px-3 text-xs font-medium ${
                          participantsTab === "going"
                            ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setParticipantsTab("going")}
                      >
                        Going (
                        {eventParticipantCounts[selectedEvent || "event-1"]?.going || event.participants.going.length})
                      </button>
                      <button
                        className={`py-1.5 px-3 text-xs font-medium ${
                          participantsTab === "maybe"
                            ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setParticipantsTab("maybe")}
                      >
                        Maybe (
                        {eventParticipantCounts[selectedEvent || "event-1"]?.maybe || event.participants.maybe.length})
                      </button>
                    </div>

                    {/* Brick layout for participants */}
                    <div className="grid grid-cols-2 gap-2">
                      {participantsTab === "going"
                        ? event.participants.going.slice(0, 8).map((person, i) => (
                            <div
                              key={i}
                              className="flex items-center bg-[#ffd2b0] rounded-lg py-1.5 px-2 cursor-pointer hover:bg-[#fdc193] transition-colors shadow-sm h-10 w-full"
                              onClick={() => navigateToProfile(person.name)}
                            >
                              <Avatar className="w-6 h-6 mr-1.5 flex-shrink-0">
                                <Image
                                  src="/placeholder.svg?height=24&width=24"
                                  alt={person.name}
                                  width={24}
                                  height={24}
                                />
                              </Avatar>
                              <span className="font-medium text-xs truncate">
                                {person.name} {person.host && "(HOST)"}
                              </span>
                            </div>
                          ))
                        : event.participants.maybe.slice(0, 8).map((person, i) => (
                            <div
                              key={i}
                              className="flex items-center bg-[#ffd2b0] rounded-lg py-1.5 px-2 cursor-pointer hover:bg-[#fdc193] transition-colors shadow-sm h-10 w-full"
                              onClick={() => navigateToProfile(person.name)}
                            >
                              <Avatar className="w-6 h-6 mr-1.5 flex-shrink-0">
                                <Image
                                  src="/placeholder.svg?height=24&width=24"
                                  alt={person.name}
                                  width={24}
                                  height={24}
                                />
                              </Avatar>
                              <span className="font-medium text-xs truncate">{person.name}</span>
                            </div>
                          ))}
                    </div>

                    {/* View more button */}
                    {((participantsTab === "going" && event.participants.going.length > 8) ||
                      (participantsTab === "maybe" && event.participants.maybe.length > 8)) && (
                      <button className="w-full text-center text-xs text-[#ffac6d] font-medium mt-2 py-1">
                        View all participants
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 p-3 border-t bg-white flex gap-2">
                <Button
                  className={`flex-1 ${
                    userRsvpStatus[selectedEvent || ""] === "going"
                      ? "bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                      : "bg-white hover:bg-gray-100 text-black border border-gray-300"
                  } h-9 text-xs`}
                  onClick={() => handleRsvp(selectedEvent || "event-1", "going")}
                >
                  {userRsvpStatus[selectedEvent || ""] === "going" ? "Going ✓" : "I'm Going"}
                </Button>
                <Button
                  variant={userRsvpStatus[selectedEvent || ""] === "maybe" ? "default" : "outline"}
                  className={`flex-1 h-9 text-xs ${
                    userRsvpStatus[selectedEvent || ""] === "maybe"
                      ? "bg-[#ffd2b0] hover:bg-[#ffd2b0] text-black border-none"
                      : ""
                  }`}
                  onClick={() => handleRsvp(selectedEvent || "event-1", "maybe")}
                >
                  {userRsvpStatus[selectedEvent || ""] === "maybe" ? "Maybe ✓" : "Maybe"}
                </Button>
              </div>
            </div>
          )
        }

      case "create-event":
        return (
          <div className="bg-white h-full flex flex-col">
            <header className="sticky top-0 z-10 p-3 border-b flex items-center bg-white">
              <button className="mr-3" onClick={handleBackToEvents}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold">Create event</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Event Title</label>
                  <Input
                    placeholder="Title"
                    className="h-9 text-sm"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Event Image</label>
                  <div
                    className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => {
                      // Simulate setting an image
                      setEventForm((prev) => ({
                        ...prev,
                        image: "selected",
                      }))
                    }}
                  >
                    {eventForm.image ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 relative">
                        <div className="text-xs text-gray-600">Image selected</div>
                        <div className="absolute top-2 right-2 bg-white p-1 rounded-full">
                          <Camera className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-2.5 rounded-full">
                        <Camera className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Location</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        width="14"
                        height="14"
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
                      className="pl-9 h-9 text-sm"
                      name="location"
                      value={eventForm.location}
                      onChange={handleEventFormChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Date & Time</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        width="14"
                        height="14"
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
                      className="pl-9 h-9 text-sm"
                      name="dateTime"
                      value={eventForm.dateTime}
                      onChange={handleEventFormChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <div className="relative">
                    <div className="absolute left-3 top-3">
                      <svg
                        width="14"
                        height="14"
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
                      className="pl-9 min-h-[80px] text-sm"
                      name="description"
                      value={eventForm.description}
                      onChange={handleEventFormChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-3 border-t bg-white flex justify-end">
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 h-9 text-xs" onClick={handleBackToEvents}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#ffac6d] hover:bg-[#fdc193] text-black h-9 text-xs"
                  onClick={handlePostEvent}
                  disabled={!eventForm.title.trim()}
                >
                  Post Event
                </Button>
              </div>
            </div>
          </div>
        )

      case "bands":
        return (
          <div className="bg-white h-full flex flex-col">
            <header className="sticky top-0 z-10 p-3 border-b flex items-center justify-between bg-white">
              <div className="flex items-center">
                <button className="mr-2" onClick={() => setMenuOpen(!menuOpen)}>
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-bold">Your bands</h1>
              </div>
              <Button
                className="bg-[#ffac6d] hover:bg-[#fdc193] text-black h-8 text-xs px-2.5"
                size="sm"
                onClick={handleCreateBand}
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Create
              </Button>
            </header>

            {menuOpen && renderHamburgerMenu()}

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y">
                {bands.map((band) => (
                  <div
                    key={band.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOpenBandChat(band.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <Image src={band.image || "/placeholder.svg"} alt={band.name} width={40} height={40} />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold truncate text-sm">{band.name}</h3>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{band.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{band.message}</p>
                      </div>
                      {band.unread > 0 && (
                        <div className="ml-2 bg-[#ffac6d] text-black rounded-full h-4 min-w-4 flex items-center justify-center text-xs px-1">
                          {band.unread}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "create-band":
        return (
          <div className="bg-white h-full flex flex-col">
            <header className="sticky top-0 z-10 p-3 border-b flex items-center bg-white">
              <button className="mr-3" onClick={() => setActiveScreen("bands")}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold">Create band</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Band Name</label>
                  <Input
                    placeholder="Enter band name"
                    className="h-9 text-sm"
                    name="name"
                    value={bandForm.name}
                    onChange={handleBandFormChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Band Image</label>
                  <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                    <div className="bg-white p-2.5 rounded-full">
                      <Camera className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <Textarea
                    placeholder="Describe your band..."
                    className="min-h-[80px] text-sm"
                    name="description"
                    value={bandForm.description}
                    onChange={handleBandFormChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Add Members</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        placeholder="Search for members..."
                        className="pl-8 h-9 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Selected members */}
                    {selectedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedMembers.map((member) => (
                          <div key={member.id} className="flex items-center bg-[#ffd2b0] rounded-full pl-1 pr-2 py-0.5">
                            <Avatar className="h-5 w-5 mr-1">
                              <Image
                                src={member.image || "/placeholder.svg"}
                                alt={member.name}
                                width={20}
                                height={20}
                              />
                            </Avatar>
                            <span className="text-xs">{member.name}</span>
                            <button
                              className="ml-1 text-gray-600 hover:text-gray-900"
                              onClick={() => removeMember(member.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search results */}
                    {searchTerm && (
                      <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => addMember(user)}
                            >
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <Image
                                    src={user.image || "/placeholder.svg"}
                                    alt={user.name}
                                    width={24}
                                    height={24}
                                  />
                                </Avatar>
                                <span className="text-xs">{user.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center text-xs text-gray-500">No users found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Primary Genre</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    name="genre"
                    value={bandForm.genre}
                    onChange={handleBandFormChange}
                  >
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

            <div className="sticky bottom-0 p-3 border-t bg-white flex justify-end">
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => setActiveScreen("bands")}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#ffac6d] hover:bg-[#fdc193] text-black h-9 text-xs"
                  onClick={handleSubmitBand}
                >
                  Create Band
                </Button>
              </div>
            </div>
          </div>
        )

      case "chat":
        // Find the selected band data
        const selectedBandData = bands.find((band) => band.id === selectedBand) || bands[0]

        return (
          <div className="bg-white h-full flex flex-col">
            <header className="sticky top-0 z-10 p-3 border-b flex items-center justify-between bg-white">
              <div className="flex items-center">
                <button className="mr-2" onClick={handleBackToBands}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-7 w-7 mr-2">
                  <Image
                    src={selectedBandData.image || "/placeholder.svg"}
                    alt={selectedBandData.name}
                    width={28}
                    height={28}
                  />
                </Avatar>
                <h1 className="text-base font-medium">{selectedBandData.name}</h1>
              </div>
              <div className="flex">
                <button className="p-1.5 hover:bg-gray-100 rounded-full">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Sample messages - would be dynamic in a real app */}
              <div className="flex items-start gap-2">
                <Avatar className="w-7 h-7">
                  <Image src="/placeholder.svg?height=28&width=28" alt="Tommy" width={28} height={28} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">Tommy • Monday 7:41 PM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-[240px]">
                    <p className="text-sm">Hey everyone! When's our next practice?</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-end gap-2">
                <div>
                  <div className="bg-[#ffd2b0] rounded-lg p-2 mt-1 max-w-[240px]">
                    <p className="text-sm">I'm free on Thursday evening if that works</p>
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">Monday 7:45 PM</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Avatar className="w-7 h-7">
                  <Image src="/placeholder.svg?height=28&width=28" alt="Melissa" width={28} height={28} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">Melissa • Wednesday 12:15 PM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-[240px]">
                    <p className="text-sm">Thursday works for me too!</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Avatar className="w-7 h-7">
                  <Image src="/placeholder.svg?height=28&width=28" alt="David" width={28} height={28} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">David • Wednesday 1:30 PM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-[240px]">
                    <p className="text-sm">I can make it Thursday. Should we try that new riff we were working on?</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Avatar className="w-7 h-7">
                  <Image src="/placeholder.svg?height=28&width=28" alt="Sophie" width={28} height={28} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">Sophie • Wednesday 2:05 PM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-[240px]">
                    <p className="text-sm">Yes! And I have some new lyrics to share too.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-end gap-2">
                <div>
                  <div className="bg-[#ffd2b0] rounded-lg p-2 mt-1 max-w-[240px]">
                    <p className="text-sm">Awesome! Can't wait to hear them.</p>
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">Wednesday 2:10 PM</div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 my-3">Today</div>

              <div className="flex items-start gap-2">
                <Avatar className="w-7 h-7">
                  <Image src="/placeholder.svg?height=28&width=28" alt="Candy" width={28} height={28} />
                </Avatar>
                <div>
                  <div className="text-xs text-gray-500">Candy • 10:42 AM</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-[240px]">
                    <p className="text-sm">ya I think I have spare headphones if anyone needs them</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-3 border-t bg-white">
              <div className="relative">
                <Input placeholder="Send a message..." className="pr-9 h-9 text-sm rounded-full" />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Send className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex justify-center p-4 md:p-8">
      <div className="relative w-[375px] h-[812px] overflow-hidden border border-gray-300 rounded-[40px] shadow-lg bg-black">
        {/* iPhone Notch */}
        <div className="absolute top-0 left-0 right-0 h-[30px] bg-black z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-[14px]"></div>
        </div>

        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-[44px] flex items-center justify-between px-6 z-20">
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

        {/* Browser UI */}
        <div className="absolute top-[44px] left-0 right-0 h-8 bg-gray-100 border-b flex items-center px-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <div className="mx-auto bg-white rounded-full px-3 py-1 text-xs text-gray-500 flex items-center">
            <span>jamboree.app</span>
          </div>
        </div>

        {/* App Content */}
        <div className="absolute top-[76px] left-0 right-0 bottom-0 bg-white overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  )
}
