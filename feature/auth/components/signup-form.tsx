"use client";

import { useActionState } from "react";
import { signUp } from "@/feature/auth/actions/sign-up";
import { AuthFormError } from "@/feature/auth/components/auth-form-error";
import { AuthSubmitButton } from "@/feature/auth/components/auth-submit-button";
import { initialActionResult } from "@/feature/auth/types/actions";

export function SignupForm() {
  const [state, action] = useActionState(signUp, initialActionResult);

  return (
    <form action={action} className="space-y-4" noValidate>
      <AuthFormError messages={state.status === "error" ? [state.message] : undefined} />
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(state.fieldErrors?.email?.length)} aria-describedby={state.fieldErrors?.email ? "email-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <AuthFormError id="email-error" messages={state.fieldErrors?.email} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(state.fieldErrors?.password?.length)} aria-describedby={state.fieldErrors?.password ? "password-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <p className="mt-1.5 text-xs text-muted">Use at least 8 characters.</p>
        <AuthFormError id="password-error" messages={state.fieldErrors?.password} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-ink">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={Boolean(state.fieldErrors?.confirmPassword?.length)} aria-describedby={state.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <AuthFormError id="confirm-password-error" messages={state.fieldErrors?.confirmPassword} />
      </div>
      <AuthSubmitButton pendingLabel="Creating account…">Create account</AuthSubmitButton>
    </form>
  );
}
