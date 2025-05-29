"use client"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useState, useEffect } from "react"
import BandChatScreen from "./band-chat-screen"
import { useBands, type Band } from "@/hooks/use-bands"
import { formatDistanceToNow } from "date-fns"

interface BandsScreenProps {
  onCreateBand?: () => void
}

export default function BandsScreen({ onCreateBand }: BandsScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [selectedBand, setSelectedBand] = useState<string | null>(null)
  const { bands, isLoading, error, fetchBands } = useBands()
  
  // Format the last message for each band
  const getBandLastMessage = (band: Band) => {
    if (!band.last_message) {
      return {
        message: "No messages yet",
        time: formatDistanceToNow(new Date(band.updated_at), { addSuffix: true }),
        unread: 0
      };
    }
    
    // Format the message with sender name if available
    const message = band.last_message.user_full_name 
      ? `${band.last_message.user_full_name}: ${band.last_message.text}` 
      : band.last_message.text;
      
    return {
      message,
      time: formatDistanceToNow(new Date(band.last_message.created_at), { addSuffix: true }),
      unread: 0 // We'll implement unread count later
    };
  };
  
  // Add some mock bands if needed for testing
  const mockBands = [
    {
      id: "band-5",
      name: "Acoustic Sessions",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]

  // Function to handle opening a chat
  const handleOpenChat = (bandId: string) => {
    setSelectedBand(bandId)
  }

  // Function to go back to bands list
  const handleBackToBands = () => {
    setSelectedBand(null)
  }

  // If a band is selected and not in desktop mode, show the chat screen
  if (selectedBand && !isDesktop) {
    return <BandChatScreen bandId={selectedBand} onBack={handleBackToBands} />
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background lg:flex-row">
      {!selectedBand || !isDesktop ? (
        <div className="flex h-full w-full flex-col overflow-hidden">
          {/* UPDATED: Sticky header */}
          <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b p-4 md:p-6 shadow-sm">
            <h1 className="text-xl md:text-2xl font-bold">Bands</h1>
            <Button
              className="bg-[#ffac6d] hover:bg-[#fdc193] text-black"
              onClick={onCreateBand}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Band
            </Button>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <p className="text-muted-foreground">Failed to load bands</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchBands()}>
                  Retry
                </Button>
              </div>
            ) : bands.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <div className="max-w-sm space-y-4">
                  <div className="text-4xl mb-2">🎸</div>
                  <h2 className="text-xl font-bold">No Bands Yet</h2>
                  <p className="text-muted-foreground">
                    Create a band to start casually chatting or collaborating with other musicians! You can invite members, 
                    chat about upcoming gigs, coordinate practice sessions, or just shoot the shit.
                  </p>
                  <Button 
                    onClick={onCreateBand}
                    className="bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Band
                  </Button>
                </div>
              </div>
            ) : (
              bands.map((band) => (
                <div
                  key={band.id}
                  className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-accent"
                  onClick={() => setSelectedBand(band.id)}
                >
                  <Avatar className="h-12 w-12 border">
                    <Image
                      src="/placeholder.svg"
                      alt={band.name}
                      width={48}
                      height={48}
                    />
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{band.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {getBandLastMessage(band).time}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {getBandLastMessage(band).message}
                    </p>
                  </div>
                  {getBandLastMessage(band).unread > 0 && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {getBandLastMessage(band).unread}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <BandChatScreen bandId={selectedBand} onBack={handleBackToBands} />
      )}

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
