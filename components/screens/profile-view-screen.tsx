"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Calendar, MapPin } from "lucide-react";
import { useUserEvents, type UserEvent } from "@/hooks/use-user-events";
import { useRouter } from "next/navigation";

// Define the music icon types
type MusicIcon = {
  id: string;
  name: string;
  emoji: string;
  type: "instrument" | "genre";
};

// Define event type
interface PastEvent extends UserEvent {
  participationStatus: 'going' | 'maybe';
}

// Profile data type
interface ProfileData {
  id: string;
  full_name: string;
  bio: string;
  instruments: string[];
  genres: string[];
  avatar_url?: string;
}

// Upcoming Events Component for a specific user
function UpcomingEvents({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<UserEvent[]>([]);
  
  useEffect(() => {
    async function fetchUserEvents() {
      try {
        setIsLoading(true);
        
        // First, get all events
        const { data: allEvents, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('start_time', { ascending: true });
        
        if (eventsError) {
          console.error('Error fetching events:', JSON.stringify({
            message: eventsError.message,
            details: eventsError.details,
            hint: eventsError.hint,
            code: eventsError.code
          }));
          setError('Failed to load events');
          return;
        }
        
        // Filter events where the user is a participant (manual filtering instead of SQL OR)
        const eventsData = allEvents.filter(event => {
          const isGoing = Array.isArray(event.participants_going) && event.participants_going.some((p: any) => {
            try {
              // Check if p is a JSON string containing the user ID
              const parsed = JSON.parse(p);
              return parsed.id === userId;
            } catch {
              // If not a valid JSON, check if it's the ID itself
              return p === userId;
            }
          });
          
          const isMaybe = Array.isArray(event.participants_maybe) && event.participants_maybe.some((p: any) => {
            try {
              const parsed = JSON.parse(p);
              return parsed.id === userId;
            } catch {
              return p === userId;
            }
          });
          
          return isGoing || isMaybe;
        });
        
        // Format events and add participation status
        const formattedEvents = eventsData?.map((event) => {
          const participationStatus = (event.participants_going || []).some(
            (p: string) => {
              try {
                const participant = JSON.parse(p);
                return participant.id === userId;
              } catch {
                return p === userId;
              }
            }
          )
            ? 'going'
            : 'maybe';
          
          return {
            ...event,
            participationStatus,
          };
        }) || [];
        
        // Filter for upcoming events (start time is in the future)
        const upcomingEvents = formattedEvents.filter(event => 
          new Date(event.start_time) > new Date()
        );
        
        setEvents(upcomingEvents);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (userId) {
      fetchUserEvents();
    }
  }, [userId]);
  
  const formatEventDate = (startTime: string) => {
    const start = new Date(startTime);
    
    // Format the date in a compact way for the cards
    return start.toLocaleDateString([], {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric'
    });
  };
  
  const handleEventClick = (eventId: string) => {
    // Use custom event for navigation (same as in profile-screen.tsx)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('openEvent', { detail: { eventId } });
      window.dispatchEvent(event);
    }
  };
  
  return (
    <div className="space-y-3 mt-6">
      <h3 className="font-medium">Upcoming Events</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-4 border-[#ffac6d] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-xs text-red-500">Error loading events</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No upcoming events</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-3">
            {events.map((event: UserEvent) => {
              const dateStr = formatEventDate(event.start_time);
              return (
                <div
                  key={event.id}
                  className="rounded-lg overflow-hidden border flex-shrink-0 w-[200px] cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventClick(event.id)}
                >
                  {/* Event image with participation indicator */}
                  <div className="relative">
                    <Image
                      src={event.image_url || '/placeholder.svg?height=100&width=200'}
                      alt={event.title}
                      width={200}
                      height={100}
                      className="w-full h-24 object-cover"
                    />
                    {/* Participation status indicator */}
                    <div 
                      className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        event.participationStatus === 'going' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                    />
                  </div>
                  <div className="p-2">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500">{dateStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Post Games (Past Events) Component
function PostGamesEvents({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<PastEvent[]>([]);
  
  useEffect(() => {
    async function fetchUserEvents() {
      try {
        setIsLoading(true);
        
        // First, get all events
        const { data: allEvents, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('start_time', { ascending: true });
        
        if (eventsError) {
          console.error('Error fetching events:', JSON.stringify({
            message: eventsError.message,
            details: eventsError.details,
            hint: eventsError.hint,
            code: eventsError.code
          }));
          setError('Failed to load events');
          return;
        }
        
        // Filter events where the user is a participant (manual filtering instead of SQL OR)
        const eventsData = allEvents.filter(event => {
          const isGoing = Array.isArray(event.participants_going) && event.participants_going.some((p: any) => {
            try {
              // Check if p is a JSON string containing the user ID
              const parsed = JSON.parse(p);
              return parsed.id === userId;
            } catch {
              // If not a valid JSON, check if it's the ID itself
              return p === userId;
            }
          });
          
          const isMaybe = Array.isArray(event.participants_maybe) && event.participants_maybe.some((p: any) => {
            try {
              const parsed = JSON.parse(p);
              return parsed.id === userId;
            } catch {
              return p === userId;
            }
          });
          
          return isGoing || isMaybe;
        });
        
        // Format events and add participation status
        const formattedEvents = eventsData?.map((event) => {
          const participationStatus = (event.participants_going || []).some(
            (p: string) => {
              try {
                const participant = JSON.parse(p);
                return participant.id === userId;
              } catch {
                return p === userId;
              }
            }
          )
            ? 'going'
            : 'maybe';
          
          return {
            ...event,
            participationStatus,
          };
        }) || [];
        
        // Filter for past events (start time is in the past)
        const pastEvents = formattedEvents.filter(event => 
          new Date(event.start_time) <= new Date()
        );
        
        setEvents(pastEvents);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (userId) {
      fetchUserEvents();
    }
  }, [userId]);
  
  const formatEventDate = (startTime: string) => {
    const start = new Date(startTime);
    
    // Format the date in a compact way for the cards
    return start.toLocaleDateString([], {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric'
    });
  };
  
  const handleEventClick = (eventId: string) => {
    // Use custom event for navigation (same as in profile-screen.tsx)
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('openEvent', { detail: { eventId } });
      window.dispatchEvent(event);
    }
  };
  
  return (
    <div className="space-y-3 mt-6">
      <h3 className="font-medium">Post Games 👀</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-4 border-[#ffac6d] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-xs text-red-500">Error loading events</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No past events</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-3">
            {events.map((event: PastEvent) => {
              const dateStr = formatEventDate(event.start_time);
              return (
                <div
                  key={event.id}
                  className="rounded-lg overflow-hidden border flex-shrink-0 w-[200px] cursor-pointer hover:shadow-md transition-shadow opacity-80"
                  onClick={() => handleEventClick(event.id)}
                >
                  {/* Event image with participation indicator */}
                  <div className="relative">
                    <Image
                      src={event.image_url || '/placeholder.svg?height=100&width=200'}
                      alt={event.title}
                      width={200}
                      height={100}
                      className="w-full h-24 object-cover"
                    />
                    {/* Participation status indicator */}
                    <div 
                      className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        event.participationStatus === 'going' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                    />
                  </div>
                  <div className="p-2">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500">{dateStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ProfileScreenProps {
  userId: string;
  isCurrentUser: boolean;
}

export function ProfileScreen({ userId, isCurrentUser }: ProfileScreenProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to handle back button click
  const handleBackClick = () => {
    // Check if there's a stored event ID in session storage
    const referringEventId = sessionStorage.getItem('referringEventId');
    
    if (referringEventId) {
      // Navigate back to the specific event
      router.push(`/?event=${referringEventId}`);
      // Clear the stored event ID
      sessionStorage.removeItem('referringEventId');
    } else {
      // Try to go back in history if possible
      window.history.back();
    }
  };

  // Music icons data
  const musicIcons: MusicIcon[] = [
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

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // First try to get from profiles
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        // If not found in profiles, try the users table
        if (error && error.code === 'PGRST116') {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (userError) {
            console.error('Error fetching user:', userError);
            setError('User not found');
            return;
          }
          
          // Create a minimal profile from users table
          data = {
            id: userData.id,
            full_name: userData.full_name || 'User',
            bio: '',
            instruments: [],
            genres: [],
            avatar_url: userData.avatar_url || undefined
          };
        } else if (error) {
          console.error('Error fetching profile:', error);
          setError('Failed to load profile');
          return;
        }
        
        setProfileData(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#ffac6d] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The profile you\'re looking for doesn\'t exist.'}</p>
        <Button 
          onClick={handleBackClick}
          className="bg-[#ffac6d] hover:bg-[#fdc193] text-black"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col">
      <div className="p-4 md:p-6 border-b flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Profile</h1>
        <Button 
          variant="outline"
          className="text-sm"
          onClick={handleBackClick}
        >
          Back
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="relative rounded-full overflow-hidden border-4 border-[#ffac6d] w-32 h-32">
                  <Image
                    src={profileData?.avatar_url || "/placeholder.svg?height=128&width=128"}
                    alt={profileData?.full_name || "Profile"}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>

                {/* Music icons around profile picture */}
                {profileData?.instruments?.concat(profileData?.genres || []).map((iconId, index) => {
                  const icon = musicIcons.find((i) => i.id === iconId);
                  if (!icon) return null;

                  // Calculate position in a circle above the profile picture
                  const totalIcons = (profileData?.instruments?.length || 0) + (profileData?.genres?.length || 0);
                  const angle = (index / totalIcons) * Math.PI - Math.PI / 2; // Start from top (-π/2) and go 180 degrees (π)

                  // Profile picture is 32px wide (radius 16px)
                  // But we need to account for the orange border (border-4 = 4px)
                  const profileRadius = 16;
                  const borderWidth = 4;
                  const totalProfileRadius = profileRadius + borderWidth;

                  // Ensure icons are outside the orange border
                  // Use the total radius (including border) as the base
                  const iconPlacementRadius = totalProfileRadius * 1.25;

                  // Calculate x and y coordinates
                  const x = Math.cos(angle) * iconPlacementRadius;
                  const y = Math.sin(angle) * iconPlacementRadius;

                  return (
                    <div
                      key={icon.id}
                      className="absolute bg-[#ffac6d] rounded-full w-10 h-10 flex items-center justify-center shadow-sm"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                        fontSize: "20px",
                        zIndex: 10,
                      }}
                    >
                      {icon.emoji}
                    </div>
                  );
                })}
              </div>

              <h2 className="text-xl font-bold mt-4">{profileData?.full_name}</h2>
            </div>

            <div className="flex-1 w-full">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bio:</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {profileData?.bio || "No bio available"}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Instruments:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.instruments?.map((instrument) => {
                      const icon = musicIcons.find((i) => i.id === instrument);
                      return (
                        <div
                          key={instrument}
                          className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                        >
                          <span className="mr-2">{icon?.emoji || '🎸'}</span>
                          <span className="text-sm">{icon?.name || instrument}</span>
                        </div>
                      );
                    })}
                    {!profileData?.instruments?.length && (
                      <span className="text-sm text-gray-500 italic">No instruments selected</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Genres:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.genres?.map((genre) => {
                      const icon = musicIcons.find((i) => i.id === genre);
                      return (
                        <div
                          key={genre}
                          className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                        >
                          <span className="mr-2">{icon?.emoji || '🎵'}</span>
                          <span className="text-sm">{icon?.name || genre}</span>
                        </div>
                      );
                    })}
                    {!profileData?.genres?.length && (
                      <span className="text-sm text-gray-500 italic">No genres selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Events */}
          <UpcomingEvents userId={userId} />
          
          {/* Past Events */}
          <PostGamesEvents userId={userId} />
        </div>
      </div>
    </div>
  );
}
