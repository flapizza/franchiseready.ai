"use server";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/feature/auth/types/actions";
import { runAuthAction } from "@/feature/auth/utils/action";
import { createAuthCallbackUrl } from "@/feature/auth/utils/callback-urls";
import { authFailure, authSuccess, validationFailure } from "@/feature/auth/utils/errors";
import { readFormData, signUpSchema } from "@/feature/auth/utils/validation";

export async function signUp(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = await runAuthAction("sign-up", async () => {
    const parsed = signUpSchema.safeParse(readFormData(formData));
    if (!parsed.success) {
      return validationFailure(parsed.error.flatten().fieldErrors);
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: createAuthCallbackUrl(AUTH_ROUTES.confirm),
      },
    });

    if (error) {
      return authFailure("signUp");
    }

    return authSuccess("Check your email to confirm your account.");
  });

  if (result.status === "success") {
    redirect(AUTH_ROUTES.confirm);
  }

  return result;
}
