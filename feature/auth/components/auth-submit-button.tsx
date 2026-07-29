"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  children: string;
  pendingLabel: string;
};

export function AuthSubmitButton({ children, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
