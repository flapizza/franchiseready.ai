import Link from "next/link";

type Tab = {
  label: string;
  href: string;
};

type Props = {
  candidateId: string;
  active: string;
};

export function CandidateWorkspaceTabs({
  candidateId,
  active,
}: Props) {
  const tabs: Tab[] = [
    {
      label: "Command Center",
      href: `/crm/${candidateId}`,
    },
    {
      label: "Discovery",
      href: `/crm/${candidateId}/discovery`,
    },
    {
      label: "Strategy",
      href: `/crm/${candidateId}/strategy`,
    },
    {
      label: "Referral",
      href: `/crm/${candidateId}/referral`,
    },
    {
      label: "Briefing",
      href: `/crm/${candidateId}/briefing`,
    },
    {
      label: "Timeline",
      href: `/crm/${candidateId}/timeline`,
    },
    {
      label: "Documents",
      href: `/crm/${candidateId}/documents`,
    },
    {
      label: "Financial",
      href: `/crm/${candidateId}/financial`,
    },
  ];

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <ul className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = active === tab.label;

          return (
            <li key={tab.label}>
              <Link
                href={tab.href}
                className={
                  isActive
                    ? "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                }
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}