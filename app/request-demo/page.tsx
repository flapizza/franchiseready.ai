import { Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function RequestDemoPage() {
  return (
    <main className="min-h-screen bg-canvas">

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.30em] text-brand">
            Personalized Platform Demonstration
          </p>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-ink lg:text-6xl">
            See FranchiseReady AI in Action
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-muted">
            Discover how FranchiseReady AI helps professional franchise
            consultants conduct better Discovery meetings, understand
            candidates faster, generate transparent brand recommendations,
            and deliver stronger candidates to franchisors.
          </p>

        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">

          {/* Calendly */}

          <div className="rounded-3xl border border-border bg-surface p-10 shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft">
              <Calendar className="h-8 w-8 text-brand" />
            </div>

            <h2 className="mt-8 text-3xl font-bold text-ink">
              Schedule Instantly
            </h2>

            <p className="mt-6 leading-8 text-muted">
              Already know you'd like to see the platform?
              Choose a time that works for you and book
              your personalized demonstration instantly.
            </p>

            <div className="mt-8 space-y-4">

              {[
                "Mission Control",
                "Discovery Copilot",
                "Candidate 360",
                "Brand Strategy",
                "Referral Packages",
                "Live Questions & Answers",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-brand" />

                  <span>{item}</span>

                </div>
              ))}

            </div>

            <Link
              href="https://calendly.com/YOUR-CALENDLY-LINK"
              target="_blank"
              className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-4 text-center text-lg font-semibold text-brand-foreground transition hover:bg-brand-strong"
            >
              Schedule My Demo
            </Link>

          </div>

          {/* Contact */}

          <div className="rounded-3xl border border-border bg-surface p-10 shadow-xl">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft">
              <MessageSquare className="h-8 w-8 text-brand" />
            </div>

            <h2 className="mt-8 text-3xl font-bold text-ink">
              Contact Our Team
            </h2>

            <p className="mt-6 leading-8 text-muted">
              Have questions before scheduling?
              Send us a message and we'll personally
              reach out to discuss your consulting practice.
            </p>

            <form className="mt-8 space-y-5">

              <div className="grid gap-5 md:grid-cols-2">

                <input
                  placeholder="First Name *"
                  className="rounded-xl border border-border bg-background px-4 py-3"
                />

                <input
                  placeholder="Last Name *"
                  className="rounded-xl border border-border bg-background px-4 py-3"
                />

              </div>

              <input
                type="email"
                placeholder="Email Address *"
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />

              <input
                placeholder="Phone Number (Optional)"
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />

              <input
                placeholder="Company / Consulting Firm (Optional)"
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />

              <textarea
                rows={6}
                placeholder="Tell us about your consulting practice (Optional)"
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-brand px-6 py-4 text-lg font-semibold text-brand-foreground transition hover:bg-brand-strong"
              >
                Contact Our Team
              </button>

            </form>

          </div>

        </div>

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl bg-slate-950 p-12 text-center text-white">

          <h2 className="text-4xl font-black">
            Built Exclusively for Franchise Consultants
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-slate-300">
            FranchiseReady AI is intentionally available only to professional
            franchise consultants. We do not license our recommendation engine
            to franchisors, ensuring every recommendation is based solely on
            candidate fit—not sponsorships, commercial relationships, or paid
            placement.
          </p>

        </div>

      </section>

    </main>
  );
}