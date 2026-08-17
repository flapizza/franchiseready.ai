"use server";

import { redirect } from "next/navigation";

import { APP_ROUTES, AUTH_ROUTES } from "@/lib/auth/constants";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { createConferenceDemoSession } from "@/lib/auth/demo-session";

export async function enterConferenceDemo(): Promise<void> {
  if (!isConferenceDemoAccessEnabled()) {
    redirect(AUTH_ROUTES.login);
  }

  await createConferenceDemoSession();
  redirect(APP_ROUTES.missionControl);
}
