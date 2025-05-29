// Event participant types and validation
export interface EventParticipant {
  id: string;
  full_name: string;
  avatar_url: string;
  instruments: string[];
  genres: string[];
}

// Validation function to ensure participant data meets our requirements
export function validateParticipant(data: any): data is EventParticipant {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.full_name === 'string' &&
    typeof data.avatar_url === 'string' &&
    Array.isArray(data.instruments) &&
    Array.isArray(data.genres) &&
    data.instruments.every((i: any) => typeof i === 'string') &&
    data.genres.every((g: any) => typeof g === 'string')
  );
}

// Helper to create a standardized participant object
export function createStandardParticipant(data: Partial<EventParticipant>): EventParticipant {
  return {
    id: data.id || 'unknown',
    full_name: data.full_name || 'User',
    avatar_url: data.avatar_url || '/placeholder.svg',
    instruments: Array.isArray(data.instruments) ? data.instruments : [],
    genres: Array.isArray(data.genres) ? data.genres : []
  };
}

// Helper to stringify participant data consistently
export function stringifyParticipant(participant: EventParticipant): string {
  return JSON.stringify(participant);
}

// Helper to parse participant data safely
export function parseParticipant(data: string | any): EventParticipant | null {
  try {
    // If it's a string, try to parse it
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    // Validate the parsed data
    if (validateParticipant(parsed)) {
      return parsed;
    }
    
    // If we have at least an ID, create a standardized object
    if (parsed && typeof parsed.id === 'string') {
      return createStandardParticipant(parsed);
    }
    
    // If we just have a string ID
    if (typeof data === 'string') {
      return createStandardParticipant({ id: data });
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing participant data:', error);
    return null;
  }
} 