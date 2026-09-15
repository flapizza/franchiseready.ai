import { unsubscribe } from "../../../../../lib/unsubscribe.ts";
import { oneClick } from "../../../../../lib/one-click.ts";

export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  return oneClick(request, (await params).token, unsubscribe);
}
