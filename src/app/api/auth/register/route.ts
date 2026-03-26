import { createAdminSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const validRole = role === "organizer" ? "organizer" : "student";

    const admin = createAdminSupabase();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: validRole },
    });

    if (error) {
      if (error.message.includes("already")) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese email." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: validRole,
          name,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al crear la cuenta." },
      { status: 500 }
    );
  }
}
