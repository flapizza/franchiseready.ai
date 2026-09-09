import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/feature/auth/components/change-password-form";

export default async function SecurityPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.is_anonymous) redirect("/login?next=%2Fsettings%2Fsecurity");
  return <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
    <h1 className="text-3xl font-bold text-ink">Security</h1>
    <section aria-labelledby="password-heading" className="mt-8 rounded-xl border border-border bg-white p-6">
      <h2 id="password-heading" className="mb-5 text-xl font-semibold text-ink">Password</h2>
      <ChangePasswordForm />
    </section>
  </main>;
}
