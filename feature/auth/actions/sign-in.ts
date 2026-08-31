"use server";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/feature/auth/types/actions";
import { runAuthAction } from "@/feature/auth/utils/action";
import { authFailure, authSuccess, validationFailure } from "@/feature/auth/utils/errors";
import { readFormData, signInSchema } from "@/feature/auth/utils/validation";
import { getSafeReturnPath } from "@/lib/auth/routes";

export async function signIn(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const nextPath = getSafeReturnPath(String(formData.get("next") ?? ""));
  const result = await runAuthAction("sign-in", async () => {
    const parsed = signInSchema.safeParse(readFormData(formData));
    if (!parsed.success) {
      return validationFailure(parsed.error.flatten().fieldErrors);
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return authFailure("signIn");
    }

    return authSuccess("Signed in successfully.");
  });

  if (result.status === "success") {
    redirect(nextPath || AUTH_ROUTES.home);
  }

  return result;
}
