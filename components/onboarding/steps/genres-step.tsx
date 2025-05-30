import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MUSIC_ICONS } from "@/constants/music-icons";

interface GenresStepProps {
  value: string[];
  onChange: (genres: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GenresStep({
  value,
  onChange,
  onNext,
  onBack,
}: GenresStepProps) {
  const genres = MUSIC_ICONS.filter(icon => icon.type === "genre");

  const toggleGenre = (genreId: string) => {
    if (value.includes(genreId)) {
      onChange(value.filter(g => g !== genreId));
    } else {
      onChange([...value, genreId]);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">What music do you like?</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Select your favorite genres (you can add more later)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 sm:grid-cols-3">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => toggleGenre(genre.id)}
            className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
              value.includes(genre.id)
                ? "border-[#ffac6d] bg-[#fff5eb]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-xl md:text-2xl mb-1 md:mb-2">{genre.emoji}</div>
            <div className="text-xs md:text-sm font-medium">{genre.name}</div>
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