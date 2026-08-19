"use client";

import { useMemo, useState } from "react";

type DateTimeValue = { date: string; time: string };
const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const displayHour = hour % 12 || 12;
  return { value, label: `${displayHour}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}` };
});

function milliseconds(value: DateTimeValue) { return Date.parse(`${value.date}T${value.time}:00Z`); }
function fromMilliseconds(value: number): DateTimeValue { const iso = new Date(value).toISOString(); return { date: iso.slice(0, 10), time: iso.slice(11, 16) }; }

export function MeetingDateTimeFields({ initialStart, initialEnd, editing = false }: { initialStart?: DateTimeValue; initialEnd?: DateTimeValue; editing?: boolean }) {
  const [start, setStart] = useState<DateTimeValue>(initialStart ?? { date: "", time: "" });
  const [end, setEnd] = useState<DateTimeValue>(initialEnd ?? { date: "", time: "" });
  const [endOverridden, setEndOverridden] = useState(editing);
  const error = useMemo(() => start.date && start.time && end.date && end.time && milliseconds(end) <= milliseconds(start) ? "End date and time must be after start date and time." : "", [start, end]);

  function updateStart(next: DateTimeValue) {
    if (next.date && next.time) {
      if (endOverridden && start.date && start.time && end.date && end.time) {
        const duration = Math.max(milliseconds(end) - milliseconds(start), 15 * 60_000);
        setEnd(fromMilliseconds(milliseconds(next) + duration));
      } else setEnd(fromMilliseconds(milliseconds(next) + 60 * 60_000));
    } else if (next.date && !endOverridden) setEnd((current) => ({ ...current, date: next.date }));
    setStart(next);
  }

  const selectClass = "mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  return <>
    <label className="font-bold">Start Date<input aria-label="Start Date" type="date" required value={start.date} onChange={(event) => updateStart({ ...start, date: event.target.value })} className={selectClass} /></label>
    <label className="font-bold">Start Time<select aria-label="Start Time" required value={start.time} onChange={(event) => updateStart({ ...start, time: event.target.value })} className={selectClass}><option value="">Choose a time</option>{timeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <label className="font-bold">End Date<input aria-label="End Date" type="date" required value={end.date} onChange={(event) => { setEndOverridden(true); setEnd({ ...end, date: event.target.value }); }} className={selectClass} /></label>
    <label className="font-bold">End Time<select aria-label="End Time" required value={end.time} onChange={(event) => { setEndOverridden(true); setEnd({ ...end, time: event.target.value }); }} className={selectClass}><option value="">Choose a time</option>{timeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <input type="hidden" name="startAt" value={start.date && start.time ? `${start.date}T${start.time}` : ""} />
    <input type="hidden" name="endAt" value={end.date && end.time ? `${end.date}T${end.time}` : ""} />
    {error && <p role="alert" className="text-sm font-bold text-red-700 md:col-span-2">{error}</p>}
  </>;
}
