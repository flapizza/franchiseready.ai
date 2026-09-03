import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCampaignDeliveryWorker(request: Request, expected: string): boolean {
  const prefix = "Bearer ";
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith(prefix)) return false;
  const supplied = Buffer.from(header.slice(prefix.length));
  const configured = Buffer.from(expected);
  return supplied.length === configured.length && timingSafeEqual(supplied, configured);
}
