import { getPublicEnvironment } from "@/lib/env";

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return new URL(origin).origin === new URL(getPublicEnvironment().APP_URL).origin;
}
