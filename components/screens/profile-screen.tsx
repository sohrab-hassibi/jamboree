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
import { Check, X, LogOut } from "lucide-react";
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
    return start.toLocaleDateString([], {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  const handleEventClick = (eventId: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("openEvent", { detail: { eventId } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-xl md:text-2xl font-bold">Upcoming Events 🎵</h3>
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-4 border-[#ffac6d] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-500">Error loading events</p>
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-lg text-gray-500">
            No upcoming events... Check out the Events Page!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-3">
            {upcomingEvents.map((event: UserEvent) => {
              const dateStr = formatEventDate(event.start_time);
              return (
                <div
                  key={event.id}
                  className="rounded-lg overflow-hidden border flex-shrink-0 w-[320px] cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="relative">
                    <Image
                      src={
                        event.image_url ||
                        "/placeholder.svg?height=100&width=200"
                      }
                      alt={event.title}
                      width={200}
                      height={100}
                      className="w-full h-32 object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                        event.participationStatus === "going"
                          ? "text-green-700 bg-green-100"
                          : "text-yellow-700 bg-yellow-100"
                      }`}
                    >
                      {event.participationStatus === "going"
                        ? "Going ✅"
                        : "Maybe 🤔"}
                    </span>
                  </div>
                  <div className="p-2">
                    <div className="font-bold text-lg">{event.title}</div>
                    <div className="text-base text-gray-500">{dateStr}</div>
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
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  const handleEventClick = (eventId: string) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("openEvent", { detail: { eventId } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-xl md:text-2xl font-bold">Post Games 👀</h3>
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-4 border-[#ffac6d] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-500">Error loading events</p>
        </div>
      ) : pastEvents.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-lg text-gray-500">
            No past events... Events that you have attended will show up here!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-3">
            {pastEvents.map((event: UserEvent) => {
              const dateStr = formatEventDate(event.start_time);
              return (
                <div
                  key={event.id}
                  className="rounded-lg overflow-hidden border flex-shrink-0 w-[320px] cursor-pointer hover:shadow-md transition-shadow opacity-80"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="relative">
                    <Image
                      src={
                        event.image_url ||
                        "/placeholder.svg?height=100&width=200"
                      }
                      alt={event.title}
                      width={200}
                      height={100}
                      className="w-full h-32 object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                        event.participationStatus === "going"
                          ? "text-green-700 bg-green-100"
                          : "text-yellow-700 bg-yellow-100"
                      }`}
                    >
                      {event.participationStatus === "going"
                        ? "Attended ✅"
                        : "Was Interested 🤔"}
                    </span>
                  </div>
                  <div className="p-2">
                    <div className="font-bold text-lg">{event.title}</div>
                    <div className="text-base text-gray-500">{dateStr}</div>
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
  const [iconLimitWarning, setIconLimitWarning] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

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
    { id: "pop", name: "Pop", emoji: "⭐", type: "genre" },
    { id: "jazz", name: "Jazz", emoji: "🎶", type: "genre" },
    { id: "classical", name: "Classical", emoji: "🎼", type: "genre" },
    { id: "electronic", name: "Electronic", emoji: "🤖", type: "genre" },
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
    avatar_url: "",
  });

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    selectedIcons: [] as string[],
    instruments: [] as string[],
    genres: [] as string[],
    avatar_url: "",
  });

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          // Get the user's metadata which includes the full name from signup
          const {
            data: { user: userData },
          } = await supabase.auth.getUser();

          // Fetch user profile data from Supabase
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          // Use the name from user metadata if available, otherwise fall back to profile data
          const userName =
            userData?.user_metadata?.full_name || data?.full_name || "";

          const profileData = {
            name: userName,
            bio: data?.bio || "",
            selectedIcons: [
              ...(data?.instruments || []),
              ...(data?.genres || []),
            ],
            instruments: data?.instruments || [],
            genres: data?.genres || [],
            avatar_url: data?.avatar_url || "",
          };

          setProfile(profileData);
          setFormData(profileData);

          // If we have a name from user metadata but not in the profile, update the profile
          if (userName && (!data || data.full_name !== userName)) {
            await supabase.from("profiles").upsert({
              id: user.id,
              full_name: userName,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
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

  // Handler for profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match("image.*")) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Resize the image before preview to improve performance
    const resizeImage = (
      file: File,
      maxWidth: number,
      maxHeight: number
    ): Promise<File> => {
      return new Promise((resolve) => {
        const imgElement = new window.Image();
        imgElement.onload = () => {
          const canvas = document.createElement("canvas");
          let width = imgElement.width;
          let height = imgElement.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(imgElement, 0, 0, width, height);

          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              } else {
                resolve(file); // Fallback to original if resize fails
              }
            },
            "image/jpeg",
            0.7
          ); // 70% quality JPEG
        };
        imgElement.src = URL.createObjectURL(file);
      });
    };

    // Create preview immediately for better UX
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);

      // Resize the image in the background
      resizeImage(file, 400, 400).then((resizedFile) => {
        setProfileImageFile(resizedFile);
        console.log(
          `Image resized from ${file.size} to ${resizedFile.size} bytes`
        );
      });
    };
    reader.readAsDataURL(file);
  };

  // Function to save profile changes
  const handleSaveProfile = async () => {
    console.log("Save profile button clicked");
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Current user:", user?.id);
      if (!user) throw new Error("User not authenticated");

      // Split selectedIcons into instruments and genres
      const instruments = formData.selectedIcons
        .map((id) => musicIcons.find((icon) => icon.id === id))
        .filter((icon) => icon?.type === "instrument")
        .map((icon) => icon?.id) as string[];

      const genres = formData.selectedIcons
        .map((id) => musicIcons.find((icon) => icon.id === id))
        .filter((icon) => icon?.type === "genre")
        .map((icon) => icon?.id) as string[];

      console.log("Processed instruments and genres:", { instruments, genres });

      // Upload profile image to Supabase Storage if a new image was selected
      let avatarUrl = "";
      if (profileImageFile) {
        try {
          // Upload to Supabase Storage
          const fileExt = profileImageFile.name.split(".").pop();
          const fileName = `profile-${Date.now()}.${fileExt}`;
          const filePath = `profiles/${fileName}`;
          
          console.log("Uploading profile image:", {
            filePath,
            size: profileImageFile.size,
          });

          // Upload the file to the event-images bucket with profiles subfolder
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("event-images") // Use the same bucket as event images
              .upload(filePath, profileImageFile, {
                cacheControl: "3600",
                upsert: true, // Set to true to overwrite existing files
              });

          if (uploadError) {
            console.error("Upload error details:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          console.log("Upload successful:", uploadData);

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("event-images").getPublicUrl(filePath);

          console.log("Generated public URL:", publicUrl);
          avatarUrl = publicUrl;
        } catch (error: any) {
          console.error("Error in image upload process:", error);
          const errorMessage =
            error?.message || "Unknown error during image upload";
          // Don't throw here, just log the error and continue without updating the image
          console.error(`Image upload failed: ${errorMessage}`);
        }
      }

      console.log("Preparing to update profile with:", {
        id: user.id,
        name: formData.name,
        bio: formData.bio,
        instruments,
        genres,
        avatarUrl: avatarUrl ? "Has URL" : "No new URL",
      });

      // Prepare the profile data
      const profileData: any = {
        id: user.id,
        full_name: formData.name,
        bio: formData.bio,
        instruments,
        genres,
        updated_at: new Date().toISOString(),
      };

      // Only include avatar_url if we have a new one
      if (avatarUrl) {
        profileData.avatar_url = avatarUrl;
      }

      console.log("Updating profile with data:", profileData);

      // Update profile in Supabase
      const { error } = await supabase.from("profiles").upsert(profileData);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Profile updated successfully");

      // Update participant data in all events where this user is a participant
      // But do this in the background without waiting for it to complete
      // This makes the save operation feel much faster
      const updateEventsPromise = (async () => {
        try {
          const { data: events, error: eventsError } = await supabase
            .from("events")
            .select("id, participants_going, participants_maybe")
            .or(
              `participants_going.cs.["${user.id}"], participants_maybe.cs.["${user.id}"]`
            );

          if (!eventsError && events && events.length > 0) {
            console.log(
              `Updating user info in ${events.length} events (background task)`
            );

            // Process all event updates in parallel
            const updatePromises = events.map((event) => {
              // Update going participants
              const updatedGoing = (event.participants_going || []).map(
                (p: any) => {
                  let participant;
                  if (typeof p === "string") {
                    try {
                      participant = JSON.parse(p);
                    } catch {
                      participant = { id: p };
                    }
                  } else {
                    participant = p;
                  }

                  if (participant.id === user.id) {
                    return JSON.stringify({
                      ...participant,
                      full_name: formData.name,
                      instruments,
                      genres,
                    });
                  }
                  return typeof p === "string" ? p : JSON.stringify(p);
                }
              );

              // Update maybe participants
              const updatedMaybe = (event.participants_maybe || []).map(
                (p: any) => {
                  let participant;
                  if (typeof p === "string") {
                    try {
                      participant = JSON.parse(p);
                    } catch {
                      participant = { id: p };
                    }
                  } else {
                    participant = p;
                  }

                  if (participant.id === user.id) {
                    return JSON.stringify({
                      ...participant,
                      full_name: formData.name,
                      instruments,
                      genres,
                    });
                  }
                  return typeof p === "string" ? p : JSON.stringify(p);
                }
              );

              // Update the event
              return supabase
                .from("events")
                .update({
                  participants_going: updatedGoing,
                  participants_maybe: updatedMaybe,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", event.id);
            });

            // Execute all updates in parallel
            await Promise.all(updatePromises);
            console.log("Background event updates completed");
          }
        } catch (error) {
          console.error("Error updating events in background:", error);
          // Don't throw here since this is a background task
        }
      })();

      // Update local state
      const updatedProfile = {
        name: formData.name,
        bio: formData.bio,
        selectedIcons: formData.selectedIcons,
        instruments,
        genres,
        avatar_url: avatarUrl || profile.avatar_url,
      };

      setProfile(updatedProfile);
      setEditProfileMode(false);
      setShowIconSelector(false);
      setIsSaving(false);

      console.log("Profile saved successfully, dispatching event...");

      // Dispatch event to notify other components that profile was updated
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profileUpdated"));
      }

      // No need to await the background event updates
      // Let them complete in the background
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsSaving(false);
      alert("Error saving profile. Please try again.");
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
      avatar_url: profile.avatar_url,
    });
    setEditProfileMode(false);
    setShowIconSelector(false);
  };

  const MAX_ICONS = 10;

  // Function to toggle icon selection
  const toggleIconSelection = (iconId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedIcons.includes(iconId);
      let newSelectedIcons;
      if (isSelected) {
        setIconLimitWarning(false); // Reset warning if deselecting
        newSelectedIcons = prev.selectedIcons.filter((id) => id !== iconId);
      } else {
        if (prev.selectedIcons.length >= MAX_ICONS) {
          setIconLimitWarning(true); // Show warning if trying to exceed
          return prev;
        }
        setIconLimitWarning(false); // Reset warning if under limit
        newSelectedIcons = [...prev.selectedIcons, iconId];
      }

      // Update instruments and genres based on selected icons
      const instruments = newSelectedIcons
        .map((id) => musicIcons.find((icon) => icon.id === id))
        .filter((icon) => icon?.type === "instrument")
        .map((icon) => icon?.id) as string[];

      const genres = newSelectedIcons
        .map((id) => musicIcons.find((icon) => icon.id === id))
        .filter((icon) => icon?.type === "genre")
        .map((icon) => icon?.id) as string[];

      return {
        ...prev,
        selectedIcons: newSelectedIcons,
        instruments,
        genres,
        avatar_url: prev.avatar_url,
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
      <div className="min-h-screen bg-white lg:bg-transparent lg:min-h-0 lg:rounded-xl lg:overflow-hidden lg:border lg:shadow-sm flex flex-col">
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
                    onClick={() => {
                      if (
                        !isSelected &&
                        formData.selectedIcons.length >= MAX_ICONS
                      ) {
                        setIconLimitWarning(true);
                        return;
                      }
                      toggleIconSelection(icon.id);
                    }}
                    style={{
                      opacity:
                        !isSelected &&
                        formData.selectedIcons.length >= MAX_ICONS
                          ? 0.5
                          : 1,
                      cursor:
                        !isSelected &&
                        formData.selectedIcons.length >= MAX_ICONS
                          ? "not-allowed"
                          : "pointer",
                    }}
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
          {iconLimitWarning && (
            <div className="text-xs text-red-500 mt-4 text-center">
              You can select up to 10 icons only.
            </div>
          )}
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
      <div className="min-h-screen bg-white lg:bg-transparent lg:min-h-0 lg:rounded-xl lg:overflow-hidden lg:border lg:shadow-sm flex flex-col">
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
              <div className="relative w-80 h-80 mb-2">
                {/* Avatar centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-4 border-[#ffac6d] w-40 h-40 flex justify-center items-center bg-gray-100 relative">
                  <Image
                    src={
                      profileImagePreview ||
                      profile.avatar_url ||
                      "/placeholder.svg?height=160&width=160"
                    }
                    alt="Profile"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />

                  {/* Upload button overlay */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-sm font-medium">
                      Change Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </label>
                </div>
                {/* Icons absolutely positioned in this larger container */}
                {formData.selectedIcons
                  .concat(
                    formData.instruments.filter(
                      (id) => !formData.selectedIcons.includes(id)
                    ),
                    formData.genres.filter(
                      (id) => !formData.selectedIcons.includes(id)
                    )
                  )
                  .map((iconId, index, arr) => {
                    const icon = musicIcons.find((i) => i.id === iconId);
                    if (!icon) return null;
                    const total = arr.length;
                    const baseRadius = 120;
                    const center = 160;
                    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
                    const x = center + baseRadius * Math.cos(angle);
                    const y = center + baseRadius * Math.sin(angle);

                    return (
                      <div
                        key={icon.id}
                        className="absolute bg-[#ffac6d] rounded-full w-16 h-16 flex items-center justify-center shadow-sm"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          fontSize: "32px",
                          transform: "translate(-50%, -50%)",
                          zIndex: 10,
                        }}
                      >
                        {icon.emoji}
                      </div>
                    );
                  })}
              </div>

              <h2 className="text-3xl font-bold mt-4">{profile.name}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-base font-medium mb-2"
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
                <label
                  htmlFor="bio"
                  className="block text-base font-medium mb-2"
                >
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
                  <label className="block text-base font-medium">
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
                  <label className="block text-base font-medium">
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
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
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
                  avatar_url: profile.avatar_url,
                });
                // Reset image preview when entering edit mode
                setProfileImagePreview(null);
                setProfileImageFile(null);
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;
                  router.push("/login");
                } catch (error) {
                  console.error("Error signing out:", error);
                }
              }}
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
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left column: Avatar & icons */}
            <div className="flex flex-col items-center w-full md:w-auto md:min-w-[320px]">
              <div className="relative w-80 h-80 mb-2">
                {/* Avatar centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-4 border-[#ffac6d] w-40 h-40 flex justify-center items-center bg-gray-100">
                  <Image
                    src={
                      profile.avatar_url ||
                      "/placeholder.svg?height=160&width=160"
                    }
                    alt="Profile"
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Icons absolutely positioned in this larger container */}
                {profile.selectedIcons
                  .concat(
                    profile.instruments.filter(
                      (id) => !profile.selectedIcons.includes(id)
                    ),
                    profile.genres.filter(
                      (id) => !profile.selectedIcons.includes(id)
                    )
                  )
                  .map((iconId, index, arr) => {
                    const icon = musicIcons.find((i) => i.id === iconId);
                    if (!icon) return null;
                    const total = arr.length;
                    const baseRadius = 120;
                    const center = 160;
                    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
                    const x = center + baseRadius * Math.cos(angle);
                    const y = center + baseRadius * Math.sin(angle);

                    return (
                      <div
                        key={icon.id}
                        className="absolute bg-[#ffac6d] rounded-full w-14 h-14 flex items-center justify-center shadow-sm"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          fontSize: "32px",
                          transform: "translate(-50%, -50%)",
                          zIndex: 10,
                        }}
                      >
                        {icon.emoji}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right column: Name, Bio, Instruments, Genres */}
            <div className="flex-1 w-full mt-8 md:mt-0">
              <div className="space-y-4">
                {/* ADD the name here */}
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                <div>
                  <label className="block text-lg font-medium mb-1">Bio:</label>
                  <p className="text-base bg-gray-50 p-3 rounded-lg">
                    {profile.bio}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Instruments:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.instruments.map((instrument) => {
                      const icon = musicIcons.find((i) => i.id === instrument);
                      return (
                        <div
                          key={instrument}
                          className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                        >
                          <span className="mr-2">{icon?.emoji || "🎸"}</span>
                          <span className="text-sm">
                            {icon?.name || instrument}
                          </span>
                        </div>
                      );
                    })}
                    {!profile.instruments.length && (
                      <span className="text-sm text-gray-500 italic">
                        No instruments selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Genres:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.genres.map((genre) => {
                      const icon = musicIcons.find((i) => i.id === genre);
                      return (
                        <div
                          key={genre}
                          className="bg-[#ffd2b0] rounded-full px-3 py-1.5 flex items-center"
                        >
                          <span className="mr-2">{icon?.emoji || "🎵"}</span>
                          <span className="text-sm">{icon?.name || genre}</span>
                        </div>
                      );
                    })}
                    {!profile.genres.length && (
                      <span className="text-sm text-gray-500 italic">
                        No genres selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events and Post Games sections, left-aligned, but "no events" centered */}
          <UpcomingEvents />
          <PostGamesEvents />
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
                avatar_url: profile.avatar_url,
              });
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                router.push("/login");
              } catch (error) {
                console.error("Error signing out:", error);
              }
            }}
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
