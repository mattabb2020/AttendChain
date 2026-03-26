import crypto from "crypto";

/**
 * Generate the record hash — the unique "fingerprint" of a check-in.
 * This is what gets stored on the Soroban contract as tamper-evident proof.
 *
 * Formula: SHA-256(sessionId | attendeeId | timestamp)
 * The pipe character is used as separator to prevent ambiguity.
 */
export function generateRecordHash(
  sessionId: string,
  attendeeId: string,
  timestamp: number
): string {
  const data = `${sessionId}|${attendeeId}|${timestamp}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}
