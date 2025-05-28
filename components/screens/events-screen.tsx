"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { UserEvent } from "@/hooks/use-user-events"
import { useAuth } from "@/context/SupabaseContext"


interface EventsScreenProps {
  onOpenEvent: (eventId: string) => void
  onCreateEvent: () => void
}

interface Event {
  id: string;
  title: string;
  start_time: string;
  date: string;
  end_time?: string;
  location?: string;
  image?: string;
  description: string;
  score?: number;
  participants_going?: any[];
  participants_maybe?: any[];
}

type Document = string; 

class TfIdf {
  documents: Document[] = [];
  private termFrequency: Map<string, Map<string, number>> = new Map();
  private documentFrequency: Map<string, number> = new Map();

  // Add a document to the corpus
  addDocument(doc: Document): void {
    this.documents.push(doc);

    const terms = this.tokenize(doc);
    const termCounts: Map<string, number> = new Map();

    // Count term frequencies in the document
    terms.forEach((term) => {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    });

    // Normalize term frequencies
    const totalTerms = terms.length;
    const normalizedTermCounts: Map<string, number> = new Map();
    termCounts.forEach((count, term) => {
      normalizedTermCounts.set(term, count / totalTerms);
    });

    // Store term frequencies for this document
    this.termFrequency.set(doc, normalizedTermCounts);

    // Update document frequency for each term
    const uniqueTerms = new Set(terms);
    uniqueTerms.forEach((term) => {
      this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
    });
  }

  // Calculate TF-IDF for a term in a specific document
  calculateTfIdf(term: string, doc: Document): number {
    const tf = this.termFrequency.get(doc)?.get(term) || 0;
    const idf = this.calculateIdf(term);
    return tf * idf;
  }

  // Calculate IDF for a term
  private calculateIdf(term: string): number {
    const totalDocuments = this.documents.length;
    const docCount = this.documentFrequency.get(term) || 0;
    return Math.log(totalDocuments / (1 + docCount));
  }

  // Tokenize a document into terms
  tokenize(doc: Document): string[] {
    if (!doc) return [];
    return doc
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
      .split(/\s+/); // Split by whitespace
  }
}

const createVector = (docIndex: number, vocab: string[], vocabIndex: Map<string, number>, tfidf: TfIdf): number[] => {
  const vector = new Array(vocab.length).fill(0);
  tfidf.tokenize(tfidf.documents[docIndex]).forEach((word: string) => {
    const idx = vocabIndex.get(word);
    if (idx) {
      vector[idx] = tfidf.calculateTfIdf(word, tfidf.documents[docIndex]);
    } 
  });

  return vector;
};

const cosineSim = (vec1: number[], vec2: number[]): number => {  
  let totProd = 0;
  let aProd = 0;
  let bProd = 0;
  vec1.forEach((aVal, i) => {
    totProd = totProd + aVal * vec2[i];
    aProd = aProd + aVal ** 2;
    bProd = bProd + vec2[i] ** 2;
  });
  return totProd / (Math.sqrt(aProd) * Math.sqrt(bProd));
};

