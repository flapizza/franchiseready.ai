// Keep public email links separate from the authenticated application's origin.
export function marketingPublicOrigin(fallback: string, environment = process.env): string {
  const configured = environment.MARKETING_PUBLIC_URL;
  if (configured === undefined) return fallback;
  const url = new URL(configured);
  if (url.protocol !== 'https:' || url.origin !== configured) throw new Error('Invalid public marketing origin.');
  return url.origin;
}
