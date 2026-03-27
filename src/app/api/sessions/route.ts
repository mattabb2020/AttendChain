import { createServerSupabase } from "@/lib/supabase/server";
import { ERRORS, DEFAULT_QR_ROTATION_SEC } from "@/lib/constants";
import { NextResponse } from "next/server";

/** GET /api/sessions — Get the organizer's active (OPEN) session */
export async function GET() {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERRORS.AUTH_REQUIRED }, { status: 401 });
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .select("*, classes(title)")
      .eq("owner_id", user.id)
      .eq("status", "OPEN")
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: ERRORS.SESSION_NOT_FOUND },
        { status: 404 }
      );
    }

    // Count attendees for the active session
    const { count } = await supabase
      .from("checkins")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id);

    return NextResponse.json({ session, attendeeCount: count || 0 });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}

/** POST /api/sessions — Open a new attendance session */
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERRORS.AUTH_REQUIRED }, { status: 401 });
    }

    const { classId, qrRotationSeconds } = await request.json();

    if (!classId) {
      return NextResponse.json(
        { error: "Seleccioná una clase." },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        class_id: classId,
        owner_id: user.id,
        status: "OPEN",
        qr_rotation_seconds: qrRotationSeconds || DEFAULT_QR_ROTATION_SEC,
      })
      .select()
      .single();

    if (error) {
      // Unique index violation means there's already an open session
      if (error.code === "23505") {
        return NextResponse.json(
          { error: ERRORS.SESSION_ALREADY_OPEN },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}

/** PATCH /api/sessions — Close the active session */
export async function PATCH() {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERRORS.AUTH_REQUIRED }, { status: 401 });
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .update({ status: "CLOSED", closed_at: new Date().toISOString() })
      .eq("owner_id", user.id)
      .eq("status", "OPEN")
      .select()
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: ERRORS.SESSION_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}
