import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getSafeReturnPath } from "@/lib/auth/routes";
import { getPublicEnvironment } from "@/lib/env";

export function createAuthCallbackUrl(next: string) {
  const { APP_URL } = getPublicEnvironment();
  const callbackUrl = new URL(AUTH_ROUTES.callback, APP_URL);
  callbackUrl.searchParams.set("next", getSafeReturnPath(next));

  return callbackUrl.toString();
}
