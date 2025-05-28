import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Jamboree! 🎵</h1>
        <p className="text-gray-600">
          Let's get your profile set up so you can start jamming with other musicians.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">What's next?</h2>
          <ul className="text-left space-y-2">
            <li className="flex items-center">
              <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
              Upload a profile photo
            </li>
            <li className="flex items-center">
              <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
              Select your instruments
            </li>
            <li className="flex items-center">
              <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
              Choose your favorite genres
            </li>
            <li className="flex items-center">
              <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
              Tell us about yourself
            </li>
          </ul>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-[#ffac6d] hover:bg-[#fdc193] text-black"
      >
        Let's Get Started
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
} 