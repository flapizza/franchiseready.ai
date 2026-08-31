"use client";

import { useActionState } from "react";
import { signIn } from "@/feature/auth/actions/sign-in";
import { AuthFormError } from "@/feature/auth/components/auth-form-error";
import { AuthSubmitButton } from "@/feature/auth/components/auth-submit-button";
import { initialActionResult } from "@/feature/auth/types/actions";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, action] = useActionState(signIn, initialActionResult);

  return (
    <form action={action} className="space-y-4" noValidate>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <AuthFormError messages={state.status === "error" ? [state.message] : undefined} />
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(state.fieldErrors?.email?.length)} aria-describedby={state.fieldErrors?.email ? "email-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <AuthFormError id="email-error" messages={state.fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" aria-invalid={Boolean(state.fieldErrors?.password?.length)} aria-describedby={state.fieldErrors?.password ? "password-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <AuthFormError id="password-error" messages={state.fieldErrors?.password} />
      </div>
      <AuthSubmitButton pendingLabel="Signing in…">Sign in</AuthSubmitButton>
    </form>
  );
}
