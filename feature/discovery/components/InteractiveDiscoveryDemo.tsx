"use client";

import { useState } from "react";

import { Button } from "@/feature/ui";

type Props = {
  readiness: number;
  confidence: number;
};

export function InteractiveDiscoveryDemo({
  readiness,
  confidence,
}: Props) {
  const [currentReadiness, setCurrentReadiness] =
    useState(readiness);

  const [currentConfidence, setCurrentConfidence] =
    useState(confidence);

  const [events, setEvents] = useState<string[]>([]);

  function addLeadershipEvent() {
    setCurrentReadiness((value) => value + 3);

    setCurrentConfidence((value) => value + 2);

    setEvents((value) => [
      "Leadership confirmed during Discovery.",
      ...value,
    ]);
  }

  function addBuyingSignal() {
    setCurrentReadiness((value) => value + 2);

    setCurrentConfidence((value) => value + 1);

    setEvents((value) => [
      "Buying signal detected.",
      ...value,
    ]);
  }

  function addRisk() {
    setCurrentReadiness((value) => value - 2);

    setCurrentConfidence((value) => value - 1);

    setEvents((value) => [
      "Potential risk identified.",
      ...value,
    ]);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold">
        Interactive Discovery Demo
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <Stat
          label="Readiness"
          value={currentReadiness}
        />

        <Stat
          label="Confidence"
          value={`${currentConfidence}%`}
        />

      </div>

      <div className="mt-8 flex flex-wrap gap-3">

        <Button
          onClick={addLeadershipEvent}
        >
          Leadership Confirmed
        </Button>

        <Button
          variant="success"
          onClick={addBuyingSignal}
        >
          Buying Signal
        </Button>

        <Button
          variant="danger"
          onClick={addRisk}
        >
          Risk Identified
        </Button>

      </div>

      <div className="mt-8">

        <h3 className="font-semibold">
          Session Events
        </h3>

        <div className="mt-4 space-y-2">

          {events.map((event) => (
            <div
              key={event}
              className="rounded-lg bg-slate-50 p-3"
            >
              {event}
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

      <div className="text-sm text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>

    </div>
  );
}