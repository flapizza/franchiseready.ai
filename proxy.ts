import { NextResponse, type NextRequest } from "next/server";
import { APP_ROUTES, AUTH_ROUTES } from "@/lib/auth/constants";
import { hasConferenceDemoRequestSession, isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
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
  const hasDemoSession = hasConferenceDemoRequestSession(request);
  const session = hasDemoSession
    ? {
        isAuthenticated: false,
        response: NextResponse.next({ request }),
      }
    : await refreshSupabaseSession(request);
  const isAuthenticated = session.isAuthenticated || hasDemoSession;
  const { pathname, search } = request.nextUrl;
  const isPublicConferenceAssessment = isConferenceDemoAccessEnabled() && (pathname === "/assessment/start" || pathname.startsWith("/assessment/start/"));

  if (isProtectedPath(pathname) && !isAuthenticated && !isPublicConferenceAssessment) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set("next", getSafeReturnPath(`${pathname}${search}`));
    return redirectWithSession(loginUrl, session.response);
  }

  if (isAuthEntryPath(pathname) && isAuthenticated) {
    return redirectWithSession(
      new URL(
        hasDemoSession
          ? APP_ROUTES.missionControl
          : AUTH_ROUTES.home,
        request.url,
      ),
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
