-- =============================================
-- AttendChain - Database Schema
-- =============================================
-- Run this in Supabase SQL Editor to set up the database.

-- 1. Classes (a course or group the organizer manages)
CREATE TABLE classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL CHECK (char_length(title) >= 3),
  description text,
  created_at timestamptz DEFAULT now()
);

-- 2. Sessions (an attendance session — OPEN or CLOSED)
CREATE TABLE sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES classes(id) NOT NULL,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  qr_rotation_seconds int NOT NULL DEFAULT 30,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Only one OPEN session per organizer at a time
CREATE UNIQUE INDEX idx_sessions_one_open_per_owner
  ON sessions (owner_id) WHERE status = 'OPEN';

-- 3. Attendees (a student who joined a session)
CREATE TABLE attendees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES sessions(id) NOT NULL,
  display_name text NOT NULL CHECK (char_length(display_name) >= 1),
  created_at timestamptz DEFAULT now()
);

-- 4. Check-ins (the attendance record — gets anchored on-chain)
CREATE TABLE checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES sessions(id) NOT NULL,
  attendee_id uuid REFERENCES attendees(id) NOT NULL,
  record_hash text NOT NULL UNIQUE,
  onchain_status text NOT NULL DEFAULT 'PENDING'
    CHECK (onchain_status IN ('PENDING', 'SUCCESS', 'FAILED')),
  tx_hash text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
-- NOTE: API routes use the service_role key (bypasses RLS).
-- These policies are for defense-in-depth and direct client access.

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Classes: organizer can CRUD their own classes
CREATE POLICY "classes_owner_all" ON classes
  FOR ALL USING (auth.uid() = owner_id);

-- Sessions: organizer can CRUD their own sessions
CREATE POLICY "sessions_owner_all" ON sessions
  FOR ALL USING (auth.uid() = owner_id);

-- Attendees: anyone can read (needed for dashboard), organizer inserts via API
CREATE POLICY "attendees_read_all" ON attendees
  FOR SELECT USING (true);

-- Checkins: anyone can read (needed for verify page), inserts via API
CREATE POLICY "checkins_read_all" ON checkins
  FOR SELECT USING (true);
