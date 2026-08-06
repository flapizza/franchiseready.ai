"use client";

import { useState } from "react";

import { ConsultantProfileEngine } from "../runtime/ConsultantProfileEngine";

export function ConsultantProfileEditor() {
  const engine =
    new ConsultantProfileEngine();

  const [profile] =
    useState(engine.getDefault());

  return (
    <div className="grid gap-10 xl:grid-cols-[2fr_1fr]">

      <section className="rounded-3xl border bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold">
          Professional Identity
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <Field
            label="Company"
            value={profile.companyName}
          />

          <Field
            label="Consultant"
            value={profile.consultantName}
          />

          <Field
            label="Title"
            value={profile.title}
          />

          <Field
            label="Website"
            value={profile.website ?? ""}
          />

          <Field
            label="Email"
            value={profile.email}
          />

          <Field
            label="Phone"
            value={profile.phone ?? ""}
          />

          <Field
            label="LinkedIn"
            value={profile.linkedInUrl ?? ""}
          />

          <Field
            label="Scheduling Link"
            value={profile.schedulingUrl ?? ""}
          />

        </div>

      </section>

      <BrandPreview />

    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <label className="text-sm font-semibold text-slate-600">
        {label}
      </label>

      <input
        className="mt-2 w-full rounded-xl border border-slate-300 p-3"
        defaultValue={value}
      />

    </div>
  );
}

function BrandPreview() {
  return (
    <aside className="rounded-3xl border bg-slate-950 p-8 text-white">

      <p className="text-xs uppercase tracking-widest text-blue-300">
        Live Preview
      </p>

      <h2 className="mt-4 text-3xl font-black">
        Franchise Consulting Group
      </h2>

      <p className="mt-6 leading-7 text-slate-300">
        Helping people discover franchise opportunities
        that align with their goals, lifestyle,
        and long-term vision.
      </p>

      <button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold">
        Start Assessment
      </button>

    </aside>
  );
}