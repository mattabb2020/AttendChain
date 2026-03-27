import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

/**
 * Create a Supabase client from a Route Handler request.
 * Reads cookies directly from the request instead of next/headers.
 * This works reliably in API route handlers on Vercel.
 */
export function createRouteClient(request: NextRequest | Request) {
  const req = request as NextRequest;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies?.getAll?.() || [];
        },
        setAll() {
          // Can't set cookies in route handlers this way
        },
      },
    }
  );
}
