"use server";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/feature/auth/types/actions";
import { runAuthAction } from "@/feature/auth/utils/action";
import { authFailure, authSuccess } from "@/feature/auth/utils/errors";

export async function signOut(): Promise<ActionResult> {
  const result = await runAuthAction("sign-out", async () => {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return authFailure("unexpected");
    }

    return authSuccess("Signed out successfully.");
  });

  if (result.status === "success") {
    redirect(AUTH_ROUTES.home);
  }

  return result;
}
