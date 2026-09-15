import { unsubscribeTest } from "../../../../../lib/unsubscribe.ts";
import { oneClick } from "../../../../../lib/one-click.ts";
import { renderResponse, responseHeaders } from "../../../../../lib/response.ts";

export const runtime = "nodejs";
type Context = { params: Promise<{ token: string }> };
export async function GET(_request: Request, { params }: Context) {
  const outcome = await unsubscribeTest((await params).token);
  return new Response(renderResponse(outcome, true), { status: outcome === "success" ? 200 : 400, headers: responseHeaders() });
}
export async function POST(request: Request, { params }: Context) {
  return oneClick(request, (await params).token, unsubscribeTest, true);
}
