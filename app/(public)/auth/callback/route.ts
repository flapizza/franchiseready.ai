import { NextResponse } from "next/server";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getSafeReturnPath } from "@/lib/auth/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeReturnPath(searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    console.error("Authentication callback exchange failed", error);
  }

  return NextResponse.redirect(new URL(AUTH_ROUTES.home, origin));
}
