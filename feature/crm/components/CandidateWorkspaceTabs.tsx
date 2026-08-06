"use client";

type WorkspaceTab =
  | "overview"
  | "discovery"
  | "brands"
  | "activity"
  | "documents";

type Props = {
  active: WorkspaceTab;
  onChangeAction: (tab: WorkspaceTab) => void;
};

const tabs: {
  id: WorkspaceTab;
  label: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "discovery",
    label: "Discovery",
  },
  {
    id: "brands",
    label: "Brand Strategy",
  },
  {
    id: "activity",
    label: "Activity",
  },
  {
    id: "documents",
    label: "Documents",
  },
];

export function CandidateWorkspaceTabs({
  active,
  onChangeAction,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeAction(tab.id)}
            className={
              active === tab.id
                ? "rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                : "rounded-xl px-5 py-3 font-medium text-slate-600 hover:bg-slate-100"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}