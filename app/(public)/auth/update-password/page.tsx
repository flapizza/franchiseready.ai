import { AuthShell } from "@/feature/auth/components/auth-shell";
import { UpdatePasswordForm } from "@/feature/auth/components/update-password-form";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasRecentRecoveryClaim } from "@/feature/auth/utils/recovery-session";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  let valid = false;
  if (!(await searchParams).error) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      const claims = await supabase.auth.getClaims();
      valid = !error && !claims.error && !!user && hasRecentRecoveryClaim(claims.data?.claims, user.id);
    } catch { /* Invalid sessions fail closed. */ }
  }
  return (
    <AuthShell
      title="Choose a new password"
      description="Use a new password you have not used elsewhere."
    >
      {valid ? <UpdatePasswordForm /> : <div className="space-y-4"><p role="alert">This recovery link is invalid or has expired. Request a new link and open it in the same browser where you requested it.</p><Link className="font-semibold text-brand underline" href="/forgot-password">Request a new recovery link</Link></div>}
    </AuthShell>
  );
}
