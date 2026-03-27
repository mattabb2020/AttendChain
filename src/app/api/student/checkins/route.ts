import { createAdminSupabase } from "@/lib/supabase/server";
import { createRouteClient } from "@/lib/supabase/route-client";
import { ERRORS } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/student/checkins — List the authenticated student's check-ins */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERRORS.AUTH_REQUIRED }, { status: 401 });
    }

    const admin = createAdminSupabase();

    const { data: checkins, error } = await admin
      .from("checkins")
      .select(`
        id,
        record_hash,
        onchain_status,
        tx_hash,
        created_at,
        attendees!inner (
          display_name,
          user_id,
          sessions!inner (
            id,
            opened_at,
            classes (title)
          )
        )
      `)
      .eq("attendees.user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ checkins: checkins || [] });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}
