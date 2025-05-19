"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ArrowRight, Check, X, ChevronLeft, Share2, Heart, Send, CheckCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useEventParticipation } from "@/hooks/use-event-participation"
import { ParticipantCard } from "@/components/participant-card"
import { Participant } from "@/hooks/use-event"

const musicIcons = [
  { id: "guitar", name: "Guitar", emoji: "🎸", type: "instrument" },
  { id: "piano", name: "Piano", emoji: "🎹", type: "instrument" },
  { id: "drums", name: "Drums", emoji: "🥁", type: "instrument" },
  { id: "saxophone", name: "Saxophone", emoji: "🎷", type: "instrument" },
  { id: "trumpet", name: "Trumpet", emoji: "🎺", type: "instrument" },
  { id: "violin", name: "Violin", emoji: "🎻", type: "instrument" },
  { id: "microphone", name: "Vocals", emoji: "🎤", type: "instrument" },
  { id: "dj", name: "DJ", emoji: "🎧", type: "instrument" },
  { id: "rock", name: "Rock", emoji: "🤘", type: "genre" },
  { id: "pop", name: "Pop", emoji: "🎵", type: "genre" },
  { id: "jazz", name: "Jazz", emoji: "🎶", type: "genre" },
  { id: "classical", name: "Classical", emoji: "🎼", type: "genre" },
  { id: "electronic", name: "Electronic", emoji: "💿", type: "genre" },
  { id: "hiphop", name: "Hip Hop", emoji: "🔊", type: "genre" },
  { id: "country", name: "Country", emoji: "🤠", type: "genre" },
  { id: "reggae", name: "Reggae", emoji: "🌴", type: "genre" },
];

interface EventDetailScreenProps {
  eventId: string;
  onBack?: () => void;
}

export default function EventDetailScreen({ eventId, onBack }: EventDetailScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const { 
    status: participationStatus, 
    isLoading, 
    handleGoing, 
    handleMaybe,
    participants
  } = useEventParticipation(eventId)

  return (
    <div className="min-h-screen bg-white lg:bg-transparent lg:min-h-0 lg:rounded-xl lg:overflow-hidden lg:border lg:shadow-sm lg:my-6 flex flex-col">
      <div className="relative w-full h-48 md:h-64 lg:h-80">
        <Image
          src="/placeholder.svg?height=400&width=800"
          alt="Event"
          width={800}
          height={400}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center">
          {!isDesktop && onBack && (
            <button 
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center bg-white bg-opacity-80 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="ml-auto flex space-x-2">
            <button className="w-8 h-8 flex items-center justify-center bg-white bg-opacity-80 rounded-full">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-white bg-opacity-80 rounded-full">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 text-white">
          <h1 className="text-lg md:text-xl font-bold">Old Peeps Jam</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="space-y-2">
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
                <span className="text-sm">Rooftop Farm</span>
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
                <span className="text-sm">Sunday May 4</span>
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
                <span className="text-sm">7:30 PM</span>
              </div>
            </div>

            <div className={`flex flex-col sm:flex-row gap-2 ${isDesktop ? '' : 'mt-4'}`}>
              <Button 
                onClick={handleGoing}
                disabled={isLoading}
                variant={participationStatus === 'going' ? 'default' : 'outline'}
                className={`flex-1 justify-center ${participationStatus === 'going' 
                  ? 'bg-orange-50 hover:bg-orange-50 border-orange-200 text-orange-700' 
                  : 'hover:bg-gray-50'}`}
              >
                {participationStatus === 'going' ? (
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300 mr-1.5" />
                )}
                I'm Going
              </Button>
              <Button 
                onClick={handleMaybe}
                disabled={isLoading}
                variant={participationStatus === 'maybe' ? 'default' : 'outline'}
                className={`flex-1 justify-center ${participationStatus === 'maybe' 
                  ? 'bg-[#ffac6d] hover:bg-[#fdc193] text-black' 
                  : 'hover:bg-gray-50'}`}
              >
                {participationStatus === 'maybe' ? (
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300 mr-1.5" />
                )}
                Maybe
              </Button>
              {(participationStatus === 'going' || participationStatus === 'maybe') && (
                <Button 
                  onClick={participationStatus === 'going' ? handleMaybe : handleGoing}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700 mt-1 sm:mt-0"
                >
                  Change to {participationStatus === 'going' ? 'Maybe' : 'Going'}
                </Button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-medium mb-2">About</h2>
            <p className="text-sm">
              Everyone is invited to this fun rooftop jam with some food and drinks! Bring your instruments if you want
              to join in. We'll have a small PA system set up and some basic equipment available.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium">Participants</h2>
              <div className="text-sm text-[#ffac6d]">
                {participationStatus === 'going' ? 'You\'re going' : participationStatus === 'maybe' ? 'You might go' : 'Not going'}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex border-b">
                <button className="px-4 py-2 font-medium border-b-2 border-orange-500 text-orange-600">
                  Going ({participants.going.length || 0})
                </button>
                <button className="px-4 py-2 font-medium text-gray-500">
                  Maybe ({participants.maybe.length || 0})
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {participants.going.map((participant) => (
                <div key={participant.id} className="bg-[#ffd2b0] rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <Image src={participant.avatar_url || '/placeholder.svg'} alt={participant.full_name || 'User'} width={24} height={24} />
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{participant.full_name}</div>
                      <div className="flex mt-1 gap-1">
                        <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs text-orange-600" title="Instrument">🎸</span>
                        <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs text-orange-600" title="Genre">🤘</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {participants.going.length === 0 && (
                <div className="text-center py-4 text-gray-500">No participants yet</div>
              )}
            </div>
          </div>
          </div>
        </div>

        {isDesktop && (
          <div className="w-64 border-l p-4">
            <h2 className="font-medium mb-4">Event Chat</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Avatar className="w-6 h-6">
                  <Image src="/placeholder.svg?height=24&width=24" alt="User" width={24} height={24} />
                </Avatar>
                <div>
                  <div className="text-xs font-medium">Tommy</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1">
                    <p className="text-xs">Can't wait for this jam session!</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Avatar className="w-6 h-6">
                  <Image src="/placeholder.svg?height=24&width=24" alt="User" width={24} height={24} />
                </Avatar>
                <div>
                  <div className="text-xs font-medium">Sophie</div>
                  <div className="bg-gray-100 rounded-lg p-2 mt-1">
                    <p className="text-xs">I'll bring my guitar!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative">
                <Input placeholder="Send a message..." className="pr-10 text-sm" />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Send className="h-4 w-4 text-gray-400" />
                </button>
              </div>
          </div>
        )}
      </div>

      {!isDesktop && (
        <div className="p-4 border-t flex gap-2">
          <Button className="flex-1 bg-[#ffac6d] hover:bg-[#fdc193] text-black">I'm Going</Button>
          <Button variant="outline" className="flex-1">
            Maybe
          </Button>
        </div>
      )}

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
