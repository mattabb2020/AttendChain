import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { generateQrToken, generateShortCode } from "@/lib/qr";
import { QR_SECRET, ERRORS } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * GET /api/sessions/[id]/qr — Generate a fresh QR token for the session.
 *
 * Returns a short code (e.g. "AC:k7Hm9xPq") that the QR encodes.
 * The full HMAC-signed token is stored server-side and resolved
 * via /api/qr/resolve when the student scans.
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

    if (user.user_metadata?.role !== "organizer") {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
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

    // Generate short code and store mapping in DB
    const shortCode = generateShortCode();
    const admin = createAdminSupabase();

    // Clean up old codes for this session, then insert new one
    await admin.from("qr_codes").delete().eq("session_id", session.id);
    await admin.from("qr_codes").insert({
      code: shortCode,
      session_id: session.id,
      full_token: token,
      expires_at: new Date(expiresAt * 1000).toISOString(),
    });

    // Count current attendees
    const { count } = await supabase
      .from("checkins")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id);

    return NextResponse.json({
      qrCode: `AC:${shortCode}`,
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
