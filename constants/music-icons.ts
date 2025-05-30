export type MusicIcon = {
  id: string;
  name: string;
  emoji: string;
  type: "instrument" | "genre";
};

export const MUSIC_ICONS: MusicIcon[] = [
  // Instruments
  { id: "guitar", name: "Guitar", emoji: "🎸", type: "instrument" },
  { id: "piano", name: "Piano", emoji: "🎹", type: "instrument" },
  { id: "drums", name: "Drums", emoji: "🥁", type: "instrument" },
  { id: "bass", name: "Bass", emoji: "🎸", type: "instrument" },
  { id: "violin", name: "Violin", emoji: "🎻", type: "instrument" },
  { id: "vocals", name: "Vocals", emoji: "🎤", type: "instrument" },
  { id: "saxophone", name: "Saxophone", emoji: "🎷", type: "instrument" },
  { id: "trumpet", name: "Trumpet", emoji: "🎺", type: "instrument" },
  { id: "dj", name: "DJ", emoji: "🎧", type: "instrument" },
  
  // Genres
  { id: "rock", name: "Rock", emoji: "🤘", type: "genre" },
  { id: "jazz", name: "Jazz", emoji: "🎷", type: "genre" },
  { id: "pop", name: "Pop", emoji: "⭐", type: "genre" }, // Fixed to star
  { id: "hiphop", name: "Hip Hop", emoji: "🎤", type: "genre" },
  { id: "rnb", name: "R&B", emoji: "🎼", type: "genre" },
  { id: "electronic", name: "Electronic", emoji: "🎹", type: "genre" },
  { id: "classical", name: "Classical", emoji: "🎼", type: "genre" },
  { id: "country", name: "Country", emoji: "🤠", type: "genre" },
  { id: "reggae", name: "Reggae", emoji: "🌴", type: "genre" },
];

// Helper function to get icon by name (for backward compatibility)
export const getIconByName = (name: string, type: "instrument" | "genre"): MusicIcon | undefined => {
  return MUSIC_ICONS.find(icon => 
    icon.name.toLowerCase() === name.toLowerCase() && icon.type === type
  );
};

// Helper function to convert names to IDs
export const convertNamesToIds = (names: string[], type: "instrument" | "genre"): string[] => {
  return names.map(name => {
    const icon = getIconByName(name, type);
    return icon ? icon.id : name.toLowerCase().replace(/\s+/g, '');
  }).filter(Boolean);
};