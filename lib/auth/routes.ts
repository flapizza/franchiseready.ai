import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
} from "@/lib/auth/constants";

export function isAuthEntryPath(pathname: string) {
  return pathname === AUTH_ROUTES.login || pathname === AUTH_ROUTES.signup;
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getSafeReturnPath(value: string | null, fallback = AUTH_ROUTES.home) {
  if (!value) {
    return fallback;
  }

  const trustedOrigin = "https://franchiseready.local";

  try {
    const resolved = new URL(value, trustedOrigin);

    if (resolved.origin !== trustedOrigin) {
      return fallback;
    }

    return `${resolved.pathname}${resolved.search}`;
  } catch {
    return fallback;
  }
}
