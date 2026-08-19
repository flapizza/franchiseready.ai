export const DEMO_CONSULTANT_TIMEZONE = "America/New_York";
export function localDateKey(value: string | Date, timezone = DEMO_CONSULTANT_TIMEZONE) { return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)); }
export function formatEventTime(value: string, timezone = DEMO_CONSULTANT_TIMEZONE) { return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
export function formatEventDate(value: string, timezone = DEMO_CONSULTANT_TIMEZONE) { return new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", month: "short", day: "numeric" }).format(new Date(value)); }
export function localDateTimeParts(value: string, timezone = DEMO_CONSULTANT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}
export function localDateTimeToIso(value: string, timezone = DEMO_CONSULTANT_TIMEZONE) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Invalid local date and time.");
  const [, year, month, day, hour, minute] = match;
  const desired = Date.UTC(+year, +month - 1, +day, +hour, +minute);
  let instant = desired;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const rendered = localDateTimeParts(new Date(instant).toISOString(), timezone);
    const [renderedYear, renderedMonth, renderedDay] = rendered.date.split("-").map(Number);
    const [renderedHour, renderedMinute] = rendered.time.split(":").map(Number);
    instant += desired - Date.UTC(renderedYear, renderedMonth - 1, renderedDay, renderedHour, renderedMinute);
  }
  return new Date(instant).toISOString();
}
export function demoLocalIso(days: number, hour: number, minute = 0) { const value = new Date(); value.setHours(hour, minute, 0, 0); value.setDate(value.getDate() + days); return value.toISOString(); }
