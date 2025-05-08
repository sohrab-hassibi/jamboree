"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ChevronLeft, Send, Info, Phone, Video } from "lucide-react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState } from "react"

interface BandChatScreenProps {
  bandId?: string
  onBack: () => void
}

export default function BandChatScreen({ bandId = "default-band", onBack }: BandChatScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [messageText, setMessageText] = useState("")

  // Mock band data - in a real app, this would be fetched based on bandId
  const band = {
    id: bandId,
    name: "The ideal conditions",
    members: [
      { id: "user-1", name: "Tommy", image: "/placeholder.svg?height=32&width=32" },
      { id: "user-2", name: "Candy", image: "/placeholder.svg?height=32&width=32" },
      { id: "user-3", name: "Melissa", image: "/placeholder.svg?height=32&width=32" },
      { id: "user-4", name: "David", image: "/placeholder.svg?height=32&width=32" },
      { id: "user-5", name: "Sophie", image: "/placeholder.svg?height=32&width=32" },
    ],
    messages: [
      {
        id: "msg-1",
        sender: "Tommy",
        senderId: "user-1",
        text: "Hey everyone! When's our next practice?",
        time: "Monday 7:41 PM",
        image: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "msg-2",
        sender: "You",
        senderId: "current-user",
        text: "I'm free on Thursday evening if that works",
        time: "Monday 7:45 PM",
        isUser: true,
      },
      {
        id: "msg-3",
        sender: "Melissa",
        senderId: "user-3",
        text: "Thursday works for me too!",
        time: "Wednesday 12:15 PM",
        image: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "msg-4",
        sender: "David",
        senderId: "user-4",
        text: "I can make it Thursday. Should we try that new riff we were working on?",
        time: "Wednesday 1:30 PM",
        image: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "msg-5",
        sender: "Sophie",
        senderId: "user-5",
        text: "Yes! And I have some new lyrics to share too.",
        time: "Wednesday 2:05 PM",
        image: "/placeholder.svg?height=32&width=32",
      },
      {
        id: "msg-6",
        sender: "You",
        senderId: "current-user",
        text: "Awesome! Can't wait to hear them.",
        time: "Wednesday 2:10 PM",
        isUser: true,
      },
      {
        id: "msg-7",
        sender: "Candy",
        senderId: "user-2",
        text: "ya I think I have spare headphones if anyone needs them",
        time: "Today 10:42 AM",
        image: "/placeholder.svg?height=32&width=32",
      },
    ],
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message to a backend
      console.log("Sending message:", messageText)
      setMessageText("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-white lg:h-screen flex flex-col">
      <header className="flex items-center p-4 md:p-6 border-b">
        <button className="mr-2" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <Image src="/placeholder.svg?height=32&width=32" alt={band.name} width={32} height={32} />
          </Avatar>
          <h1 className="text-lg font-medium">{band.name}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {band.messages.map((message) => (
            <div key={message.id} className={`flex items-start ${message.isUser ? "justify-end gap-2" : "gap-2"}`}>
              {!message.isUser && (
                <Avatar className="w-8 h-8">
                  <Image src={message.image || "/placeholder.svg"} alt={message.sender} width={32} height={32} />
                </Avatar>
              )}
              <div>
                {!message.isUser && (
                  <div className="text-xs text-gray-500">
                    {message.sender} • {message.time}
                  </div>
                )}
                <div className={`${message.isUser ? "bg-[#ffd2b0]" : "bg-gray-100"} rounded-lg p-2 mt-1 max-w-xs`}>
                  <p className="text-sm">{message.text}</p>
                </div>
                {message.isUser && <div className="text-xs text-gray-500 text-right mt-1">{message.time}</div>}
              </div>
            </div>
          ))}
        </div>

        {isDesktop && (
          <div className="w-64 border-l hidden lg:block">
            <div className="p-4 border-b">
              <h2 className="font-medium">Band Members</h2>
            </div>
            <div className="p-2">
              <div className="space-y-1 mt-2">
                {band.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <Avatar className="w-6 h-6">
                      <Image src={member.image || "/placeholder.svg"} alt={member.name} width={24} height={24} />
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="relative">
          <Input
            placeholder="Send a message..."
            className="pr-10 rounded-full"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={handleSendMessage}>
            <Send className={`h-5 w-5 ${messageText.trim() ? "text-[#ffac6d]" : "text-gray-400"}`} />
          </button>
        </div>
      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
