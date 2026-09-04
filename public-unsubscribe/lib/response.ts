import type { UnsubscribeOutcome } from "./unsubscribe.ts";

const HEADERS = Object.freeze({
  "cache-control": "no-store, max-age=0",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "content-type": "text/html; charset=utf-8",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow, noarchive",
});

export function responseHeaders(): HeadersInit {
  return HEADERS;
}

export function renderResponse(outcome: UnsubscribeOutcome): string {
  const success = outcome === "success";
  const heading = success ? "You have been unsubscribed." : "This link is unavailable.";
  const message = success
    ? "You will no longer receive marketing emails from this sender."
    : "The link is invalid or unavailable. No personal information was disclosed.";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>Email preferences</title></head><body style="margin:0;background:#f8fafc;color:#0f172a;font-family:system-ui,sans-serif"><main style="align-items:center;display:flex;min-height:100vh;padding:24px"><section style="background:white;border:1px solid #e2e8f0;border-radius:16px;margin:0 auto;max-width:560px;padding:32px;width:100%"><p style="color:#0f766e;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Email preferences</p><h1 style="font-size:30px;margin:12px 0">${heading}</h1><p style="color:#475569;line-height:1.6">${message}</p></section></main></body></html>`;
}
