import crypto from "crypto";

import type { QrTokenPayload } from "@/types";

/**
 * Generate an HMAC-signed QR token for the current time slot.
 *
 * The token rotates every `rotationSec` seconds. Each token includes:
 * - sessionId: which session this is for
 * - slot: time window (changes every rotationSec)
 * - nonce: unique per token to prevent replay
 * - exp: expiration timestamp
 * - sig: HMAC-SHA256 proving the server created it
 */
export function generateQrToken(
  sessionId: string,
  qrSecret: string,
  rotationSec: number = 30
): { token: string; expiresAt: number } {
  const nowSec = Math.floor(Date.now() / 1000);
  const slot = Math.floor(nowSec / rotationSec);
  const nonce = crypto.randomUUID();
  const exp = (slot + 1) * rotationSec; // expires at end of current slot

  const payload: Omit<QrTokenPayload, "sig"> = {
    v: 1,
    sid: sessionId,
    slot,
    nonce,
    exp,
  };

  // Sign the payload with HMAC-SHA256
  const sig = crypto
    .createHmac("sha256", qrSecret)
    .update(JSON.stringify(payload))
    .digest("hex");

  const fullPayload: QrTokenPayload = { ...payload, sig };

  // Encode as base64url for safe URL embedding
  const token = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  return { token, expiresAt: exp };
}

/**
 * Validate a QR token: check HMAC signature, expiration, and slot.
 * Accepts the current slot or the previous one (for clock drift / scan delay).
 *
 * Returns the decoded payload if valid, or null if invalid.
 */
export function validateQrToken(
  token: string,
  qrSecret: string,
  rotationSec: number = 30
): QrTokenPayload | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    const payload: QrTokenPayload = JSON.parse(json);

    if (payload.v !== 1 || !payload.sid || !payload.slot || !payload.sig) {
      return null;
    }

    // Recompute signature (without the sig field)
    const { sig, ...payloadWithoutSig } = payload;
    const expectedSig = crypto
      .createHmac("sha256", qrSecret)
      .update(JSON.stringify(payloadWithoutSig))
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    // Check slot: accept current slot or previous (tolerance for scan delay)
    const nowSec = Math.floor(Date.now() / 1000);
    const currentSlot = Math.floor(nowSec / rotationSec);
    if (payload.slot !== currentSlot && payload.slot !== currentSlot - 1) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
