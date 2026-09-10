"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SignOutButton } from "@/feature/auth/components/sign-out-button";
import type { WorkspacePresentation } from "../models/WorkspacePresentation";
import { Sidebar } from "./Sidebar";

export function MobileWorkspaceHeader({ presentation }: { presentation: WorkspacePresentation }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  return <>
    <details ref={menu} className="relative" onToggle={(event) => setOpen(event.currentTarget.open)} onKeyDown={(event) => {
      if (event.key === "Escape") {
        closeMenu();
        menu.current?.querySelector("summary")?.focus();
      }
    }}>
      <summary className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">Menu</summary>
      <div className="absolute -left-4 top-full z-50 mt-3 h-[min(640px,70dvh)] shadow-xl" onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) closeMenu();
      }}>
        {open && <Sidebar presentation={presentation} />}
      </div>
    </details>
    <Link href="/crm" className="text-sm font-bold text-slate-900">FranGroove</Link>
    <SignOutButton />
  </>;
}
