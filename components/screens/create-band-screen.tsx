"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, ChevronLeft, Plus, Search, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Avatar } from "@/components/ui/avatar"
import Image from "next/image"

interface CreateBandScreenProps {
  onCancel: () => void
}

export default function CreateBandScreen({ onCancel }: CreateBandScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
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

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col">
      <header className="p-4 md:p-6 border-b flex items-center">
        <button className="mr-3" onClick={onCancel}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">Create band</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Band Name</label>
              <Input placeholder="Enter band name" className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Band Image</label>
              <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                <div className="bg-white p-4 rounded-full">
                  <Camera className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea placeholder="Describe your band..." className="min-h-[120px]" />
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
                          <Image src={member.image || "/placeholder.svg"} alt={member.name} width={24} height={24} />
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
                              <Image src={user.image || "/placeholder.svg"} alt={user.name} width={32} height={32} />
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
      </div>

      <div className="p-4 md:p-6 border-t flex justify-end">
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className={isDesktop ? "" : "flex-1"} onClick={onCancel}>
            Cancel
          </Button>
          <Button className={`bg-[#ffac6d] hover:bg-[#fdc193] text-black ${isDesktop ? "" : "flex-1"}`}>
            Create Band
          </Button>
        </div>
      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
