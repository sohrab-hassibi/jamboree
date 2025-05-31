"use client";
import { useState, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/context/SupabaseContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Check, X } from "lucide-react";
import { MUSIC_ICONS } from "@/constants/music-icons";

type ProfileData = {
  name: string;
  bio: string;
  selectedInstruments: string[];
  selectedGenres: string[];
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthLoading && !authUser) {
      router.push('/login');
    }
  }, [authUser, isAuthLoading, loading, router]);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [iconSelectorType, setIconSelectorType] = useState<
    "instrument" | "genre"
  >("instrument");

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    bio: "",
    selectedInstruments: [],
    selectedGenres: [],
  });

  // Fetch user data when auth is ready
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return;
      
      try {
        // Use the authUser from context directly since it's already available
        const user = authUser;
        
        if (user) {
          setUser(user);
          // Set the profile name to the user's full name or email
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
          const userBio = user.user_metadata?.bio || '';
          const userInstruments = user.user_metadata?.selected_instruments || [];
          const userGenres = user.user_metadata?.selected_genres || [];
          
          const userProfile: ProfileData = {
            name: userName,
            bio: userBio,
            selectedInstruments: Array.isArray(userInstruments) ? userInstruments : [],
            selectedGenres: Array.isArray(userGenres) ? userGenres : [],
          };
          
          setProfile(userProfile);
          setFormData(prev => ({
            ...prev,
            ...userProfile,
            selectedInstruments: [...userProfile.selectedInstruments],
            selectedGenres: [...userProfile.selectedGenres],
          }));
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  // Form state for editing
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    bio: "",
    selectedInstruments: [],
    selectedGenres: [],
  });

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
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.name,
          bio: formData.bio,
          selected_instruments: [...formData.selectedInstruments],
          selected_genres: [...formData.selectedGenres],
        }
      });

      if (error) throw error;

      // Update local state
      setProfile({
        name: formData.name,
        bio: formData.bio,
        selectedInstruments: [...formData.selectedInstruments],
        selectedGenres: [...formData.selectedGenres],
      });
      
      setEditProfileMode(false);
      setShowIconSelector(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Function to cancel profile editing
  const handleCancelEdit = () => {
    setFormData({
      name: profile.name,
      bio: profile.bio,
      selectedInstruments: [...profile.selectedInstruments],
      selectedGenres: [...profile.selectedGenres],
    });
    setEditProfileMode(false);
    setShowIconSelector(false);
  };

  // Function to toggle icon selection
  const toggleIconSelection = (iconId: string) => {
    setFormData((prev) => {
      const newSelectedIcons = prev.selectedInstruments.includes(iconId)
        ? prev.selectedInstruments.filter((id) => id !== iconId)
        : [...prev.selectedInstruments, iconId];
      
      return {
        ...prev,
        selectedInstruments: newSelectedIcons,
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
            {MUSIC_ICONS
              .filter((icon) => icon.type === iconSelectorType)
              .map((icon) => {
                const isSelected = formData.selectedInstruments.includes(icon.id);
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
              <div className="relative inline-block mb-6">
                <div className="relative rounded-full overflow-hidden border-4 border-[#ffac6d] w-32 h-32">
                  <Image
                    src="/placeholder.svg"
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
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
                  {formData.selectedInstruments
                    .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
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
                  {formData.selectedGenres
                    .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
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

  // Profile View Mode
  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col">
      <div className="p-4 md:p-6 border-b flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Profile</h1>
        {isDesktop && (
          <Button
            variant="outline"
            onClick={() => {
              setEditProfileMode(true);
              setFormData({
                name: profile.name,
                bio: profile.bio,
                selectedInstruments: [...profile.selectedInstruments],
                selectedGenres: [...profile.selectedGenres],
              });
            }}
          >
            Edit Profile
          </Button>
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
                {profile.selectedInstruments.map((iconId, index) => {
                  const icon = MUSIC_ICONS.find((i) => i.id === iconId);
                  if (!icon) return null;

                  // Calculate position in a circle above the profile picture
                  const totalIcons = profile.selectedInstruments.length;
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
                    {profile.selectedInstruments
                      .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
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
                    {profile.selectedGenres
                      .map((id) => MUSIC_ICONS.find((icon) => icon.id === id))
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

                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <div>
                    <h3 className="font-medium mb-3">Upcoming Events</h3>
                    <div className="overflow-x-auto pb-2 hide-scrollbar">
                      <div className="flex space-x-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg overflow-hidden border flex-shrink-0 w-[200px]"
                          >
                            <Image
                              src="/placeholder.svg?height=100&width=200"
                              alt="Event"
                              width={200}
                              height={100}
                              className="w-full h-24 object-cover"
                            />
                            <div className="p-2">
                              <div className="font-medium text-sm">
                                Old Peeps Jam
                              </div>
                              <div className="text-xs text-gray-500">
                                Sunday 5/4
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Past Events */}
                  <div>
                    <h3 className="font-medium mb-3">Post Games 👀</h3>
                    <div className="overflow-x-auto pb-2 hide-scrollbar">
                      <div className="flex space-x-3">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg overflow-hidden border opacity-70 flex-shrink-0 w-[200px]"
                          >
                            <Image
                              src="/placeholder.svg?height=100&width=200"
                              alt="Event"
                              width={200}
                              height={100}
                              className="w-full h-24 object-cover"
                            />
                            <div className="p-2">
                              <div className="font-medium text-sm">
                                Spring Jam
                              </div>
                              <div className="text-xs text-gray-500">
                                Sunday 4/12
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isDesktop && (
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={() => {
              setEditProfileMode(true);
              setFormData({
                name: profile.name,
                bio: profile.bio,
                selectedInstruments: [...profile.selectedInstruments],
                selectedGenres: [...profile.selectedGenres],
              });
            }}
          >
            Edit Profile
          </Button>
        </div>
      )}

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  );
}
