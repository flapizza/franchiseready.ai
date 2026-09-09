import { NextResponse } from "next/server";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getSafeReturnPath } from "@/lib/auth/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnvironment } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = new URL(getPublicEnvironment().APP_URL).origin;
  const code = searchParams.get("code");
  const next = getSafeReturnPath(searchParams.get("next"));

  const response = (path: string) => {
    const result = NextResponse.redirect(new URL(path, origin));
    result.headers.set("Cache-Control", "no-store");
    result.headers.set("Referrer-Policy", "no-referrer");
    return result;
  };
  if (code && !searchParams.has("error")) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return response(next);
    } catch {
      // Do not log callback codes or provider error objects.
    }
  }

  return response(`${AUTH_ROUTES.updatePassword}?error=invalid`);
}
