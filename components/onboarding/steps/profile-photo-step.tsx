import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { toast } from "sonner";

interface ProfilePhotoStepProps {
  value: string;
  onChange: (url: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ProfilePhotoStep({
  value,
  onChange,
  onNext,
  onBack,
}: ProfilePhotoStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(value || null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize the image before upload to improve performance and reduce storage usage
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change detected');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File selected:', file.name);

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

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

  const handleSavePhoto = async () => {
    if (!profileImageFile) {
      // If there's no file but there is a value (URL), just continue
      if (value) {
        onNext();
        return;
      }
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload to Supabase Storage using the same approach as profile screen
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
          .from("event-images") // Use the same bucket as profile screen
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
      onChange(publicUrl);
      toast.success('Profile photo uploaded successfully!');
      onNext();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">Add a profile photo</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Help other musicians recognize you with a great profile photo
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-300">
          {profileImagePreview || value ? (
            <Image
              src={profileImagePreview || value}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          className="text-sm md:text-base"
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {profileImagePreview || value ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-sm md:text-base"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSavePhoto}
          className="bg-[#ffac6d] hover:bg-[#fdc193] text-black text-sm md:text-base"
          disabled={(!profileImageFile && !value) || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}