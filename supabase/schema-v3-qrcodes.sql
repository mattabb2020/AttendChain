-- Migration: Add qr_codes table for short QR code lookup
-- This replaces encoding full tokens in QR codes with short 8-char codes

CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(12) UNIQUE NOT NULL,
  session_id uuid REFERENCES sessions(id) NOT NULL,
  full_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_session ON qr_codes(session_id);

-- Allow authenticated users to read qr_codes (for resolve endpoint)
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read qr_codes"
  ON qr_codes FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage qr_codes"
  ON qr_codes FOR ALL
  USING (true)
  WITH CHECK (true);
