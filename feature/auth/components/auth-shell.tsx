import Link from "next/link";
import type { ReactNode } from "react";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { Container } from "@/components/ui/container";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center bg-canvas py-10 sm:py-16">
      <Container className="max-w-md">
        <Link
          href={AUTH_ROUTES.home}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">F</span>
          FranGroove AI
        </Link>
        <section className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8" aria-labelledby="auth-title">
          <h1 id="auth-title" className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 text-center text-sm text-muted">{footer}</div> : null}
        </section>
      </Container>
    </main>
  );
}
