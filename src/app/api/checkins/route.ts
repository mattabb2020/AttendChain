import { createAdminSupabase } from "@/lib/supabase/server";
import { createRouteClient } from "@/lib/supabase/route-client";
import { validateQrToken } from "@/lib/qr";
import { generateRecordHash } from "@/lib/hash";
import { recordOnChain } from "@/lib/stellar";
import { QR_SECRET, ERRORS, APP_URL } from "@/lib/constants";
import { NextResponse } from "next/server";
import type { CheckinResponse } from "@/types";

/**
 * POST /api/checkins — Check-in endpoint (requires authenticated student).
 *
 * Flow:
 * 1. Verify student is authenticated
 * 2. Validate QR token (HMAC + slot + expiry)
 * 3. Verify session is OPEN
 * 4. Create attendee record linked to student's user_id
 * 5. Compute recordHash
 * 6. Insert checkin as PENDING
 * 7. Submit to Stellar → update to SUCCESS/FAILED
 */
export async function POST(request: Request) {
  try {
    const { qrToken } = await request.json();

    // 1. Verify student is authenticated
    const supabase = createRouteClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: ERRORS.AUTH_REQUIRED },
        { status: 401 }
      );
    }

    if (user.user_metadata?.role !== "student") {
      return NextResponse.json(
        { error: "Solo estudiantes pueden registrar asistencia." },
        { status: 403 }
      );
    }

    const studentName = user.user_metadata?.name || user.email || "Estudiante";

    if (!qrToken) {
      return NextResponse.json(
        { error: ERRORS.QR_INVALID },
        { status: 400 }
      );
    }

    // 2. Validate QR token
    const payload = validateQrToken(qrToken, QR_SECRET);
    if (!payload) {
      return NextResponse.json(
        { error: ERRORS.QR_EXPIRED },
        { status: 400 }
      );
    }

    const trustedSessionId = payload.sid;

    // 3. Verify session is still OPEN
    const admin = createAdminSupabase();
    const { data: session, error: sessionError } = await admin
      .from("sessions")
      .select("id, status")
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

    // Check if student already checked in to this session
    const { data: existingAttendee } = await admin
      .from("attendees")
      .select("id")
      .eq("session_id", trustedSessionId)
      .eq("user_id", user.id)
      .single();

    if (existingAttendee) {
      return NextResponse.json(
        { error: "Ya registraste tu asistencia en esta sesión." },
        { status: 409 }
      );
    }

    // 4. Create attendee record linked to user
    const { data: attendee, error: attendeeError } = await admin
      .from("attendees")
      .insert({
        session_id: trustedSessionId,
        display_name: studentName,
        user_id: user.id,
      })
      .select()
      .single();

    if (attendeeError) throw attendeeError;

    // 5. Compute record hash
    const timestamp = Date.now();
    const recordHash = generateRecordHash(
      trustedSessionId,
      attendee.id,
      timestamp
    );

    // 6. Insert checkin as PENDING
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

    // 7. Submit to Stellar and wait
    let txHash: string | null = null;
    let onchainStatus: "PENDING" | "SUCCESS" | "FAILED" = "PENDING";

    try {
      const result = await recordOnChain(recordHash, trustedSessionId, timestamp);
      txHash = result.txHash;
      onchainStatus = "SUCCESS";

      await admin
        .from("checkins")
        .update({ onchain_status: "SUCCESS", tx_hash: txHash })
        .eq("id", checkin.id);
    } catch (err) {
      console.error("On-chain recording failed:", err instanceof Error ? err.message : "Unknown error");
      onchainStatus = "FAILED";

      await admin
        .from("checkins")
        .update({ onchain_status: "FAILED" })
        .eq("id", checkin.id);
    }

    const response: CheckinResponse = {
      checkinId: checkin.id,
      recordHash,
      onchain: { status: onchainStatus, txHash },
      verifyUrl: `${APP_URL}/verify/${recordHash}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Checkin error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { error: ERRORS.CHECKIN_FAILED },
      { status: 500 }
    );
  }
}
