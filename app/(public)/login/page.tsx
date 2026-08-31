import Link from "next/link";
import { LoginForm } from "@/feature/auth/components/login-form";
import { AuthShell } from "@/feature/auth/components/auth-shell";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { enterConferenceDemo } from "@/feature/auth/actions/enter-conference-demo";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const demoAccessEnabled = isConferenceDemoAccessEnabled();
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to FranGroove AI."
      footer={<><span>New here? </span><Link href={AUTH_ROUTES.signup} className="font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Create an account</Link></>}
    >
      <LoginForm nextPath={next} />
      {demoAccessEnabled ? (
        <>
          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <span className="h-px flex-1 bg-border" />
            Development access
            <span className="h-px flex-1 bg-border" />
          </div>
          <form action={enterConferenceDemo}>
            <button
              type="submit"
              className="min-h-11 w-full rounded-lg border border-brand bg-brand-soft px-4 text-sm font-semibold text-brand transition hover:bg-brand hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Enter Conference Demo as {demoConsultant.displayName}
            </button>
          </form>
        </>
      ) : null}
      <Link href={AUTH_ROUTES.forgotPassword} className="mt-5 inline-block text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Forgot your password?</Link>
    </AuthShell>
  );
}
