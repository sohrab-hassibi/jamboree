'use client';

import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import { Participant } from "@/hooks/use-event";
import { MUSIC_ICONS } from "@/constants/music-icons";

const normalizeName = (name: string) => {
  // Convert to lowercase and remove all non-word characters (including spaces)
  return name.toLowerCase().replace(/\s+/g, '');
};

const getEmoji = (name: string, type: "instrument" | "genre") => {
  const normalizedInput = normalizeName(name);
  const icon = MUSIC_ICONS.find(icon => 
    normalizeName(icon.name) === normalizedInput && icon.type === type
  );
  return icon ? icon.emoji : name;
};

export function ParticipantCard({ 
  participant, 
  isHost,
  onClick 
}: { 
  participant: Participant; 
  isHost: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="w-6 h-6 flex-shrink-0">
          <Image
            src={participant.avatar_url}
            alt={participant.full_name || 'User'}
            width={24}
            height={24}
            className="object-cover"
          />
        </Avatar>
        <div className="text-sm truncate">
          {participant.full_name || 'User'}
          {isHost && " (HOST)"}
        </div>
      </div>
      
      {(participant.instruments?.length || participant.genres?.length) && (
        <div className="flex flex-shrink-0 gap-1.5">
          {participant.instruments?.slice(0, 2).map(instrument => {
            const emoji = getEmoji(instrument, 'instrument');
            return (
              <span 
                key={instrument} 
                className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs text-orange-600"
                title={instrument}
              >
                {emoji}
              </span>
            );
          })}
          {participant.genres?.slice(0, 2).map(genre => {
            const emoji = getEmoji(genre, 'genre');
            return (
              <span 
                key={genre} 
                className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs text-orange-600"
                title={genre}
              >
                {emoji}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
