import "server-only";

import { cookies } from "next/headers";

import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import {
  CONFERENCE_DEMO_COOKIE,
  isConferenceDemoAccessEnabled,
} from "@/lib/auth/demo-access";
import type { AuthenticatedUser } from "@/types/auth";

export async function createConferenceDemoSession(): Promise<void> {
  if (!isConferenceDemoAccessEnabled()) {
    throw new Error("Conference demo access is disabled.");
  }

  const cookieStore = await cookies();

  cookieStore.set(CONFERENCE_DEMO_COOKIE, demoConsultant.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getConferenceDemoUser(): Promise<AuthenticatedUser | null> {
  if (!isConferenceDemoAccessEnabled()) {
    return null;
  }

  const cookieStore = await cookies();

  if (
    cookieStore.get(CONFERENCE_DEMO_COOKIE)?.value !==
    demoConsultant.id
  ) {
    return null;
  }

  return {
    id: demoConsultant.id,
    email: null,
  };
}

export async function clearConferenceDemoSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CONFERENCE_DEMO_COOKIE);
}
