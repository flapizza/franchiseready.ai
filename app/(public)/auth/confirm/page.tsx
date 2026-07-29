import Link from "next/link";
import { AuthShell } from "@/feature/auth/components/auth-shell";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function ConfirmEmailPage() {
  return (
    <AuthShell
      title="Check your email"
      description="We sent a confirmation link to your email address. Open it to finish setting up your account."
      footer={<Link href={AUTH_ROUTES.login} className="font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Back to sign in</Link>}
    >
      <p className="text-sm leading-6 text-muted">If you do not see the email, check your spam folder before trying again.</p>
    </AuthShell>
  );
}
