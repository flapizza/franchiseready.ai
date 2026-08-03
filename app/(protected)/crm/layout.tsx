import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  children: ReactNode;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/crm",
  },
  {
    label: "Candidates",
    href: "/crm",
  },
  {
    label: "Pipeline",
    href: "/crm/pipeline",
  },
  {
    label: "Tasks",
    href: "/crm/tasks",
  },
  {
    label: "Brands",
    href: "/crm/brands",
  },
  {
    label: "Reports",
    href: "/crm/reports",
  },
];

export default function CrmLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="sticky top-0 h-screen w-72 border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold">
              FranchiseReady
            </h1>

            <p className="text-sm text-gray-500">
              Consultant CRM
            </p>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="flex-1">
          {children}
        </section>
      </div>
    </div>
  );
}