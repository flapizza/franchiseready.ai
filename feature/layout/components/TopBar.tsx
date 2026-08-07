"use client";

import { Bell, Plus, Search } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      <div className="relative w-full max-w-xl">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search candidates..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
        />

      </div>

      <div className="ml-8 flex items-center gap-4">

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">

          <Plus size={18} />

          New Candidate

        </button>

        <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

          <Bell size={18} />

        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            JW
          </div>

          <div>

            <div className="font-semibold">
              Jim Wood
            </div>

            <div className="text-sm text-slate-500">
              Franchise Consultant
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}