const instrumentCompatibility: Record<string, Record<string, number>> = {
  guitar: {
    guitar: 0.7,    // Rhythm + Lead guitar combinations
    piano: 0.9,     // Classic combo
    drums: 0.95,    // Essential rhythm section
    saxophone: 0.8,  // Jazz/Blues combo
    trumpet: 0.75,   // Horn section potential
    violin: 0.85,    // Folk/Classical combo
    vocals: 0.95,    // Guitar + vocals is classic
    dj: 0.6         // Can work but needs arrangement
  },
  piano: {
    guitar: 0.9,     // Classic combo
    piano: 0.7,      // Piano duets can work well
    drums: 0.9,      // Strong rhythmic foundation
    saxophone: 0.9,   // Jazz standard
    trumpet: 0.85,    // Jazz/Classical combo
    violin: 0.95,     // Classical duo
    vocals: 0.95,     // Essential accompaniment
    dj: 0.5          // Less common pairing
  },
  drums: {
    guitar: 0.95,    // Essential rhythm section
    piano: 0.9,      // Strong rhythmic foundation
    drums: 0.4,      // Multiple drums can be tricky
    saxophone: 0.85,  // Jazz combo
    trumpet: 0.85,    // Big band essential
    violin: 0.7,      // Less common but can work
    vocals: 0.9,      // Rhythm for vocals
    dj: 0.8          // Beat matching potential
  },
  saxophone: {
    guitar: 0.8,     // Jazz/Blues combo
    piano: 0.9,      // Jazz standard
    drums: 0.85,     // Jazz combo
    saxophone: 0.75,  // Horn section
    trumpet: 0.95,    // Classic horn section
    violin: 0.7,      // Less common but interesting
    vocals: 0.85,     // Jazz vocals
    dj: 0.6          // Modern fusion
  },
  trumpet: {
    guitar: 0.75,    // Horn section potential
    piano: 0.85,     // Jazz/Classical combo
    drums: 0.85,     // Big band essential
    saxophone: 0.95,  // Classic horn section
    trumpet: 0.8,     // Horn section
    violin: 0.8,      // Classical orchestra
    vocals: 0.8,      // Big band vocals
    dj: 0.5          // Less common
  },
  violin: {
    guitar: 0.85,    // Folk/Classical combo
    piano: 0.95,     // Classical duo
    drums: 0.7,      // Less common but can work
    saxophone: 0.7,   // Less common but interesting
    trumpet: 0.8,     // Classical orchestra
    violin: 0.9,      // String ensemble
    vocals: 0.9,      // Classical/Folk combo
    dj: 0.4          // Uncommon pairing
  },
  vocals: {
    guitar: 0.95,    // Guitar + vocals is classic
    piano: 0.95,     // Essential accompaniment
    drums: 0.9,      // Rhythm for vocals
    saxophone: 0.85,  // Jazz vocals
    trumpet: 0.8,     // Big band vocals
    violin: 0.9,      // Classical/Folk combo
    vocals: 0.8,      // Vocal harmonies
    dj: 0.75         // Modern electronic
  },
  dj: {
    guitar: 0.6,     // Can work but needs arrangement
    piano: 0.5,      // Less common pairing
    drums: 0.8,      // Beat matching potential
    saxophone: 0.6,   // Modern fusion
    trumpet: 0.5,     // Less common
    violin: 0.4,      // Uncommon pairing
    vocals: 0.75,    // Modern electronic
    dj: 0.6          // B2B sets
  }
};

const fetchEventsForUser = async (userId: string) => {
  const now = new Date().toISOString();
  
  // Fetch upcoming events
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gt('start_time', now)
    .order('start_time', { ascending: true });

  // Fetch past events
  const { data: pastEvents } = await supabase
    .from('events')
    .select('*')
    .lt('start_time', now)
    .order('start_time', { ascending: false });

  // Process events to ensure we only get events where the user is actually in the participants
  const filterUserEvents = (events: any[] | null) => {
    return (events || []).filter(event => {
      const isGoing = (event.participants_going || []).some((p: any) => {
        if (typeof p === 'string') {
          try {
            const parsed = JSON.parse(p);
            return parsed.id === userId;
          } catch {
            return p === userId;
          }
        }
        return p.id === userId;
      });

      const isMaybe = (event.participants_maybe || []).some((p: any) => {
        if (typeof p === 'string') {
          try {
            const parsed = JSON.parse(p);
            return parsed.id === userId;
          } catch {
            return p === userId;
          }
        }
        return p.id === userId;
      });

      return isGoing || isMaybe;
    });
  };

  return {
    upcomingEvents: filterUserEvents(upcomingEvents),
    pastEvents: filterUserEvents(pastEvents)
  };
};

