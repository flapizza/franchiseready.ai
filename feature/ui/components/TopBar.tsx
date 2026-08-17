import {
  Bell,
  BrainCircuit,
  Plus,
  Search,
} from "lucide-react";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">

      <div className="flex h-20 items-center justify-between px-8">

        {/* LEFT */}

        <div className="flex items-center gap-5">

          <div className="relative">

            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search candidates, brands, meetings..."
              className="w-[420px] rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-4">

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Candidate
          </button>

          <button
            type="button"
            className="relative rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
          >
            <Bell className="h-5 w-5 text-slate-700" />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />

          </button>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">

            <BrainCircuit className="h-5 w-5 text-emerald-600" />

            <div>

              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                AI Status
              </div>

              <div className="text-sm font-medium text-emerald-600">
                All Systems Online
              </div>

            </div>

          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {demoConsultant.initials}
            </div>

            <div>

              <div className="text-sm font-semibold text-slate-900">
                {demoConsultant.displayName}
              </div>

              <div className="text-xs text-slate-500">
                {demoConsultant.title}
              </div>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}
