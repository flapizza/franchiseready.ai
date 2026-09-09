"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicEnvironment } from "@/lib/env";
import type { ActionResult } from "@/feature/auth/types/actions";
import { changePasswordSchema, readFormData } from "@/feature/auth/utils/validation";
import { validationFailure } from "@/feature/auth/utils/errors";

export async function changePassword(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  let changed = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user?.email || user.is_anonymous) return { status: "error", message: "Sign in to change your password." };
    const parsed = changePasswordSchema.safeParse(readFormData(formData));
    if (!parsed.success) return validationFailure(parsed.error.flatten().fieldErrors);

    // Isolate credential verification from browser cookies. Identity always comes
    // from the authenticated user, never an email or user ID supplied by the form.
    const env = getPublicEnvironment();
    const verifier = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const verified = await verifier.auth.signInWithPassword({ email: user.email, password: parsed.data.currentPassword });
    if (verified.error || verified.data.user?.id !== user.id) {
      if (verified.data.session) await verifier.auth.signOut({ scope: "local" });
      return { status: "error", message: "We could not verify your current password. Please try again.", fieldErrors: { currentPassword: ["Check your current password."] } };
    }
    try {
      const updated = await verifier.auth.updateUser({ password: parsed.data.password, current_password: parsed.data.currentPassword });
      if (updated.error) return { status: "error", message: "We could not change your password. Use a different password that meets the password policy and try again." };
      changed = true;
    } finally {
      // Supabase revokes refresh tokens; existing access JWTs may live until expiry.
      await verifier.auth.signOut({ scope: changed ? "global" : "local" });
    }
    const signedOut = await supabase.auth.signOut({ scope: "local" });
    if (signedOut.error) return { status: "success", message: "Your password has been updated. Continue to FranGroove and sign in with your new password if asked." };
  } catch {
    if (!changed) return { status: "error", message: "We could not change your password. Please try again." };
    return { status: "success", message: "Your password has been updated. Continue to FranGroove and sign in with your new password if asked." };
  }
  redirect("/login?password=updated");
}
