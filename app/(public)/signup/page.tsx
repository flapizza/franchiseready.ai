import Link from "next/link";
import { SignupForm } from "@/feature/auth/components/signup-form";
import { AuthShell } from "@/feature/auth/components/auth-shell";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start your franchise readiness journey."
      footer={<><span>Already have an account? </span><Link href={AUTH_ROUTES.login} className="font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Sign in</Link></>}
    >
      <SignupForm />
    </AuthShell>
  );
}
