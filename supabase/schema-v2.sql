-- =============================================
-- AttendChain - Schema Migration v2
-- =============================================
-- Run this in Supabase SQL Editor AFTER schema.sql
-- Adds: user_id to attendees (links students to auth accounts)

-- Add user_id column to attendees (nullable for backward compat with existing data)
ALTER TABLE attendees ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Index for fast lookups by user
CREATE INDEX idx_attendees_user_id ON attendees (user_id) WHERE user_id IS NOT NULL;

-- Update RLS: students can read their own attendee records
CREATE POLICY "attendees_own_read" ON attendees
  FOR SELECT USING (auth.uid() = user_id);

-- Students can read their own checkins (via attendee link)
CREATE POLICY "checkins_own_read" ON checkins
  FOR SELECT USING (
    attendee_id IN (
      SELECT id FROM attendees WHERE user_id = auth.uid()
    )
  );