const calculateEventScore = async (event: Event,
  tfidf: TfIdf,
  eventIndex: Map<string, number>,
  vocab: string[],
  vocabIndex: Map<string, number>,
  userEvents: Event[],
  userGenres: string[],
  participants: { id: string; full_name: string; avatar_url: string; instruments?: string[]; genres?: string[] }[],
  userInstruments: string[]
): Promise<number> => {
  
  try {
    let score = 0;
    let total = 0;

    // Calculate similarity with user events
    try {
      const targetVector = createVector(eventIndex.get(event.id) || 0, vocab, vocabIndex, tfidf);
      userEvents.forEach((currEvent) => {
        const currVector = createVector(eventIndex.get(currEvent.id) || 0, vocab, vocabIndex, tfidf);
        const currCos = cosineSim(targetVector, currVector);
        if (!isNaN(currCos)) {
          total += currCos;
        }
      });
      if (userEvents.length > 0) {
        score += total / userEvents.length;
      }
    } catch (error) {
      console.error(`Error calculating similarity for event ID: ${event.id}`, error);
    }

    // Calculate genre overlap and instrument compatibility
    let sumGenres = 0;
    let sumInstruments = 0;
    let sumFriends = 0;

    for (const participant of participants) {
      try {
        // Genre overlap
        const participantGenres = participant.genres || [];
        const genreInt = participantGenres.filter((genre) => userGenres.includes(genre));
        const userUniqueGenres = userGenres.filter((genre) => !participantGenres.includes(genre));
        const participantUniqueGenres = participantGenres.filter((genre) => !userGenres.includes(genre));
        sumGenres += genreInt.length - 0.2 * (userUniqueGenres.length + participantUniqueGenres.length);

        // Instrument compatibility
        const participantInstruments = participant.instruments || [];
        let numPairs = 0;
        let pairTot = 0;
        for (const userInstrument of userInstruments) {
          for (const participantInstrument of participantInstruments) {
            if (
              instrumentCompatibility[userInstrument] &&
              instrumentCompatibility[userInstrument][participantInstrument]
            ) {
              const weight = instrumentCompatibility[userInstrument][participantInstrument];
              pairTot += weight;
              numPairs++;
            }
          }
        }
        sumInstruments += numPairs > 0 ? pairTot / numPairs : 0;

        // Friend overlap
        try {
          const participantEventsTemp = await fetchEventsForUser(participant.id);
          const participantEvents = [...participantEventsTemp.upcomingEvents, ...participantEventsTemp.pastEvents];
          const friendInt = participantEvents.filter((value) => userEvents.some(e => e.id === value.id));
          const denom = Math.max(participantEvents.length, userEvents.length);
          if (denom > 0) {
            sumFriends += Math.sqrt(friendInt.length / denom);
          }
        } catch (error) {
          console.error(`Error fetching events for participant ID: ${participant.id}`, error);
          continue;
        }
      } catch (error) {
        console.error(`Error processing participant ID: ${participant.id}`, error);
      }
    }

    // Aggregate scores
    score += participants.length > 0 ? sumGenres / participants.length : 0;
    score += participants.length > 0 ? sumInstruments / participants.length : 0;
    score += participants.length > 0 ? sumFriends / participants.length : 0;

    console.log(`Score components for "${event.title}":`, {
      totalScore: score
    });
    return score;
    
  } catch (error) {
    console.error(`Error calculating score for event ID: ${event.id}`, error);
    return 0; // Fallback score
  }
}

