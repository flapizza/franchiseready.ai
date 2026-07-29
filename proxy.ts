import type { NextRequest } from "next/server";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import {
  getSafeReturnPath,
  isAuthEntryPath,
  isProtectedPath,
} from "@/lib/auth/routes";
import {
  redirectWithSession,
  refreshSupabaseSession,
} from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const session = await refreshSupabaseSession(request);
  const { pathname, search } = request.nextUrl;

  if (isProtectedPath(pathname) && !session.isAuthenticated) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set("next", getSafeReturnPath(`${pathname}${search}`));
    return redirectWithSession(loginUrl, session.response);
  }

  if (isAuthEntryPath(pathname) && session.isAuthenticated) {
    return redirectWithSession(
      new URL(AUTH_ROUTES.home, request.url),
      session.response,
    );
  }

  return session.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
