const CONFERENCE_DEMO_REFERENCE = "2026-08-31T13:00:00.000Z";
const CONFERENCE_DEMO_LOCAL_MIDNIGHT = Date.parse("2026-08-31T04:00:00.000Z");

export function conferenceDemoNow(): Date {
  return new Date(CONFERENCE_DEMO_REFERENCE);
}

export function conferenceDemoIso(days = 0, hour = 9, minute = 0): string {
  return new Date(CONFERENCE_DEMO_LOCAL_MIDNIGHT + days * 86_400_000 + hour * 3_600_000 + minute * 60_000).toISOString();
}