export default function EventsScreen({ onOpenEvent, onCreateEvent }: EventsScreenProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; date: string; start_time: string; image: string }>>([])
  const [isSearching, setIsSearching] = useState(false)

  const [events, setEvents] = useState<{
    upcoming: Array<Event>;
    past: Array<Event>;
  }>({ upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRsvps, setUserRsvps] = useState<{ [eventId: string]: string }>({});

  const allEvents = useMemo(() => [...events.upcoming, ...events.past], [events]);

  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ genres: string[], instruments: string[] }>({ genres: [], instruments: [] });
  
  const userEvents = useMemo(() => {
    if (!user) return [];
    
    return allEvents.filter(event => {
      // Check if user is in going participants
      const isGoing = event.participants_going?.some((p: any) => {
        if (typeof p === 'string') {
          try {
            const parsed = JSON.parse(p);
            return parsed.id === user.id;
          } catch {
            return p === user.id;
          }
        }
        return p.id === user.id;
      });

      // Check if user is in maybe participants
      const isMaybe = event.participants_maybe?.some((p: any) => {
        if (typeof p === 'string') {
          try {
            const parsed = JSON.parse(p);
            return parsed.id === user.id;
          } catch {
            return p === user.id;
          }
        }
        return p.id === user.id;
      });

      return isGoing || isMaybe;
    });
  }, [allEvents, user]);
  
  const [eventToParticipant, setEventToParticipant] = useState<Record<string, any[]>>({});

  const newTfIdf = new TfIdf();

  // Format date to a readable string
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE M/d'); // e.g., "Monday 5/15"
    } catch (e) {
      return '';
    }
  };

  // Fetch user RSVPs
  useEffect(() => {
    const fetchUserRsvps = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Get all events where the user is a participant
        const { data: events, error } = await supabase
          .from('events')
          .select('id, participants_going, participants_maybe');

        if (error) throw error;

        const rsvps: { [eventId: string]: string } = {};

        events?.forEach(event => {
          // Check if user is in going participants
          const isGoing = event.participants_going?.some((p: any) => {
            if (typeof p === 'string') {
              try {
                const parsed = JSON.parse(p);
                return parsed.id === user.id;
              } catch {
                return p === user.id;
              }
            }
            return p.id === user.id;
          });

          // Check if user is in maybe participants
          const isMaybe = event.participants_maybe?.some((p: any) => {
            if (typeof p === 'string') {
              try {
                const parsed = JSON.parse(p);
                return parsed.id === user.id;
              } catch {
                return p === user.id;
              }
            }
            return p.id === user.id;
          });

          if (isGoing) {
            rsvps[event.id] = 'going';
          } else if (isMaybe) {
            rsvps[event.id] = 'maybe';
          }
        });

        setUserRsvps(rsvps);
      } catch (error) {
        console.error('Error fetching user RSVPs:', error);
      }
    };

    fetchUserRsvps();
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('genres, instruments')
        .eq('id', user.id)
        .single();
        
      if (!error && profileData) {
        setUserProfile(profileData);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const now = new Date().toISOString();
        
        // Fetch upcoming events (start_time >= now)
        const { data: upcomingData , error: upcomingError } = await supabase
          .from('events')
          .select('*')
          .gte('start_time', now)
          .order('start_time', { ascending: true });

        // Fetch past events (start_time < now)
        const { data: pastData, error: pastError } = await supabase
          .from('events')
          .select('*')
          .lt('start_time', now)
          .order('start_time', { ascending: false })
          .limit(10); // Only get the 10 most recent past events

        if (upcomingError || pastError) {
          throw new Error(upcomingError?.message || pastError?.message || 'Failed to fetch events');
        }

        // intitialize TF-IDF

        const tfidf = new TfIdf();
      
        // Add all events' name and description
        allEvents.forEach((event) => {
          if (!event.title || !event.description) {
            throw new Error(`Missing title or description for event ID: ${event.id}`);
          }
          tfidf.addDocument(`${event.title} ${event.description}`);
        });

        // Create event index
        let eventIndex: Map<string, number>;
        eventIndex = new Map(allEvents.map((event, idx) => [event.id, idx]));
      
        // Build vocabulary
        let vocabSet = new Set<string>();
        allEvents.forEach((_, i) => {
          tfidf.tokenize(tfidf.documents[i]).forEach((word: string) => vocabSet.add(word));
        });

        // Create vocabulary and index
        let vocab: string[];
        let vocabIndex: Map<string, number>;
        
        vocab = Array.from(vocabSet);
        vocabIndex = new Map(vocab.map((word, idx) => [word, idx]));


        const eventsWithScores: Event[] = await Promise.all(
          (upcomingData || []).map(async (event) => ({
            id: event.id,
            title: event.title,
            start_time: event.start_time,
            date: formatEventDate(event.start_time),
            end_time: event.end_time,
            location: event.location,
            description: event.description,
            image: event.image_url || "/placeholder.svg",
            participants_going: event.participants_going || [],
            participants_maybe: event.participants_maybe || [],
            score: await calculateEventScore(
              event,
              tfidf,
              eventIndex,
              vocab,
              vocabIndex,
              userEvents,
              userProfile.genres,
              [...(event.participants_going || []), ...(event.participants_maybe || [])],
              userProfile.instruments
            )
          }))
        );

        setEvents({
          upcoming: eventsWithScores.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
          past: (pastData || []).map(event => ({
            id: event.id,
            title: event.title,
            start_time: event.start_time,
            end_time: (event.end_time ?? null),
            location: event.location,
            description: event.description,
            date: formatEventDate(event.start_time),
            image: event.image_url || "/placeholder.svg",
            participants_going: event.participants_going || [],
            participants_maybe: event.participants_maybe || []
          }))
        });
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription
    const subscription = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents(); // Refresh events when there are changes
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);


  // Search events function
  const searchEvents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setSearchResults(
        (data || []).map(event => ({
          ...event,
          date: formatEventDate(event.start_time),
          image: event.image_url || "/placeholder.svg"
        }))
      );
    } catch (err) {
      console.error('Error searching events:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchEvents(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white lg:min-h-0 lg:h-screen lg:overflow-hidden">
      <header className="p-4 md:p-6 border-b flex flex-col gap-4 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            Events <span className="ml-1">🎵</span>
          </h1>
          <Button className="bg-[#ffac6d] hover:bg-[#fdc193] text-black" onClick={onCreateEvent}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-10 lg:overflow-y-auto lg:h-[calc(100vh-80px)]">
        {/* Search Results */}
        {searchQuery && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Search Results</h2>
            {isSearching ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-lg text-gray-500">No events found matching "{searchQuery}"</p>
            ) : (
              <div className="relative">
                <div className="overflow-x-auto pb-4 hide-scrollbar">
                  <div className="flex space-x-6">
                    {searchResults.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[320px] bg-white"
                        onClick={() => onOpenEvent(event.id)}
                      >
                        <div className="relative">
                          <Image
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            width={280}
                            height={160}
                            className="w-full h-48 object-cover"
                          />
                          {userRsvps[event.id] && (
                            <span
                              className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                                userRsvps[event.id] === 'going'
                                  ? 'text-green-700 bg-green-100'
                                  : 'text-yellow-700 bg-yellow-100'
                              }`}
                            >
                              {userRsvps[event.id] === 'going' ? '✅ Going' : '🤔 Maybe'}
                            </span>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3">
                            <div className="font-bold text-lg">{event.title}</div>
                            <div className="text-base text-gray-500">{event.date}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show Past and Upcoming sections only when not searching */}
        {!searchQuery && (
          <>
            {/* Past Events Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Post Games 👀</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
              ) : events.past.length === 0 ? (
                <p className="text-lg text-gray-500">No past events yet</p>
              ) : (
                <div className="relative">
                  <div className="overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex space-x-6">
                      {events.past.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[320px] bg-white"
                          onClick={() => onOpenEvent(event.id)}
                        >
                          <div className="relative">
                            <Image
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              width={280}
                              height={160}
                              className="w-full h-48 object-cover"
                            />
                            {/* RSVP Status Badge for Past Events */}
                            {userRsvps[event.id] && (
                              <span
                                className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                                  userRsvps[event.id] === 'going'
                                    ? 'text-green-700 bg-green-100'
                                    : 'text-yellow-700 bg-yellow-100'
                                }`}
                              >
                                {userRsvps[event.id] === 'going' ? '✅ Attended' : '🤔 Was Interested'}
                              </span>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3">
                              <div className="font-bold text-lg">{event.title}</div>
                              <div className="text-base text-gray-500">{event.date}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Events Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Upcoming!</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
              ) : events.upcoming.length === 0 ? (
                <p className="text-lg text-gray-500">No upcoming events. Create one to get started!</p>
              ) : (
                <div className="relative">
                  <div className="overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex space-x-6">
                      {events.upcoming.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-[320px] bg-white"
                          onClick={() => onOpenEvent(event.id)}
                        >
                          <div className="relative">
                            <Image
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              width={280}
                              height={160}
                              className="w-full h-48 object-cover"
                            />
                            {/* RSVP Status Badge for Upcoming Events */}
                            {userRsvps[event.id] && (
                              <span
                                className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                                  userRsvps[event.id] === 'going'
                                    ? 'text-green-700 bg-green-100'
                                    : 'text-yellow-700 bg-yellow-100'
                                }`}
                              >
                                {userRsvps[event.id] === 'going' ? '✅ Going' : '🤔 Maybe'}
                              </span>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-3">
                              <div className="font-bold text-lg">{event.title}</div>
                              <div className="text-base text-gray-500">{event.date}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="h-16 lg:hidden">{/* Spacer for mobile nav */}</div>
    </div>
  )
}

