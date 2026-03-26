import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    const role = data.user.user_metadata?.role || "organizer";
    const name = data.user.user_metadata?.name || "";

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email, role, name },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al iniciar sesión." },
      { status: 500 }
    );
  }
}
