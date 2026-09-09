"use server";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/feature/auth/types/actions";
import { createAuthCallbackUrl } from "@/feature/auth/utils/callback-urls";
import { authFailure, authSuccess, validationFailure } from "@/feature/auth/utils/errors";
import { hasRecentRecoveryClaim } from "@/feature/auth/utils/recovery-session";
import {
  passwordResetRequestSchema,
  readFormData,
  updatePasswordSchema,
} from "@/feature/auth/utils/validation";

export async function requestPasswordReset(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = passwordResetRequestSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return validationFailure(parsed.error.flatten().fieldErrors);
  }

  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: createAuthCallbackUrl(AUTH_ROUTES.updatePassword),
    });
  } catch {
    // Transport errors must not reveal account existence or contain credentials.
  }

  return authSuccess(
    "If an account exists for that email, we sent password reset instructions.",
  );
}

export async function updatePassword(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let changed = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data, error: claimsError } = await supabase.auth.getClaims();
    if (userError || claimsError || !user || !hasRecentRecoveryClaim(data?.claims, user.id)) return authFailure("updatePassword");
    const parsed = updatePasswordSchema.safeParse(readFormData(formData));
    if (!parsed.success) {
      return validationFailure(parsed.error.flatten().fieldErrors);
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return authFailure("updatePassword");
    }

    changed = true;
    const signedOut = await supabase.auth.signOut({ scope: "global" });
    if (signedOut.error) return authSuccess("Your password has been updated. Continue to FranGroove and sign in with your new password if asked.");
  } catch {
    if (!changed) return authFailure("updatePassword");
    return authSuccess("Your password has been updated. Continue to FranGroove and sign in with your new password if asked.");
  }
  redirect("/login?password=updated");
}
