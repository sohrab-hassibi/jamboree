"use client"

import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ChevronLeft, Send } from "lucide-react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function ChatScreen() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div className="min-h-screen bg-white lg:bg-transparent lg:min-h-0 lg:rounded-xl lg:overflow-hidden lg:border lg:shadow-sm lg:my-6 flex flex-col">
      <header className="flex items-center p-4 md:p-6 border-b">
        {!isDesktop && (
          <button className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <Image src="/placeholder.svg?height=32&width=32" alt="Group" width={32} height={32} />
          </Avatar>
          <h1 className="text-lg font-medium">Old Peeps Jam</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8">
              <Image src="/placeholder.svg?height=32&width=32" alt="User" width={32} height={32} />
            </Avatar>
            <div>
              <div className="text-xs text-gray-500">Monday 7:41 PM</div>
              <div className="bg-gray-100 rounded-lg p-2 mt-1 max-w-xs">
                <p className="text-sm">Guys, we should meet to do the poster design for the next jam!</p>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-end gap-2">
            <div>
              <div className="bg-[#ffd2b0] rounded-lg p-2 mt-1 max-w-xs">
                <p className="text-sm">I could meet on Friday if that works for you guys</p>
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
                <p className="text-sm">Friday works for me! What time would be good?</p>
              </div>
            </div>
          </div>

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
              <div className="flex justify-between items-center px-2 py-1">
                <div className="font-medium">Going (14)</div>
                <div className="font-medium text-[#ffac6d]">Maybe (7)</div>
              </div>

              <div className="space-y-1 mt-2">
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
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <Avatar className="w-6 h-6">
                      <Image src="/placeholder.svg?height=24&width=24" alt={person.name} width={24} height={24} />
                    </Avatar>
                    <span className="text-sm">
                      {person.name} {person.host && "(HOST)"}
                    </span>
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

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
