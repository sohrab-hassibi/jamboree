"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Search, X, Loader2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Avatar } from "@/components/ui/avatar"
import Image from "next/image"
import { useBands } from "@/hooks/use-bands"
import { useBandMembers } from "@/hooks/use-band-members"
import { useAuth } from "@/context/SupabaseContext"
import { toast } from "sonner"

interface CreateBandScreenProps {
  onCancel: () => void
}

export default function CreateBandScreen({ onCancel }: CreateBandScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const { user } = useAuth()
  const { createBand } = useBands()
  const { searchUsers } = useBandMembers("") // Empty string as we don't have a band ID yet
  
  // Form state
  const [bandName, setBandName] = useState("")
  const [description, setDescription] = useState("")
  const [genre, setGenre] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Search and member selection state
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; full_name: string; avatar_url: string }[]>([])

  // Handle user search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        return
      }
      
      try {
        setIsSearching(true)
        const results = await searchUsers(searchTerm)
        setSearchResults(results || [])
      } catch (error) {
        console.error("Error searching users:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }
    
    // Debounce search
    const timeoutId = setTimeout(handleSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchUsers])
  
  // Filter out already selected members
  const filteredUsers = searchResults.filter(
    (user) => !selectedMembers.some((member) => member.id === user.id)
  )

  // Add member to selected members
  const addMember = (user: { id: string; full_name: string; avatar_url: string }) => {
    setSelectedMembers([...selectedMembers, user])
    setSearchTerm("")
  }

  // Remove member from selected members
  const removeMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== userId))
  }
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!bandName.trim()) {
      toast.error("Please enter a band name")
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Create the band
      const result = await createBand({
        name: bandName.trim(),
        description: description.trim() || undefined,
        // We could add genre and image_url here if needed
      })
      
      if (result.error) {
        throw result.error
      }
      
      if (!result.band) {
        throw new Error("Failed to create band")
      }
      
      // Add the current user as a member with 'creator' role
      const bandId = result.band.id
      if (user?.id) {
        await result.addBandMember(bandId, user.id, 'creator')
      }
      
      // Add selected members to the band
      const addMemberPromises = selectedMembers.map(member => 
        result.addBandMember(bandId, member.id)
      )
      
      await Promise.all(addMemberPromises)
      
      toast.success("Band created successfully!")
      onCancel() // Go back to bands screen
      
    } catch (error) {
      console.error("Error creating band:", error)
      toast.error("Failed to create band. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
              <Input 
                placeholder="Enter band name" 
                className="w-full" 
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea 
                placeholder="Describe your band..." 
                className="min-h-[120px]" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
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
                          <Image src={member.avatar_url || "/placeholder.svg"} alt={member.full_name} width={24} height={24} />
                        </Avatar>
                        <span className="text-sm">{member.full_name}</span>
                        <button
                          className="ml-1 text-gray-600 hover:text-gray-900"
                          onClick={() => removeMember(member.id)}
                          disabled={isSubmitting}
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
                    {isSearching ? (
                      <div className="p-3 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-2 hover:bg-gray-100 ${isSubmitting ? 'opacity-50' : 'cursor-pointer'}`}
                          onClick={isSubmitting ? undefined : () => addMember({
                            id: user.id,
                            full_name: user.full_name,
                            avatar_url: user.avatar_url
                          })}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <Image src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} width={32} height={32} />
                            </Avatar>
                            <span>{user.full_name}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isSubmitting}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : searchTerm.length >= 2 ? (
                      <div className="p-3 text-center text-gray-500">No users found</div>
                    ) : (
                      <div className="p-3 text-center text-gray-500">Type at least 2 characters to search</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Genre</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={isSubmitting}
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
              <p className="text-xs text-muted-foreground mt-1">Optional - you can add more genres later</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border-t flex justify-end">
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            className={isDesktop ? "" : "flex-1"} 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            className={`bg-[#ffac6d] hover:bg-[#fdc193] text-black ${isDesktop ? "" : "flex-1"}`}
            onClick={handleSubmit}
            disabled={isSubmitting || !bandName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Band"
            )}
          </Button>
        </div>
      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
