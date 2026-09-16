"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import "./composer-workspace.css";

export default function ComposerWorkspace({ name, status, actions, children }: {
  name: string; status: string; actions: ReactNode; children: ReactNode;
}) {
  return <section data-campaign-composer aria-label="Campaign composer" className="composer-workspace">
    <header className="composer-topbar">
      <Link href="/crm/campaigns" className="composer-back">← Back to Marketing</Link>
      <div className="composer-identity"><p>EMAIL STUDIO</p><h1>{name || "Untitled campaign"}</h1><span role="status">{status}</span></div>
      <div className="composer-actions">{actions}</div>
    </header>
    {children}
  </section>;
}
