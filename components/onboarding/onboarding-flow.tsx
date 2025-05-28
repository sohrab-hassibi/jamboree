"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import WelcomeStep from "./steps/welcome-step";
import ProfilePhotoStep from "./steps/profile-photo-step";
import InstrumentsStep from "./steps/instruments-step";
import GenresStep from "./steps/genres-step";
import BioStep from "./steps/bio-step";

const STEPS = [
  "welcome",
  "profile-photo",
  "instruments",
  "genres",
  "bio"
] as const;

type Step = typeof STEPS[number];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    profilePhoto: "",
    instruments: [] as string[],
    genres: [] as string[],
    bio: "",
  });
  const router = useRouter();

  const handleNext = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Upload profile data to profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata.full_name,
          avatar_url: formData.profilePhoto,
          instruments: formData.instruments,
          genres: formData.genres,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      toast.success("Profile setup complete!");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep onNext={handleNext} />;
      case "profile-photo":
        return (
          <ProfilePhotoStep
            value={formData.profilePhoto}
            onChange={(url) => updateFormData("profilePhoto", url)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "instruments":
        return (
          <InstrumentsStep
            value={formData.instruments}
            onChange={(instruments) => updateFormData("instruments", instruments)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "genres":
        return (
          <GenresStep
            value={formData.genres}
            onChange={(genres) => updateFormData("genres", genres)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "bio":
        return (
          <BioStep
            value={formData.bio}
            onChange={(bio) => updateFormData("bio", bio)}
            onComplete={handleComplete}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 md:mb-8 flex justify-center">
          <div className="flex space-x-2">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`h-1.5 md:h-2 w-6 md:w-8 rounded-full ${
                  STEPS.indexOf(currentStep) >= index
                    ? "bg-[#ffac6d]"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        {renderStep()}
      </div>
    </div>
  );
} 