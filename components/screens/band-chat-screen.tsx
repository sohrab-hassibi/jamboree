"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"

import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Send, Info, MessageSquare, Users, Loader2 } from "lucide-react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useBands } from "@/hooks/use-bands"
import { useBandMessages, type BandMessage } from "@/hooks/use-band-messages"
import { useBandMembers, type BandMember } from "@/hooks/use-band-members"
import { useAuth } from "@/context/SupabaseContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface BandChatScreenProps {
  bandId?: string
  onBack: () => void
}

export default function BandChatScreen({ bandId = "", onBack }: BandChatScreenProps) {
  const router = useRouter()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [messageText, setMessageText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  
  // Get band data
  const { bands } = useBands()
  const band = bands.find(b => b.id === bandId) || { id: bandId, name: "Loading..." }
  
  // Get band messages
  const { messages, isLoading: messagesLoading, error: messagesError, sendMessage } = useBandMessages(bandId)
  
  // Get band members
  const { members, isLoading: membersLoading, error: membersError, leaveBand } = useBandMembers(bandId)
  
  // Directly fetch band members from Supabase
  const [directMembers, setDirectMembers] = useState<any[]>([])
  const [directLoading, setDirectLoading] = useState(true)
  
  // Process member data with profile information
  const processMembers = (memberData: any[], profileData: any[]) => {
    console.log('Processing members with profiles:', { memberData, profileData })
    
    // Combine the data
    const data = memberData.map(member => {
      console.log(`Looking for profile with id ${member.user_id}`)
      const profile = profileData.find((profile: any) => profile.id === member.user_id)
      console.log(`Found profile for ${member.user_id}:`, profile)
      
      return {
        ...member,
        user: profile || {
          // Fallback profile if not found
          id: member.user_id,
          full_name: 'Unknown Member',
          avatar_url: '/placeholder.svg'
        }
      }
    })
    
    console.log('Combined member data:', data)
    setDirectMembers(data)
    setDirectLoading(false)
  }
  
  useEffect(() => {
    const fetchBandMembers = async () => {
      if (!bandId) return
      
      try {
        setDirectLoading(true)
        
        console.log('Fetching members for band ID:', bandId)
        
        // Get band members (simple query without join)
        const { data: memberData, error: memberError } = await supabase
          .from('band_members')
          .select('*')
          .eq('band_id', bandId)
        
        if (memberError) {
          console.error('Error fetching band members:', memberError)
          return
        }
        
        console.log('Raw band members:', memberData)
        
        if (!memberData || memberData.length === 0) {
          setDirectMembers([])
          return
        }
        
        // Then, get the profiles for each member
        const userIds = memberData.map(member => member.user_id).filter(id => id !== null && id !== undefined)
        console.log('User IDs to fetch profiles for:', userIds)
        
        // If no valid user IDs, skip the profile query
        if (userIds.length === 0) {
          console.log('No valid user IDs to fetch profiles for')
          console.log('Processing members without profile data')
        
          // Create simplified user objects for each member
          const processedMembers = memberData.map(member => ({
            ...member,
            user: {
              id: member.user_id,
              full_name: member.user_id || 'Unknown User',
              avatar_url: '/placeholder.svg'
            }
          }))
        
          console.log('Processed members:', processedMembers)
          setDirectMembers(processedMembers)
          setDirectLoading(false)
          return
        }
        
        // Fetch user details using the same approach as in use-event.ts
        try {
          // Get the user IDs from the members
          const userIds = memberData.map(member => member.user_id).filter(id => id !== null && id !== undefined);
          console.log('User IDs to fetch details for:', userIds);
          
          if (userIds.length === 0) {
            // No valid user IDs, use default names
            const processedMembers = memberData.map((member: any) => ({
              ...member,
              user: {
                id: member.user_id,
                full_name: member.role === 'creator' ? 'Band Creator' : 'Band Member',
                avatar_url: '/placeholder.svg'
              }
            }));
            
            setDirectMembers(processedMembers);
            return;
          }
          
          // Fetch user details from the users table (same as in use-event.ts)
          const userPromises = userIds.map(async (userId) => {
            const { data, error } = await supabase
              .from('users')
              .select('id, full_name, avatar_url')
              .eq('id', userId)
              .single();
            
            if (error || !data) {
              console.error('Error fetching user details:', error);
              return {
                id: userId,
                full_name: 'Unknown User',
                avatar_url: '/placeholder.svg'
              };
            }
            
            return data;
          });
          
          // Wait for all user details to be fetched
          const userDetails = await Promise.all(userPromises);
          console.log('User details fetched:', userDetails);
          
          // Combine member data with user details
          const processedMembers = memberData.map((member: any) => {
            // Find the matching user details
            const userDetail = userDetails.find(u => u.id === member.user_id);
            
            return {
              ...member,
              user: userDetail || {
                id: member.user_id,
                full_name: member.role === 'creator' ? 'Band Creator' : 'Band Member',
                avatar_url: '/placeholder.svg'
              }
            };
          })
          
          console.log('Processed members with names:', processedMembers)
          setDirectMembers(processedMembers)
        } catch (err) {
          console.error('Exception processing members:', err)
          setDirectMembers([])
        }
      } catch (err) {
        console.error('Error in fetchBandMembers:', err)
      } finally {
        setDirectLoading(false)
      }
    }
    
    fetchBandMembers()
  }, [bandId])
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])
  
  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!messageText.trim()) return
    
    try {
      await sendMessage(messageText.trim())
      setMessageText("") // Clear the input after sending
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }
  
  // Format the timestamp for display
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      
      // If it's today, just show the time
      if (date.toDateString() === now.toDateString()) {
        return format(date, "h:mm a")
      }
      
      // If it's this year, show month and day
      if (date.getFullYear() === now.getFullYear()) {
        return format(date, "MMM d, h:mm a")
      }
      
      // Otherwise show full date
      return format(date, "MMM d, yyyy, h:mm a")
    } catch (e) {
      console.error("Error formatting date:", e)
      return "Unknown time"
    }
  }
  
  // Check if a message is from the current user
  const isCurrentUser = (message: BandMessage) => {
    return message.user_id === user?.id
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Navigate to user profile
  const navigateToProfile = (userId: string, name: string) => {
    console.log(`Navigating to ${name}'s profile (${userId})`);
    router.push(`/profile/${userId}`);
  }
  
  // Handle leaving the band
  const handleLeaveBand = async () => {
    if (!confirm('Are you sure you want to leave this band? You will need to be invited back to rejoin.')) {
      return;
    }
    
    try {
      // Call the function to leave the band (already extracted at the top level)
      await leaveBand();
      
      // Navigate back to the bands list
      onBack();
    } catch (error) {
      // Show error message
      if (error instanceof Error) {
        if (error.message.includes('creator')) {
          alert('Band creators cannot leave their band. You must transfer ownership first or delete the band.');
        } else {
          alert(`Error leaving band: ${error.message}`);
        }
      } else {
        alert('An unknown error occurred while trying to leave the band.');
      }
      console.error('Error leaving band:', error);
    }
  }
  
  // Handle member click
  const handleMemberClick = (member: any) => {
    if (member?.user_id) {
      const fullName = member.user?.full_name || 'User';
      console.log(`Navigating to profile for user ${member.user_id} (${fullName})`);
      navigateToProfile(member.user_id, fullName);
    } else {
      console.log('Cannot navigate: Missing user_id in member data', member);
    }
  };
  
  // Render the members sidebar
  const MembersSidebar = () => (
    <div className="hidden md:block w-64 min-w-[16rem] border-l overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b">
        <h2 className="font-medium">Band Members</h2>
        <div className="text-sm text-[#ffac6d] mt-1">
          {directMembers.length} {directMembers.length === 1 ? 'Member' : 'Members'}
        </div>
      </div>
      <div className="p-2">
        {directLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#ffac6d]" />
          </div>
        ) : directMembers.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">No members yet</p>
          </div>
        ) : (
          <div className="space-y-1 mt-2">
            {directMembers.map((member) => {
              // Extract user data from the profiles object
              const userData = member.user;
              const fullName = userData?.full_name || "Unknown member";
              const avatarUrl = userData?.avatar_url || "/placeholder.svg";
              
              return (
                <div 
                  key={member.id} 
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleMemberClick(member)}
                >
                  <Avatar className="w-6 h-6">
                    <Image 
                      src={avatarUrl} 
                      alt={fullName} 
                      width={24} 
                      height={24}
                      className="object-cover"
                    />
                  </Avatar>
                  <div className="overflow-hidden">
                    <span className="text-sm truncate block">
                      {fullName}
                    </span>
                    {member.role === 'creator' && (
                      <span className="text-xs text-[#ffac6d]">Creator</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-white lg:h-screen flex flex-col w-full">
      <header className="flex items-center p-4 md:p-6 border-b w-full">
        <button className="mr-2" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <Image src="/placeholder.svg?height=32&width=32" alt={band.name} width={32} height={32} />
          </Avatar>
          <h1 className="text-lg font-medium">{band.name}</h1>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => handleLeaveBand()}
            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-md border border-red-500 hover:bg-red-50 transition-colors"
          >
            Leave Band
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden w-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messagesLoading ? (
              <div className="flex justify-center my-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#ffac6d]" />
              </div>
            ) : messagesError ? (
              <div className="text-center text-red-500 my-4">Error loading messages</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 my-4">
                No messages yet. Be the first to say hello!
              </div>
            ) : (
              messages.map((message: BandMessage) => {
                const isCurrentUser = message.user_id === user?.id;
                const messageDate = new Date(message.created_at);
                const messageTime = messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                
                return (
                  <div key={message.id} className={`flex items-start ${isCurrentUser ? "justify-end gap-2" : "gap-2"}`}>
                    {!isCurrentUser ? (
                      <Avatar className="w-8 h-8">
                        <Image 
                          src={message.user?.avatar_url || '/placeholder.svg'} 
                          alt={message.user?.full_name || "Unknown member"} 
                          width={32} 
                          height={32} 
                          className="object-cover"
                        />
                      </Avatar>
                    ) : (
                      <Avatar className="w-8 h-8 order-1">
                        <Image 
                          src={user?.user_metadata?.avatar_url || '/placeholder.svg'} 
                          alt="You" 
                          width={32} 
                          height={32} 
                          className="object-cover"
                        />
                      </Avatar>
                    )}
                    <div className={`${isCurrentUser ? 'w-full flex flex-col items-end' : ''}`}>
                      {!isCurrentUser ? (
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-medium">{message.user?.full_name || "Unknown member"}</div>
                          <div className="text-xs text-gray-500">{messageTime}</div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-xs text-gray-500">{messageTime}</div>
                          <div className="text-xs font-medium">You</div>
                        </div>
                      )}
                      <div className={`${isCurrentUser ? "bg-[#ffd2b0]" : "bg-gray-100"} rounded-lg p-2 mt-1 max-w-xs`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <MembersSidebar />
        </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="relative">
          <Input
            placeholder="Send a message..."
            className="pr-10 rounded-full"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!user}
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            disabled={!messageText.trim() || !user}
          >
            <Send className={`h-5 w-5 ${messageText.trim() && user ? "text-[#ffac6d]" : "text-gray-400"}`} />
          </button>
        </div>
        {!user && (
          <p className="text-xs text-center mt-2 text-muted-foreground">
            You need to be signed in to send messages
          </p>
        )}
      </form>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}
