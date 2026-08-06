"use client";

import { useState } from "react";

import { CandidateWorkspaceTabs } from "./CandidateWorkspaceTabs";

type Tab =
  | "overview"
  | "discovery"
  | "brands"
  | "activity"
  | "documents";

type Props = {
  overview: React.ReactNode;
  discovery: React.ReactNode;
  brands: React.ReactNode;
  activity: React.ReactNode;
  documents: React.ReactNode;
};

export function CandidateWorkspaceClient({
  overview,
  discovery,
  brands,
  activity,
  documents,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="space-y-8">
      <CandidateWorkspaceTabs
  active={tab}
  onChangeAction={setTab}
/>

      {tab === "overview" && overview}

      {tab === "discovery" && discovery}

      {tab === "brands" && brands}

      {tab === "activity" && activity}

      {tab === "documents" && documents}
    </div>
  );
}