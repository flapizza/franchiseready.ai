"use client";

import { LogOut } from "lucide-react";
import { useActionState } from "react";

import { signOut } from "@/feature/auth/actions/sign-out";
import {
  initialActionResult,
  type ActionResult,
} from "@/feature/auth/types/actions";

async function submitSignOut(): Promise<ActionResult> {
  return signOut();
}

export function SignOutButton() {
  const [state, action, pending] = useActionState(
    submitSignOut,
    initialActionResult,
  );

  return (
    <form action={action} className="flex flex-col items-end gap-1.5">
      <button
        type="submit"
        disabled={pending}
        aria-describedby={state.status === "error" ? "sign-out-error" : undefined}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut aria-hidden="true" size={16} />
        {pending ? "Signing Out..." : "Sign Out"}
      </button>

      {state.status === "error" && (
        <p id="sign-out-error" role="alert" className="max-w-52 text-right text-xs text-red-700">
          {state.message}
        </p>
      )}
    </form>
  );
}
