"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/feature/auth/actions/password-reset";
import { AuthFormError } from "@/feature/auth/components/auth-form-error";
import { AuthSubmitButton } from "@/feature/auth/components/auth-submit-button";
import { initialActionResult } from "@/feature/auth/types/actions";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialActionResult);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.status === "success" ? <p role="status" className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-ink">{state.message}</p> : null}
      <AuthFormError messages={state.status === "error" ? [state.message] : undefined} />
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(state.fieldErrors?.email?.length)} aria-describedby={state.fieldErrors?.email ? "email-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <AuthFormError id="email-error" messages={state.fieldErrors?.email} />
      </div>
      <AuthSubmitButton pendingLabel="Sending instructions…">Send reset instructions</AuthSubmitButton>
    </form>
  );
}
