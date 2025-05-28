import { useState } from "react";
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload file to Supabase storage in the avatars bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // First, try to delete any existing avatar for this user to avoid storage clutter
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list('', {
          search: user.id
        });
        
      if (existingFiles?.length) {
        await Promise.all(
          existingFiles.map(file => 
            supabase.storage
              .from('avatars')
              .remove([file.name])
          )
        );
      }

      // Upload the new avatar
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Profile photo uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
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
          {value ? (
            <Image
              src={value}
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
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className="cursor-pointer text-sm md:text-base"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {value ? "Change Photo" : "Upload Photo"}
              </>
            )}
          </Button>
        </label>
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
          onClick={onNext}
          className="bg-[#ffac6d] hover:bg-[#fdc193] text-black text-sm md:text-base"
          disabled={!value || isUploading}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 