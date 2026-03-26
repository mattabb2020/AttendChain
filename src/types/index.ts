// =============================================
// Database types (mirror supabase/schema.sql)
// =============================================

export interface DbClass {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface DbSession {
  id: string;
  class_id: string;
  owner_id: string;
  status: "OPEN" | "CLOSED";
  qr_rotation_seconds: number;
  opened_at: string;
  closed_at: string | null;
}

export interface DbAttendee {
  id: string;
  session_id: string;
  display_name: string;
  created_at: string;
}

export interface DbCheckin {
  id: string;
  session_id: string;
  attendee_id: string;
  record_hash: string;
  onchain_status: "PENDING" | "SUCCESS" | "FAILED";
  tx_hash: string | null;
  created_at: string;
}

// =============================================
// API types
// =============================================

export interface QrTokenPayload {
  v: number;        // version
  sid: string;       // sessionId
  slot: number;      // time slot = floor(epoch / rotationSec)
  nonce: string;     // unique per token, anti-replay
  exp: number;       // expiration timestamp (seconds)
  sig: string;       // HMAC-SHA256 signature
}

export interface CheckinRequest {
  sessionId: string;
  displayName: string;
  qrToken: string;   // base64url-encoded QrTokenPayload
}

export interface CheckinResponse {
  checkinId: string;
  recordHash: string;
  onchain: {
    status: "PENDING" | "SUCCESS" | "FAILED";
    txHash: string | null;
  };
  verifyUrl: string;
}

export interface VerifyResponse {
  exists: boolean;
  recordHash: string;
  onchainStatus: "PENDING" | "SUCCESS" | "FAILED" | null;
  txHash: string | null;
  stellarLabUrl: string | null;
  timestamp: string | null;
}

export interface SessionWithClass extends DbSession {
  classes: { title: string };
}
