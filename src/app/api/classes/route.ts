import { createServerSupabase } from "@/lib/supabase/server";
import { ERRORS } from "@/lib/constants";
import { NextResponse } from "next/server";

/** GET /api/classes — List the organizer's classes */
export async function GET() {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERRORS.AUTH_REQUIRED }, { status: 401 });
    }

    const { data: classes, error } = await supabase
      .from("classes")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ classes });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}

/** POST /api/classes — Create a new class */
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERRORS.AUTH_REQUIRED }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: ERRORS.CLASS_TITLE_REQUIRED },
        { status: 400 }
      );
    }

    const { data: newClass, error } = await supabase
      .from("classes")
      .insert({ owner_id: user.id, title, description: description || null })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch {
    return NextResponse.json({ error: ERRORS.UNKNOWN }, { status: 500 });
  }
}
