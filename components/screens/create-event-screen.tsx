"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, MapPin, Clock, FileText, ChevronLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface CreateEventScreenProps {
  onCancel: () => void
}

export default function CreateEventScreen({ onCancel }: CreateEventScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col">
      <header className="p-4 md:p-6 border-b flex items-center">
        <button className="mr-3" onClick={onCancel}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">Create event</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Event Title</label>
              <Input placeholder="Title" className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Event Image</label>
              <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                <div className="bg-white p-4 rounded-full">
                  <Camera className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <MapPin className="h-5 w-5 text-[#b3261e]" />
                  </div>
                  <Input placeholder="Location" className="pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date & Time</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Clock className="h-5 w-5 text-[#49454f]" />
                  </div>
                  <Input placeholder="Date & Time" className="pl-10" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <div className="relative">
                <div className="absolute left-3 top-3">
                  <FileText className="h-5 w-5 text-[#49454f]" />
                </div>
                <Textarea placeholder="Description" className="pl-10 min-h-[120px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border-t flex justify-end">
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className={isDesktop ? "" : "flex-1"} onClick={onCancel}>
            Cancel
          </Button>
          <Button className={`bg-[#ffac6d] hover:bg-[#fdc193] text-black ${isDesktop ? "" : "flex-1"}`}>
            Post Event
          </Button>
        </div>
      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
