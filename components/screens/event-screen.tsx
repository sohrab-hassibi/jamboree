"use client";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Send,
  Info,
  MessageSquare,
  CheckCircle,
  Loader2,
  MapPin,
  Calendar,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  FormEvent,
  useRef,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEventParticipation } from "@/hooks/use-event-participation";
import {
  useEvent,
  type Participant as ParticipantType,
  type Event as EventType,
} from "@/hooks/use-event";
import { useEventChat, type ChatMessage } from "@/hooks/use-event-chat";
import { useAuth } from "@/context/SupabaseContext";
import { ParticipantCard } from "@/components/participant-card";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Music icons data
type MusicIcon = {
  id: string;
  name: string;
  emoji: string;
  type: "instrument" | "genre";
};

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

// Helper function to get emoji by name
const getEmoji = (name: string, type: "instrument" | "genre") => {
  const icon = musicIcons.find(
    (icon) =>
      icon.name.toLowerCase() === name.toLowerCase() && icon.type === type
  );
  return icon ? icon.emoji : name;
};

interface EventScreenProps {
  eventId: string;
  activeView: "chat" | "details";
  setActiveView: (view: "chat" | "details") => void;
  onBack: () => void;
}

export default function EventScreen({
  eventId,
  activeView,
  setActiveView,
  onBack,
}: EventScreenProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  type ParticipantTab = "going" | "maybe";
  const [activeTab, setActiveTab] = useState<ParticipantTab>("going");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { user } = useAuth();
  const {
    status: participationStatus,
    isLoading,
    handleGoing,
    handleMaybe,
    participants,
  } = useEventParticipation(eventId);

  // Fetch event data from the database
  const {
    event: eventData,
    participants: dbParticipants,
    isLoading: isLoadingEvent,
    error: eventError,
    isNotFound,
  } = useEvent(eventId);

  // Check if current user is the event creator
  const isCreator = eventData?.creator_id === user?.id;

  // Use participants from useEventParticipation hook

  // Use event data directly
  const event = eventData;

  // Log event data for debugging
  useEffect(() => {
    console.log("Event data:", event);
    console.log("Event image URL:", event?.image_url);
  }, [event]);

  // Use image from event data - using image_url to match the database schema
  const eventImage = event?.image_url || "/placeholder-event.jpg";

  // Format date and time
  const formattedDate = useMemo(() => {
    if (!event?.start_time) return "";
    const date = new Date(event.start_time);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [event?.start_time]);

  const formattedTime = useMemo(() => {
    if (!event?.start_time || !event?.end_time) return "";
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };
    return `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`;
  }, [event?.start_time, event?.end_time]);

  // Use the event chat hook for real-time messaging
  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    sendMessage,
  } = useEventChat(eventId);

  // State for the new message input
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Reference to the messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle sending a new message
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const result = await sendMessage(newMessage.trim());
    setIsSending(false);

    if (result?.success) {
      setNewMessage(""); // Clear input after sending
      // Scroll to bottom after sending a message
      scrollToBottom();
    } else if (result?.error) {
      console.error("Failed to send message:", result.error);
      // You could add a toast notification here for error feedback
    }
  };

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffac6d]" />
      </div>
    );
  }

  if (eventError) {
    const error = eventError as any;
    console.error("Error fetching event:", {
      message: error.message,
      name: error.name,
      ...(error.code && { code: error.code }),
      ...(error.details && { details: error.details }),
      ...(error.hint && { hint: error.hint }),
    });

    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full space-y-4">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isNotFound ? "Event Not Found" : "Error Loading Event"}
          </h2>
          <p className="text-gray-600 mb-6">
            {isNotFound
              ? "We couldn't find the event you're looking for. It may have been removed or the link might be incorrect."
              : `We encountered an error while loading this event (${
                  error.code || "unknown error"
                }).`}
          </p>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={onBack}
              className="bg-[#ffac6d] hover:bg-[#fdc193] text-black w-full"
              size="lg"
            >
              Back to Events
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !dbParticipants) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <p className="text-gray-700 mb-4">No event data available</p>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-[#ffac6d] text-[#ffac6d] hover:bg-[#fff5ee]"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <p className="text-gray-700 mb-4">Event details not available</p>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-[#ffac6d] text-[#ffac6d] hover:bg-[#fff5ee]"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const navigateToProfile = (userId: string, name: string) => {
    // Store the current event ID in session storage before navigating
    if (typeof window !== "undefined" && eventId) {
      sessionStorage.setItem("referringEventId", eventId);
    }

    // Navigate to user profile
    console.log(`Navigating to ${name}'s profile (${userId})`);
    // Navigate to the user's profile page
    router.push(`/profile/${userId}`);
  };

  // Handle participant click
  const handleParticipantClick = (participant: ParticipantType) => {
    if (participant?.id) {
      const fullName = participant.full_name || "User";
      navigateToProfile(participant.id, fullName);
    }
  };

  // Handle going to event
  const handleGoingClick = async () => {
    try {
      await handleGoing();
    } catch (error) {
      console.error("Error updating participation status:", error);
    }
  };

  // Handle maybe going to event
  const handleMaybeClick = async () => {
    try {
      await handleMaybe();
    } catch (error) {
      console.error("Error updating participation status:", error);
    }
  };

  // Event detail view component
  function EventDetailView() {
    if (!event) return null;

    const [editFormData, setEditFormData] = useState({
      title: event.title,
      description: event.description,
      location: event.location,
      start_time: event.start_time,
      end_time: event.end_time,
      imageFile: null as File | null,
      imagePreview: event.image_url || "",
    });

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setEditFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    };

    const handleSaveEdit = async () => {
      try {
        let image_url = event.image_url;

        // Upload new image if one was selected
        if (editFormData.imageFile) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("event-images")
            .upload(`${eventId}/${editFormData.imageFile.name}`, editFormData.imageFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("event-images")
            .getPublicUrl(`${eventId}/${editFormData.imageFile.name}`);

          image_url = publicUrl;
        }

        // Update event data
        const { error: updateError } = await supabase
          .from("events")
          .update({
            title: editFormData.title,
            description: editFormData.description,
            location: editFormData.location,
            start_time: editFormData.start_time,
            end_time: editFormData.end_time,
            image_url,
          })
          .eq("id", eventId);

        if (updateError) throw updateError;

        toast.success("Event updated successfully!");
        setIsEditMode(false);
      } catch (error) {
        console.error("Error updating event:", error);
        toast.error("Failed to update event. Please try again.");
      }
    };

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={isEditMode ? editFormData.imagePreview : (event.image_url || "/placeholder.svg")}
            alt={event.title}
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />
          {isCreator && !isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 text-black px-4 py-2 rounded-md shadow-sm hover:bg-opacity-100 transition-opacity"
            >
              Edit Event
            </button>
          )}
        </div>

        <div className="p-6 md:p-8">
          {isEditMode ? (
            <div className="space-y-4">
              <Input
                name="title"
                value={editFormData.title}
                onChange={handleChange}
                placeholder="Event Title"
                className="text-xl font-bold"
              />
              <div>
                <label className="block text-sm font-medium mb-1">Event Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>
              <Input
                name="location"
                value={editFormData.location}
                onChange={handleChange}
                placeholder="Location"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  name="start_time"
                  value={editFormData.start_time}
                  onChange={handleChange}
                />
                <Input
                  type="datetime-local"
                  name="end_time"
                  value={editFormData.end_time}
                  onChange={handleChange}
                />
              </div>
              <Textarea
                name="description"
                value={editFormData.description}
                onChange={handleChange}
                placeholder="Event Description"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-8">
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-base">{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-base">{formattedDate} • {formattedTime}</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="font-medium text-lg mb-3">About</h2>
                <p className="text-base">{event.description}</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center text-base">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{event.location}</span>
                  </div>
                  <div className="flex items-center text-base">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">
                      {formattedDate} · {formattedTime}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGoingClick}
                    disabled={isLoading}
                    variant={participationStatus === "going" ? "default" : "outline"}
                    className={`${
                      participationStatus === "going"
                        ? "bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                        : ""
                    }`}
                  >
                    {participationStatus === "going" ? (
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 mr-1.5" />
                    )}
                    I'm Going
                  </Button>
                  <Button
                    onClick={handleMaybeClick}
                    disabled={isLoading}
                    variant={participationStatus === "maybe" ? "default" : "outline"}
                    className={`${
                      participationStatus === "maybe"
                        ? "bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                        : ""
                    }`}
                  >
                    {participationStatus === "maybe" ? (
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 mr-1.5" />
                    )}
                    Maybe
                  </Button>
                </div>
              </div>

              {/* Participants section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Participants</h2>
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === "going" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("going")}
                      className={activeTab === "going" ? "bg-[#ffac6d] text-black hover:bg-[#fdc193]" : ""}
                    >
                      Going ({participants.going.length})
                    </Button>
                    <Button
                      variant={activeTab === "maybe" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("maybe")}
                      className={activeTab === "maybe" ? "bg-[#ffac6d] text-black hover:bg-[#fdc193]" : ""}
                    >
                      Maybe ({participants.maybe.length})
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {activeTab === "going" ? (
                    participants.going.length > 0 ? (
                      participants.going.map((participant) => (
                        <div
                          key={participant.id}
                          className="bg-[#ffd2b0] rounded-lg py-2 px-3 cursor-pointer hover:bg-[#fdc193] transition-colors shadow-sm w-full"
                          onClick={() => handleParticipantClick(participant)}
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-2 flex-shrink-1">
                              <Avatar className="w-7 h-7 flex-shrink-0">
                                <Image
                                  src={participant.avatar_url || "/placeholder.svg"}
                                  alt={participant.full_name || "User"}
                                  width={28}
                                  height={28}
                                  className="object-cover"
                                />
                              </Avatar>
                              <span className="font-medium text-sm">
                                {participant.full_name || "User"}
                                {participant.id === event.creator_id && " (HOST)"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm col-span-full">
                        No one is going yet
                      </div>
                    )
                  ) : participants.maybe.length > 0 ? (
                    participants.maybe.map((participant) => (
                      <div
                        key={participant.id}
                        className="bg-[#ffd2b0] rounded-lg py-2 px-3 cursor-pointer hover:bg-[#fdc193] transition-colors shadow-sm w-full"
                        onClick={() => handleParticipantClick(participant)}
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2 flex-shrink-1">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                              <Image
                                src={participant.avatar_url || "/placeholder.svg"}
                                alt={participant.full_name || "User"}
                                width={28}
                                height={28}
                                className="object-cover"
                              />
                            </Avatar>
                            <span className="font-medium text-sm">
                              {participant.full_name || "User"}
                              {participant.id === event.creator_id && " (HOST)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm col-span-full">
                      No one has responded maybe
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col overflow-hidden">
      <header className="flex items-center p-4 md:p-6 border-b flex-shrink-0">
        <button className="mr-2" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <Image
              src={event.image_url || "/placeholder.svg"}
              alt="Event"
              width={32}
              height={32}
              className="object-cover"
            />
          </Avatar>
          <h1 className="text-lg font-medium">{event.title}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          {currentUserId === event.creator_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="border-[#ffac6d] text-[#ffac6d] hover:bg-[#fff5ee]"
            >
              {isEditMode ? "Cancel Edit" : "Edit Event"}
            </Button>
          )}
          {isDesktop ? (
            <div className="flex gap-2">
              <Button
                variant={activeView === "chat" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("chat")}
                className={
                  activeView === "chat"
                    ? "bg-[#ffac6d] text-black hover:bg-[#fdc193]"
                    : ""
                }
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <Button
                variant={activeView === "details" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("details")}
                className={
                  activeView === "details"
                    ? "bg-[#ffac6d] text-black hover:bg-[#fdc193]"
                    : ""
                }
              >
                <Info className="h-4 w-4 mr-1" />
                Details
              </Button>
            </div>
          ) : (
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() =>
                setActiveView(activeView === "chat" ? "details" : "chat")
              }
            >
              {activeView === "chat" ? (
                <Info className="h-5 w-5" />
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </header>

      {activeView === "details" ? (
        <div className="flex-1 overflow-y-auto pb-[56px] lg:pb-0">
          <EventDetailView />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pl-0 pr-0">
            <div className="p-4 md:p-6 space-y-4 pb-[120px] lg:pb-[80px] lg:pr-0">
              {isLoadingMessages ? (
                <div className="flex justify-center my-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#ffac6d]" />
                </div>
              ) : messagesError ? (
                <div className="text-center text-red-500 my-4">
                  Error loading messages
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 my-4">
                  No messages yet. Be the first to say hello!
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isCurrentUser = message.user_id === user?.id;
                    const messageDate = new Date(message.created_at);
                    const messageTime = messageDate.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={message.id}
                        className={`flex items-start ${
                          isCurrentUser ? "justify-end gap-2" : "gap-2"
                        }`}
                      >
                        {!isCurrentUser ? (
                          <Avatar className="w-8 h-8">
                            <Image
                              src={
                                message.user?.avatar_url || "/placeholder.svg"
                              }
                              alt={message.user?.full_name || "User"}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </Avatar>
                        ) : (
                          <Avatar className="w-8 h-8 order-1">
                            <Image
                              src={
                                user?.user_metadata?.avatar_url ||
                                "/placeholder.svg"
                              }
                              alt="You"
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </Avatar>
                        )}
                        <div
                          className={`${
                            isCurrentUser
                              ? "w-full flex flex-col items-end"
                              : ""
                          }`}
                        >
                          {!isCurrentUser ? (
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-medium">
                                {message.user?.full_name || "User"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {messageTime}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <div className="text-xs text-gray-500">
                                {messageTime}
                              </div>
                              <div className="text-xs font-medium">You</div>
                            </div>
                          )}
                          <div
                            className={`${
                              isCurrentUser ? "bg-[#ffd2b0]" : "bg-gray-100"
                            } rounded-lg p-2 mt-1 inline-block max-w-xs`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* This empty div is used as a reference for auto-scrolling */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {isDesktop && (
            <div className="w-64 border-l">
              <div className="p-4 border-b">
                <h2 className="font-medium mb-2">Your Status</h2>
                <div className="flex flex-col gap-2 mb-4">
                  <Button
                    onClick={handleGoing}
                    disabled={isLoading}
                    size="sm"
                    variant={
                      participationStatus === "going" ? "default" : "outline"
                    }
                    className={`w-full justify-start ${
                      participationStatus === "going"
                        ? "bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {participationStatus === "going" ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 mr-2" />
                    )}
                    I'm Going
                  </Button>
                  <Button
                    onClick={handleMaybe}
                    disabled={isLoading}
                    size="sm"
                    variant={
                      participationStatus === "maybe" ? "default" : "outline"
                    }
                    className={`w-full justify-start ${
                      participationStatus === "maybe"
                        ? "bg-[#ffac6d] hover:bg-[#fdc193] text-black"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {participationStatus === "maybe" ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 mr-2" />
                    )}
                    Maybe
                  </Button>
                </div>
                <h2 className="font-medium">Participants</h2>
              </div>
              <div className="p-2">
                <div className="flex border-b mb-2">
                  <button
                    className={`py-1.5 px-3 text-xs font-medium ${
                      activeTab === "going"
                        ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("going")}
                  >
                    Going ({participants.going.length})
                  </button>
                  <button
                    className={`py-1.5 px-3 text-xs font-medium ${
                      activeTab === "maybe"
                        ? "border-b-2 border-[#ffac6d] text-[#ffac6d]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("maybe")}
                  >
                    Maybe ({participants.maybe.length})
                  </button>
                </div>

                <div className="space-y-1 mt-2">
                  {activeTab === "going"
                    ? participants.going
                        .slice(0, 8)
                        .map((participant) => (
                          <ParticipantCard
                            key={`going-${participant.id}`}
                            participant={participant}
                            isHost={participant.id === event?.creator_id}
                            onClick={() => handleParticipantClick(participant)}
                          />
                        ))
                    : participants.maybe
                        .slice(0, 8)
                        .map((participant) => (
                          <ParticipantCard
                            key={`maybe-${participant.id}`}
                            participant={participant}
                            isHost={participant.id === event?.creator_id}
                            onClick={() => handleParticipantClick(participant)}
                          />
                        ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === "chat" && (
        <div className="border-t px-4 md:px-6 py-3 fixed bottom-[56px] left-0 right-0 lg:bottom-0 lg:left-[288px] lg:right-64 bg-white z-10 shadow-sm">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 max-w-full"
          >
            <Input
              placeholder="Type your message..."
              className="flex-1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#ffac6d] hover:bg-[#fdc193] text-black flex-shrink-0"
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
