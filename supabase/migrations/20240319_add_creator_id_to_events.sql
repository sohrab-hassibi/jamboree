-- Add creator_id column to events table
ALTER TABLE events ADD COLUMN creator_id UUID REFERENCES auth.users(id);

-- Update existing events to have a default creator if needed
-- You can update this with a specific user ID if desired
UPDATE events SET creator_id = (SELECT id FROM auth.users LIMIT 1) WHERE creator_id IS NULL; 