import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
} from "@/lib/auth/constants";

export function isAuthEntryPath(pathname: string) {
  return pathname === AUTH_ROUTES.login || pathname === AUTH_ROUTES.signup;
}

export function isProtectedPath(pathname: string) {
  if (isPublicAssessmentInvitationPath(pathname)) return false;
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isPublicAssessmentInvitationPath(pathname: string) {
  return /^\/assessment\/invitation\/[A-Za-z0-9_-]{1,128}(?:\/(?:results|report))?\/?$/.test(pathname);
}

export function getSafeReturnPath(value: string | null, fallback = AUTH_ROUTES.home) {
  const trustedOrigin = "https://franchiseready.local";
  function localPath(input: string | null): string | null {
    if (!input || !input.startsWith("/") || input.startsWith("//") || /[\\\s\u0000-\u001f\u007f]/.test(input)) return null;
    try {
      const resolved = new URL(input, trustedOrigin);
      decodeURIComponent(resolved.pathname); // Reject malformed percent escapes.
      // Reject encoded path separators, controls and nested escapes. Query values
      // are data; preserve them without interpreting them as a destination.
      if (/%(?:2f|5c|25|0[0-9a-f]|1[0-9a-f]|7f)/i.test(resolved.pathname)) return null;
      const path = `${resolved.pathname}${resolved.search}`;
      if (resolved.origin !== trustedOrigin || path.startsWith("//") || new URL(path, trustedOrigin).origin !== trustedOrigin) return null;
      return path;
    } catch {
      return null;
    }
  }
  return localPath(value) ?? localPath(fallback) ?? AUTH_ROUTES.home;
}
