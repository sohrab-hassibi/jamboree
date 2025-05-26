import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface BioStepProps {
  value: string;
  onChange: (bio: string) => void;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function BioStep({
  value,
  onChange,
  onComplete,
  onBack,
  isLoading,
}: BioStepProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Share a bit about your musical journey and what you're looking for
        </p>
      </div>

      <div className="space-y-3 md:space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: I've been playing guitar for 5 years and love jamming to blues and rock. Looking for fellow musicians to start a band or just jam together on weekends!"
          className="min-h-[120px] md:min-h-[150px] text-sm md:text-base"
        />
        <p className="text-xs md:text-sm text-gray-500 text-right">
          {value.length}/500 characters
        </p>
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
          onClick={onComplete}
          className="bg-[#ffac6d] hover:bg-[#fdc193] text-black text-sm md:text-base"
          disabled={!value.trim() || isLoading}
        >
          {isLoading ? "Completing Setup..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
} 