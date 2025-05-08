"use client"

import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ArrowRight, Check, X, ChevronLeft, Share2, Heart, Send } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function EventDetailScreen() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

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
          {!isDesktop && (
            <button className="w-8 h-8 flex items-center justify-center bg-white bg-opacity-80 rounded-full">
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

            {isDesktop && (
              <div className="flex gap-2">
                <Button className="bg-[#ffac6d] hover:bg-[#fdc193] text-black">I'm Going</Button>
                <Button variant="outline">Maybe</Button>
              </div>
            )}
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
              <div className="text-sm text-[#ffac6d]">14 Going · 7 Maybe</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { name: "Tommy", host: true },
                { name: "Chloe" },
                { name: "Sophie" },
                { name: "Angel" },
                { name: "Ruby" },
                { name: "Katie" },
                { name: "Paula" },
                { name: "Nagisha" },
              ].map((person, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#ffd2b0]">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <Image src="/placeholder.svg?height=32&width=32" alt={person.name} width={32} height={32} />
                    </Avatar>
                    <span>
                      {person.name} {person.host && "(HOST)"}
                    </span>
                  </div>
                  <div>
                    {i % 2 === 0 ? (
                      <ArrowRight className="h-5 w-5" />
                    ) : i % 3 === 0 ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                  </div>
                </div>
              ))}
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
