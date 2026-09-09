"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePassword } from "@/feature/auth/actions/password-reset";
import { AuthFormError } from "@/feature/auth/components/auth-form-error";
import { AuthSubmitButton } from "@/feature/auth/components/auth-submit-button";
import { initialActionResult } from "@/feature/auth/types/actions";

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, initialActionResult);
  if (state.status === "success") return <div className="space-y-4"><p role="status">{state.message}</p><Link href="/crm" className="font-semibold text-brand underline">Continue to FranGroove</Link></div>;

  return (
    <form action={action} className="space-y-4" noValidate>
      <AuthFormError messages={state.status === "error" ? [state.message] : undefined} />
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(state.fieldErrors?.password?.length)} aria-describedby={state.fieldErrors?.password ? "password-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <AuthFormError id="password-error" messages={state.fieldErrors?.password} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-ink">Confirm new password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={Boolean(state.fieldErrors?.confirmPassword?.length)} aria-describedby={state.fieldErrors?.confirmPassword ? "confirm-password-error" : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <AuthFormError id="confirm-password-error" messages={state.fieldErrors?.confirmPassword} />
      </div>
      <p className="text-sm text-muted">Use 12–72 characters (at most 72 bytes). You will sign in again with your new password.</p>
      <AuthSubmitButton pendingLabel="Updating password…">Update Password</AuthSubmitButton>
    </form>
  );
}
