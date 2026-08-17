import "server-only";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getSafeReturnPath } from "@/lib/auth/routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthenticatedUser } from "@/types/auth";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const demoUser = await getConferenceDemoUser();

  if (demoUser) {
    return demoUser;
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    return null;
  }

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };
}

export async function requireAuthenticatedUser(returnTo?: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    const params = new URLSearchParams({
      next: getSafeReturnPath(returnTo ?? null),
    });
    redirect(`${AUTH_ROUTES.login}?${params.toString()}`);
  }

  return user;
}
