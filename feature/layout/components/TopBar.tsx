"use client";

import {
  Bell,
  Bot,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="flex h-24 items-center justify-between px-8">

        <div className="flex items-center gap-8">

          <div>

            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-600">
              Mission Control
            </div>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Welcome back, Jim.
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Your AI team identified{" "}
              <span className="font-semibold text-slate-900">
                3 opportunities
              </span>{" "}
              that deserve your attention today.
            </p>

          </div>

        </div>

        <div className="flex items-center gap-4">

          <div className="relative w-[420px]">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Ask FranGroove anything..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
            />

          </div>

          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">

            <Plus size={18} />

            New Candidate

          </button>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />

            <Bot
              size={16}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-700">
              AI Active
            </span>

          </div>

          <button className="relative rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <Bell size={18} />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              2
            </span>

          </button>

          <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <Sparkles
              size={18}
              className="text-teal-600"
            />

          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 font-bold text-white">
              JW
            </div>

            <div>

              <div className="font-semibold text-slate-900">
                Jim Wood
              </div>

              <div className="text-sm text-slate-500">
                Franchise Consultant
              </div>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}