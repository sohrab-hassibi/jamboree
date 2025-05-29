import { createClient } from '@supabase/supabase-js';
import { EventParticipant, parseParticipant, stringifyParticipant } from '../types/event';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateParticipantData() {
  console.log('Starting participant data migration...');

  try {
    // Fetch all events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, participants_going, participants_maybe');

    if (eventsError) {
      throw new Error(`Error fetching events: ${eventsError.message}`);
    }

    console.log(`Found ${events?.length || 0} events to process`);

    // Process each event
    for (const event of events || []) {
      console.log(`Processing event ${event.id}...`);

      // Process going participants
      const standardizedGoing = (event.participants_going || [])
        .map(p => parseParticipant(p))
        .filter((p): p is EventParticipant => p !== null)
        .map(p => stringifyParticipant(p));

      // Process maybe participants
      const standardizedMaybe = (event.participants_maybe || [])
        .map(p => parseParticipant(p))
        .filter((p): p is EventParticipant => p !== null)
        .map(p => stringifyParticipant(p));

      // Update the event with standardized data
      const { error: updateError } = await supabase
        .from('events')
        .update({
          participants_going: standardizedGoing,
          participants_maybe: standardizedMaybe,
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id);

      if (updateError) {
        console.error(`Error updating event ${event.id}:`, updateError);
        continue;
      }

      console.log(`Successfully updated event ${event.id}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateParticipantData(); 