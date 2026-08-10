import Link from "next/link";

import { Container } from "@/components/ui/container";

type FooterLink = {
  label: string;
  href: string;
};

type FooterGroup = {
  title: string;
  links: FooterLink[];
};

type FooterProps = {
  groups: FooterGroup[];
};

export function Footer({
  groups,
}: FooterProps) {
  return (
    <footer
      id="company"
      className="border-t border-border bg-slate-950 text-white"
    >
      <Container className="py-16">

        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground">
                F
              </div>

              <div>

                <h3 className="text-xl font-bold">
                  FranchiseReady AI
                </h3>

                <p className="text-sm text-slate-400">
                  AI Operating System for Franchise Consultants
                </p>

              </div>

            </div>

            <p className="mt-8 max-w-md leading-8 text-slate-400">
              FranchiseReady AI helps professional franchise consultants
              understand candidates faster, conduct better Discovery meetings,
              generate transparent brand recommendations, and deliver stronger
              candidates to franchisors.
            </p>

            <p className="mt-8 text-sm text-slate-500">
              Built exclusively for franchise consultants.
            </p>

          </div>

          {groups.map((group) => (
            <div key={group.title}>

              <h4 className="text-lg font-semibold">
                {group.title}
              </h4>

              <ul className="mt-6 space-y-4">

                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

              </ul>

            </div>
          ))}

        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm text-slate-500 md:flex-row">

          <p>
            © 2026 FranchiseReady AI. All rights reserved.
          </p>

          <div className="flex items-center gap-6">

            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>

          </div>

        </div>

      </Container>
    </footer>
  );
}