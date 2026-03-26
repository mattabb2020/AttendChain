import { createAdminSupabase } from "@/lib/supabase/server";
import { validateQrToken } from "@/lib/qr";
import { generateRecordHash } from "@/lib/hash";
import { recordOnChain } from "@/lib/stellar";
import { QR_SECRET, ERRORS, APP_URL } from "@/lib/constants";
import { NextResponse } from "next/server";
import type { CheckinResponse } from "@/types";

/**
 * POST /api/checkins — The main check-in endpoint.
 *
 * Flow:
 * 1. Validate QR token (HMAC + slot + expiry)
 * 2. Verify session is OPEN
 * 3. Create attendee record
 * 4. Compute recordHash = SHA-256(sessionId | attendeeId | timestamp)
 * 5. Insert checkin row as PENDING
 * 6. Return immediately with recordHash
 * 7. In background: submit to Soroban → update status
 */
export async function POST(request: Request) {
  try {
    const { displayName, qrToken } = await request.json();

    // Validate inputs
    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: ERRORS.NAME_REQUIRED },
        { status: 400 }
      );
    }

    if (!qrToken) {
      return NextResponse.json(
        { error: ERRORS.QR_INVALID },
        { status: 400 }
      );
    }

    // 1. Validate QR token
    const payload = validateQrToken(qrToken, QR_SECRET);
    if (!payload) {
      return NextResponse.json(
        { error: ERRORS.QR_EXPIRED },
        { status: 400 }
      );
    }

    // Use sessionId from QR token (trusted, server-signed)
    const trustedSessionId = payload.sid;

    // 2. Verify session is still OPEN
    const admin = createAdminSupabase();
    const { data: session, error: sessionError } = await admin
      .from("sessions")
      .select("id, status, qr_rotation_seconds")
      .eq("id", trustedSessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: ERRORS.SESSION_NOT_FOUND },
        { status: 404 }
      );
    }

    if (session.status !== "OPEN") {
      return NextResponse.json(
        { error: ERRORS.SESSION_CLOSED },
        { status: 403 }
      );
    }

    // 3. Create attendee record
    const { data: attendee, error: attendeeError } = await admin
      .from("attendees")
      .insert({
        session_id: trustedSessionId,
        display_name: displayName.trim(),
      })
      .select()
      .single();

    if (attendeeError) throw attendeeError;

    // 4. Compute record hash
    const timestamp = Date.now();
    const recordHash = generateRecordHash(
      trustedSessionId,
      attendee.id,
      timestamp
    );

    // 5. Insert checkin as PENDING
    const { data: checkin, error: checkinError } = await admin
      .from("checkins")
      .insert({
        session_id: trustedSessionId,
        attendee_id: attendee.id,
        record_hash: recordHash,
        onchain_status: "PENDING",
      })
      .select()
      .single();

    if (checkinError) throw checkinError;

    // 6. Return immediately (don't wait for blockchain)
    const response: CheckinResponse = {
      checkinId: checkin.id,
      recordHash,
      onchain: {
        status: "PENDING",
        txHash: null,
      },
      verifyUrl: `${APP_URL}/verify/${recordHash}`,
    };

    // 7. Fire-and-forget: submit to Soroban in background
    recordOnChain(recordHash, trustedSessionId, timestamp)
      .then(async ({ txHash }) => {
        await admin
          .from("checkins")
          .update({ onchain_status: "SUCCESS", tx_hash: txHash })
          .eq("id", checkin.id);
      })
      .catch(async (err) => {
        console.error("On-chain recording failed:", err);
        await admin
          .from("checkins")
          .update({ onchain_status: "FAILED" })
          .eq("id", checkin.id);
      });

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Checkin error:", err);
    return NextResponse.json(
      { error: ERRORS.CHECKIN_FAILED },
      { status: 500 }
    );
  }
}
