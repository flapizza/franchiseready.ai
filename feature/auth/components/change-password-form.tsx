"use client";

import { useActionState } from "react";
import Link from "next/link";
import { changePassword } from "@/feature/auth/actions/change-password";
import { AuthFormError } from "@/feature/auth/components/auth-form-error";
import { AuthSubmitButton } from "@/feature/auth/components/auth-submit-button";
import { initialActionResult } from "@/feature/auth/types/actions";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, initialActionResult);
  if (state.status === "success") return <div className="space-y-4"><p role="status">{state.message}</p><Link href="/crm" className="font-semibold text-brand underline">Continue to FranGroove</Link></div>;
  return <form action={action} className="max-w-md space-y-5" noValidate>
    <AuthFormError messages={state.status === "error" ? [state.message] : undefined} />
    {([
      ["currentPassword", "Current password", "current-password"],
      ["password", "New password", "new-password"],
      ["confirmPassword", "Confirm new password", "new-password"],
    ] as const).map(([name, label, autoComplete]) => <div key={name}>
      <label htmlFor={name} className="text-sm font-medium text-ink">{label}</label>
      <input id={name} name={name} type="password" autoComplete={autoComplete} required aria-invalid={Boolean(state.fieldErrors?.[name]?.length)} aria-describedby={state.fieldErrors?.[name] ? `${name}-error` : undefined} className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      <AuthFormError id={`${name}-error`} messages={state.fieldErrors?.[name]} />
    </div>)}
    <p className="text-sm text-muted">Use 12–72 characters (at most 72 bytes). After changing your password, sign in again with the new password.</p>
    <AuthSubmitButton pendingLabel="Changing password…">Change Password</AuthSubmitButton>
  </form>;
}
