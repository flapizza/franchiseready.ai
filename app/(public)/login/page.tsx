import Link from "next/link";
import { LoginForm } from "@/feature/auth/components/login-form";
import { AuthShell } from "@/feature/auth/components/auth-shell";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to FranchiseReady AI."
      footer={<><span>New here? </span><Link href={AUTH_ROUTES.signup} className="font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Create an account</Link></>}
    >
      <LoginForm />
      <Link href={AUTH_ROUTES.forgotPassword} className="mt-5 inline-block text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Forgot your password?</Link>
    </AuthShell>
  );
}
