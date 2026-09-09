// Only inspect claims returned by Supabase getClaims(), never client-supplied JWT data.
export function hasRecentRecoveryClaim(claims: Record<string, unknown> | undefined, userId: string, now = Date.now()) {
  if (!claims || claims.sub !== userId || typeof claims.exp !== "number" || claims.exp * 1000 <= now || !Array.isArray(claims.amr)) return false;
  return claims.amr.some((entry: { method?: unknown; timestamp?: unknown }) =>
    entry?.method === "recovery" && typeof entry.timestamp === "number" &&
    entry.timestamp * 1000 <= now && entry.timestamp * 1000 > now - 15 * 60 * 1000,
  );
}
