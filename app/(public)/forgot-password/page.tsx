import Link from "next/link";
import { ForgotPasswordForm } from "@/feature/auth/components/forgot-password-form";
import { AuthShell } from "@/feature/auth/components/auth-shell";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we’ll send reset instructions if an account exists."
      footer={<Link href={AUTH_ROUTES.login} className="font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Back to sign in</Link>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
