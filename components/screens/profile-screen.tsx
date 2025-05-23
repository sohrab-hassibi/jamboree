"use client";
import { useState, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Check, X, LogOut, Calendar, Clock, MapPin } from "lucide-react";
import { useUserEvents, type UserEvent } from "@/hooks/use-user-events";

// Define the music icon types
type MusicIcon = {
  id: string;
  name: string;
  emoji: string;
  type: "instrument" | "genre";
};

// Upcoming Events Component
function UpcomingEvents() {
  const { upcomingEvents, isLoading, error } = useUserEvents();
  const router = useRouter();
  
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
    // Use the parent component's state management for navigation
    // This will be passed from the parent ProfileScreen component
    if (typeof window !== 'undefined') {
      // Access the global state management through the window object
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
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No upcoming events</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-3">
            {upcomingEvents.map((event: UserEvent) => {
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
function PostGamesEvents() {
  const { pastEvents, isLoading, error } = useUserEvents();
  const router = useRouter();
  
  const formatEventDate = (startTime: string) => {
    const start = new Date(startTime);
    
    return start.toLocaleDateString([], {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric'
    });
  };
  
  const handleEventClick = (eventId: string) => {
    // Use the parent component's state management for navigation
    // This will be passed from the parent ProfileScreen component
    if (typeof window !== 'undefined') {
      // Access the global state management through the window object
      const event = new CustomEvent('openEvent', { detail: { eventId } });
      window.dispatchEvent(event);
    }
  };
  
  return (
    <div>
      <h3 className="font-medium mb-3">Post Games 👀</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-4 border-[#ffac6d] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-xs text-red-500">Error loading events</p>
        </div>
      ) : pastEvents.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No past events</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-3">
            {pastEvents.map((event: UserEvent) => {
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

export default function ProfileScreen() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [iconSelectorType, setIconSelectorType] = useState<
    "instrument" | "genre"
  >("instrument");

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

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    selectedIcons: [] as string[],
    instruments: [] as string[],
    genres: [] as string[],
  });

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    selectedIcons: [] as string[],
    instruments: [] as string[],
    genres: [] as string[],
  });

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          // Get the user's metadata which includes the full name from signup
          const { data: { user: userData } } = await supabase.auth.getUser();
          
          // Fetch user profile data from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          // Use the name from user metadata if available, otherwise fall back to profile data
          const userName = userData?.user_metadata?.full_name || data?.full_name || '';
          
          const profileData = {
            name: userName,
            bio: data?.bio || '',
            selectedIcons: [...(data?.instruments || []), ...(data?.genres || [])],
            instruments: data?.instruments || [],
            genres: data?.genres || [],
          };
          
          setProfile(profileData);
          setFormData(profileData);
          
          // If we have a name from user metadata but not in the profile, update the profile
          if (userName && (!data || data.full_name !== userName)) {
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: userName,
                updated_at: new Date().toISOString(),
              });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Function to handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to save profile changes
  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Split selectedIcons into instruments and genres
      const instruments = formData.selectedIcons
        .map(id => musicIcons.find(icon => icon.id === id))
        .filter(icon => icon?.type === 'instrument')
        .map(icon => icon?.id) as string[];

      const genres = formData.selectedIcons
        .map(id => musicIcons.find(icon => icon.id === id))
        .filter(icon => icon?.type === 'genre')
        .map(icon => icon?.id) as string[];

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.name,
          bio: formData.bio,
          instruments,
          genres,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      const updatedProfile = {
        name: formData.name,
        bio: formData.bio,
        selectedIcons: formData.selectedIcons,
        instruments,
        genres,
      };

      setProfile(updatedProfile);
      setEditProfileMode(false);
      setShowIconSelector(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Function to cancel profile editing
  const handleCancelEdit = () => {
    setFormData({
      name: profile.name,
      bio: profile.bio,
      selectedIcons: [...profile.selectedIcons],
      instruments: [...profile.instruments],
      genres: [...profile.genres],
    });
    setEditProfileMode(false);
    setShowIconSelector(false);
  };

  // Function to toggle icon selection
  const toggleIconSelection = (iconId: string) => {
    setFormData((prev) => {
      const newSelectedIcons = prev.selectedIcons.includes(iconId)
        ? prev.selectedIcons.filter((id) => id !== iconId)
        : [...prev.selectedIcons, iconId];

      // Update instruments and genres based on selected icons
      const instruments = newSelectedIcons
        .map(id => musicIcons.find(icon => icon.id === id))
        .filter(icon => icon?.type === 'instrument')
        .map(icon => icon?.id) as string[];

      const genres = newSelectedIcons
        .map(id => musicIcons.find(icon => icon.id === id))
        .filter(icon => icon?.type === 'genre')
        .map(icon => icon?.id) as string[];

      return {
        ...prev,
        selectedIcons: newSelectedIcons,
        instruments,
        genres,
      };
    });
  };

  // Function to open icon selector
  const openIconSelector = (type: "instrument" | "genre") => {
    setIconSelectorType(type);
    setShowIconSelector(true);
  };

  if (showIconSelector) {
    // Icon Selector View
    return (
      <div className="min-h-screen bg-white lg:bg-transparent lg:min-h-0 lg:rounded-xl lg:overflow-hidden lg:border lg:shadow-sm lg:my-6 flex flex-col">
        <div className="p-4 md:p-6 border-b flex items-center justify-between">
          <div className="flex items-center">
            <button className="mr-3" onClick={() => setShowIconSelector(false)}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold">
              Select{" "}
              {iconSelectorType === "instrument" ? "Instruments" : "Genres"}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {musicIcons
              .filter((icon) => icon.type === iconSelectorType)
              .map((icon) => {
                const isSelected = formData.selectedIcons.includes(icon.id);
                return (
                  <button
                    key={icon.id}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg relative ${
                      isSelected ? "bg-[#ffd2b0]" : "bg-gray-100"
                    }`}
                    onClick={() => toggleIconSelection(icon.id)}
                  >
                    <div className="text-3xl mb-2">{icon.emoji}</div>
                    <div className="text-sm">{icon.name}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#ffac6d] rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t">
          <Button
            className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black"
            onClick={() => setShowIconSelector(false)}
          >
            Done
          </Button>
        </div>

        <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
      </div>
    );
  } else if (editProfileMode) {
    // Edit Profile Mode
    return (
      <div className="min-h-screen bg-white lg:bg-transparent lg:min-h-0 lg:rounded-xl lg:overflow-hidden lg:border lg:shadow-sm lg:my-6 flex flex-col">
        <div className="p-4 md:p-6 border-b flex items-center justify-between">
          <div className="flex items-center">
            <button className="mr-3" onClick={handleCancelEdit}>
              <X className="h-6 w-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold">Edit Profile</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative inline-block">
                <div className="relative rounded-full overflow-hidden border-4 border-[#ffac6d] w-32 h-32">
                  <Image
                    src="/placeholder.svg?height=128&width=128"
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-[#ffac6d] rounded-full p-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5 2.5a2.121 2.121 0 0 1 3 3L12 11l-4 1 1-4 5.5-5.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">
                    Your Instruments
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-[#ffac6d]"
                    onClick={() => openIconSelector("instrument")}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedIcons
                    .map((id) => musicIcons.find((icon) => icon.id === id))
                    .filter((icon) => icon && icon.type === "instrument")
                    .map(
                      (icon) =>
                        icon && (
                          <div
                            key={icon.id}
                            className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                          >
                            <span className="mr-2">{icon.emoji}</span>
                            <span className="text-sm">{icon.name}</span>
                          </div>
                        )
                    )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">
                    Your Genres
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-[#ffac6d]"
                    onClick={() => openIconSelector("genre")}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedIcons
                    .map((id) => musicIcons.find((icon) => icon.id === id))
                    .filter((icon) => icon && icon.type === "genre")
                    .map(
                      (icon) =>
                        icon && (
                          <div
                            key={icon.id}
                            className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                          >
                            <span className="mr-2">{icon.emoji}</span>
                            <span className="text-sm">{icon.name}</span>
                          </div>
                        )
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t flex justify-end">
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className={isDesktop ? "" : "flex-1"}
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              className={`bg-[#ffac6d] hover:bg-[#fdc193] text-black ${
                isDesktop ? "" : "flex-1"
              }`}
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Profile View Mode
  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col">
      <div className="p-4 md:p-6 border-b flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Profile</h1>
        {isDesktop && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditProfileMode(true);
                setFormData({
                  name: profile.name,
                  bio: profile.bio,
                  selectedIcons: [...profile.selectedIcons],
                  instruments: [...profile.instruments],
                  genres: [...profile.genres],
                });
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="relative rounded-full overflow-hidden border-4 border-[#ffac6d] w-32 h-32">
                  <Image
                    src="/placeholder.svg?height=128&width=128"
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>

                {/* Music icons around profile picture */}
                {profile.selectedIcons.map((iconId, index) => {
                  const icon = musicIcons.find((i) => i.id === iconId);
                  if (!icon) return null;

                  // Calculate position in a circle above the profile picture
                  const totalIcons = profile.selectedIcons.length;
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

              <h2 className="text-xl font-bold mt-4">{profile.name}</h2>
            </div>

            <div className="flex-1 w-full">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bio:</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {profile.bio}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Instruments:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.selectedIcons
                      .map((id) => musicIcons.find((icon) => icon.id === id))
                      .filter((icon) => icon && icon.type === "instrument")
                      .map(
                        (icon) =>
                          icon && (
                            <div
                              key={icon.id}
                              className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                            >
                              <span className="mr-2">{icon.emoji}</span>
                              <span className="text-sm">{icon.name}</span>
                            </div>
                          )
                      )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Genres:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.selectedIcons
                      .map((id) => musicIcons.find((icon) => icon.id === id))
                      .filter((icon) => icon && icon.type === "genre")
                      .map(
                        (icon) =>
                          icon && (
                            <div
                              key={icon.id}
                              className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                            >
                              <span className="mr-2">{icon.emoji}</span>
                              <span className="text-sm">{icon.name}</span>
                            </div>
                          )
                      )}
                  </div>
                </div>

                {/* Upcoming Events Section */}
                <UpcomingEvents />

                <div className="space-y-6">
                  {/* Past Events */}
                  <PostGamesEvents />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isDesktop && (
        <div className="p-4 border-t flex flex-col space-y-2">
          <Button
            className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black"
            onClick={() => {
              setEditProfileMode(true);
              setFormData({
                name: profile.name,
                bio: profile.bio,
                selectedIcons: [...profile.selectedIcons],
                instruments: [...profile.instruments],
                genres: [...profile.genres],
              });
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  );
}
