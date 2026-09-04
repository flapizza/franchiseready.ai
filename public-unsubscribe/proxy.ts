import type { NextRequest } from "next/server";
import { renderResponse, responseHeaders } from "./lib/response.ts";
import { unsubscribe } from "./lib/unsubscribe.ts";

export async function proxy(request: NextRequest) {
  if (request.method !== "GET") {
    return new Response(renderResponse("unavailable"), {
      status: 405,
      headers: { ...responseHeaders(), allow: "GET" },
    });
  }

  const token = request.nextUrl.pathname.slice("/unsubscribe/".length);
  const outcome = await unsubscribe(token);
  return new Response(renderResponse(outcome), { status: 200, headers: responseHeaders() });
}

export const config = { matcher: "/unsubscribe/:token" };
