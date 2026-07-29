"use server";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/feature/auth/types/actions";
import { runAuthAction } from "@/feature/auth/utils/action";
import { createAuthCallbackUrl } from "@/feature/auth/utils/callback-urls";
import { authFailure, authSuccess, validationFailure } from "@/feature/auth/utils/errors";
import {
  passwordResetRequestSchema,
  readFormData,
  updatePasswordSchema,
} from "@/feature/auth/utils/validation";

export async function requestPasswordReset(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return runAuthAction("request-password-reset", async () => {
    const parsed = passwordResetRequestSchema.safeParse(readFormData(formData));
    if (!parsed.success) {
      return validationFailure(parsed.error.flatten().fieldErrors);
    }

    const supabase = await createServerSupabaseClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: createAuthCallbackUrl(AUTH_ROUTES.updatePassword),
    });

    return authSuccess(
      "If an account exists for that email, we sent password reset instructions.",
    );
  });
}

export async function updatePassword(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = await runAuthAction("update-password", async () => {
    const parsed = updatePasswordSchema.safeParse(readFormData(formData));
    if (!parsed.success) {
      return validationFailure(parsed.error.flatten().fieldErrors);
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return authFailure("updatePassword");
    }

    return authSuccess("Your password has been updated.");
  });

  if (result.status === "success") {
    redirect(AUTH_ROUTES.home);
  }

  return result;
}
