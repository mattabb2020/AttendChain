import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { ERRORS } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/qr/resolve?code={shortCode}
 *
 * Resolves a short QR code (e.g. "k7Hm9xPq") to the full HMAC-signed token.
 * Requires authentication — only logged-in students can resolve QR codes.
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication to prevent brute-force enumeration
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: ERRORS.AUTH_REQUIRED },
        { status: 401 }
      );
    }

    const code = request.nextUrl.searchParams.get("code");

    if (!code || code.length < 4) {
      return NextResponse.json(
        { error: ERRORS.QR_INVALID },
        { status: 400 }
      );
    }

    const admin = createAdminSupabase();

    const { data: qrCode, error } = await admin
      .from("qr_codes")
      .select("full_token, expires_at")
      .eq("code", code)
      .single();

    if (error || !qrCode) {
      return NextResponse.json(
        { error: ERRORS.QR_INVALID },
        { status: 404 }
      );
    }

    // Check expiry (with some tolerance for scan delay)
    const expiresAt = new Date(qrCode.expires_at).getTime();
    const now = Date.now();
    // Allow up to 60s past expiry for tolerance
    if (now > expiresAt + 60_000) {
      return NextResponse.json(
        { error: ERRORS.QR_EXPIRED },
        { status: 410 }
      );
    }

    return NextResponse.json({ token: qrCode.full_token });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}
