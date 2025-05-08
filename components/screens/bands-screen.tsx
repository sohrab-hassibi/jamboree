"use client"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState } from "react"
import BandChatScreen from "./band-chat-screen"

interface BandsScreenProps {
  onCreateBand?: () => void
}

export default function BandsScreen({ onCreateBand }: BandsScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [selectedBand, setSelectedBand] = useState<string | null>(null)

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
    {
      id: "band-4",
      name: "Jazz Collective",
      message: "Mark: Let's meet at 7pm for rehearsal",
      time: "Monday",
      image: "/placeholder.svg?height=64&width=64",
      unread: 0,
    },
    {
      id: "band-5",
      name: "Acoustic Sessions",
      message: "Emma: Can someone bring an extra mic?",
      time: "5/1/24",
      image: "/placeholder.svg?height=64&width=64",
      unread: 1,
    },
  ]

  // Function to handle opening a chat
  const handleOpenChat = (bandId: string) => {
    setSelectedBand(bandId)
  }

  // Function to go back to bands list
  const handleBackToBands = () => {
    setSelectedBand(null)
  }

  // If a band is selected, show the chat screen
  if (selectedBand) {
    return <BandChatScreen bandId={selectedBand} onBack={handleBackToBands} />
  }

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col">
      <header className="p-4 md:p-6 border-b flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Your bands</h1>
        {isDesktop && (
          <Button className="bg-[#ffac6d] hover:bg-[#fdc193] text-black" onClick={onCreateBand}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Band
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y">
          {bands.map((band) => (
            <div
              key={band.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleOpenChat(band.id)}
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

      {!isDesktop && (
        <div className="p-4 border-t">
          <Button className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black" onClick={onCreateBand}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Band
          </Button>
        </div>
      )}

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
