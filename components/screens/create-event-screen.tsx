"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  MapPin,
  Clock,
  FileText,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/SupabaseContext";

interface CreateEventScreenProps {
  onCancel: () => void;
}

export default function CreateEventScreen({
  onCancel,
}: CreateEventScreenProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    bandId: undefined,
    imageFile: null as File | null,
    imagePreview: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.title.trim()) {
        throw new Error("Event title is required");
      }

      // Upload image to Supabase Storage if a new image was selected
      let imageUrl = "";
      if (formData.imageFile) {
        try {
          const fileExt = formData.imageFile.name.split(".").pop();
          const fileName = `event-${Date.now()}.${fileExt}`;
          const filePath = `events/${fileName}`;

          console.log("Uploading file:", {
            filePath,
            size: formData.imageFile.size,
          });

          // First try to upload the file
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("event-images") // Make sure this bucket exists in your Supabase storage
              .upload(filePath, formData.imageFile, {
                cacheControl: "3600",
                upsert: false,
              });

          if (uploadError) {
            console.error("Upload error details:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          console.log("Upload successful:", uploadData);

          // Then get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("event-images").getPublicUrl(filePath);

          console.log("Generated public URL:", publicUrl);
          imageUrl = publicUrl;
        } catch (error: any) {
          console.error("Error in image upload process:", error);
          const errorMessage =
            error?.message || "Unknown error during image upload";
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      // Prepare event data with explicit types
      const eventData: Record<string, any> = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        start_time: formData.startTime,
        end_time: formData.endTime,
        creator_id: user?.id,
        image_url: imageUrl || null,
      };

      console.log("Supabase client config:", {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key:
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + "...",
      });

      console.log("Sending to Supabase:", JSON.stringify(eventData, null, 2));

      // Insert the new event into the database
      const { data, error } = await supabase
        .from("events")
        .insert([eventData])
        .select();

      if (error) {
        console.error("Full Supabase error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Database error: ${error.message || "Unknown error"}`);
      }

      if (!data) {
        throw new Error("No data returned from server");
      }

      console.log("Event created successfully:", data);
      toast.success("Event created successfully!");

      // Small delay before navigation to ensure toast is visible
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Go back to events list
      onCancel();
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to create event: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-white lg:min-h-0 lg:h-screen flex flex-col"
    >
      <header className="p-4 md:p-6 border-b flex items-center">
        <button
          type="button"
          className="mr-3"
          onClick={onCancel}
          disabled={isLoading}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">Create event</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Event Image
              </label>
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                {formData.imagePreview ? (
                  <div className="w-full h-full">
                    <img
                      src={formData.imagePreview}
                      alt="Event preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-sm text-gray-500 mt-2 group-hover:text-gray-700 transition-colors">
                      Add a cover photo
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <MapPin className="h-5 w-5 text-[#b3261e]" />
                  </div>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Time *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Clock className="h-5 w-5 text-[#49454f]" />
                    </div>
                    <Input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Time *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Clock className="h-5 w-5 text-[#49454f]" />
                    </div>
                    <Input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      disabled={isLoading}
                      min={formData.startTime}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3">
                  <FileText className="h-5 w-5 text-[#49454f]" />
                </div>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event and the norms you want to set for participants, both on and offline!"
                  className="pl-10 min-h-[120px]"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border-t flex justify-end">
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            type="button"
            variant="outline"
            className={isDesktop ? "" : "flex-1"}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={`bg-[#ffac6d] hover:bg-[#fdc193] text-black ${
              isDesktop ? "" : "flex-1"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Post Event"
            )}
          </Button>
        </div>
      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </form>
  );
}
