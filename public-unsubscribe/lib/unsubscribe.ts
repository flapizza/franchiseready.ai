import { createHash } from "node:crypto";
import { readEnvironment, type UnsubscribeEnvironment } from "./env.ts";

export type UnsubscribeOutcome = "success" | "unavailable";
export type RpcTransport = (
  environment: UnsubscribeEnvironment,
  input: Readonly<{ token_digest: string }>,
) => Promise<boolean>;

const TOKEN_PATTERN = /^[A-Za-z0-9-]{32,128}$/;

export function isValidToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function callUnsubscribeRpc(
  environment: UnsubscribeEnvironment,
  input: Readonly<{ token_digest: string }>,
): Promise<boolean> {
  const response = await fetch(
    `${environment.supabaseUrl}/rest/v1/rpc/unsubscribe_marketing`,
    {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      headers: {
        apikey: environment.supabasePublishableKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) return false;
  return (await response.json()) === true;
}

export async function unsubscribe(
  token: string,
  dependencies: Readonly<{
    environment?: UnsubscribeEnvironment;
    transport?: RpcTransport;
  }> = {},
): Promise<UnsubscribeOutcome> {
  if (!isValidToken(token)) return "unavailable";

  try {
    const environment = dependencies.environment ?? readEnvironment();
    const transport = dependencies.transport ?? callUnsubscribeRpc;
    const result = await transport(environment, { token_digest: hashToken(token) });
    return result ? "success" : "unavailable";
  } catch {
    return "unavailable";
  }
}
