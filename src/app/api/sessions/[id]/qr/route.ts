import { createServerSupabase } from "@/lib/supabase/server";
import { generateQrToken } from "@/lib/qr";
import { QR_SECRET, APP_URL, ERRORS } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * GET /api/sessions/[id]/qr — Generate a fresh QR token for the session.
 *
 * Returns the HMAC-signed token (rotates every N seconds) and the URL
 * that the QR code should encode. Students scan this QR to check in.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERRORS.AUTH_REQUIRED }, { status: 401 });
    }

    // Verify the session exists, is OPEN, and belongs to this organizer
    const { data: session, error } = await supabase
      .from("sessions")
      .select("*, classes(title)")
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .eq("status", "OPEN")
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: ERRORS.SESSION_NOT_FOUND },
        { status: 404 }
      );
    }

    // Generate a fresh QR token
    const { token, expiresAt } = generateQrToken(
      session.id,
      QR_SECRET,
      session.qr_rotation_seconds
    );

    // The URL that the QR code encodes — this is what students scan
    const joinUrl = `${APP_URL}/join?token=${token}`;

    // Count current attendees
    const { count } = await supabase
      .from("checkins")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id);

    return NextResponse.json({
      token,
      joinUrl,
      expiresAt,
      rotationSeconds: session.qr_rotation_seconds,
      sessionId: session.id,
      className: session.classes?.title || "",
      attendeeCount: count || 0,
    });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}
