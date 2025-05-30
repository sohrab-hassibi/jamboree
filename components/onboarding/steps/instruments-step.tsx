import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MUSIC_ICONS } from "@/constants/music-icons";

interface InstrumentsStepProps {
  value: string[];
  onChange: (instruments: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function InstrumentsStep({
  value,
  onChange,
  onNext,
  onBack,
}: InstrumentsStepProps) {
  const instruments = MUSIC_ICONS.filter(icon => icon.type === "instrument");

  const toggleInstrument = (instrumentId: string) => {
    if (value.includes(instrumentId)) {
      onChange(value.filter(i => i !== instrumentId));
    } else {
      onChange([...value, instrumentId]);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">What do you play?</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Select all instruments you play (you can add more later)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 sm:grid-cols-3">
        {instruments.map((instrument) => (
          <button
            key={instrument.id}
            onClick={() => toggleInstrument(instrument.id)}
            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
              value.includes(instrument.id)
                ? "border-[#ffac6d] bg-[#fff5eb]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-xl md:text-2xl mb-1 md:mb-2">{instrument.emoji}</div>
            <div className="text-xs md:text-sm font-medium">{instrument.name}</div>
          </button>
        ))}
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
          disabled={value.length === 0}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}