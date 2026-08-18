import type { NextRequest } from "next/server";

import { demoConsultant } from "@/feature/demo/data/demoConsultant";

export const CONFERENCE_DEMO_COOKIE =
  "frangroove-conference-demo";

export function isConferenceDemoAccessEnabled(): boolean {
  return (
    (process.env.NODE_ENV === "development" ||
      process.env.PLAYWRIGHT_TEST_MODE === "true") &&
    process.env.CONFERENCE_DEMO_ACCESS === "true"
  );
}

export function hasConferenceDemoRequestSession(
  request: NextRequest,
): boolean {
  return (
    isConferenceDemoAccessEnabled() &&
    request.cookies.get(CONFERENCE_DEMO_COOKIE)?.value ===
      demoConsultant.id
  );
}
