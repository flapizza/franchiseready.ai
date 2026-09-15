import { isValidToken, type UnsubscribeOutcome } from "./unsubscribe.ts";
import { renderResponse, responseHeaders } from "./response.ts";

export async function oneClick(
  request: Request,
  token: string,
  apply: (token: string) => Promise<UnsubscribeOutcome>,
  test = false,
) {
  const respond = (outcome: UnsubscribeOutcome, status: number) =>
    new Response(renderResponse(outcome, test), { status, headers: responseHeaders() });
  if (!isValidToken(token)) return respond("unavailable", 400);
  try {
    const reader = request.body?.getReader();
    if (!reader) return respond("unavailable", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > 1024) {
        await reader.cancel();
        return respond("unavailable", 413);
      }
      chunks.push(part.value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
    const form = await new Request(request.url, {
      method: "POST", body,
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
    if (form.get("List-Unsubscribe") !== "One-Click" || [...form.keys()].length !== 1) return respond("unavailable", 400);
    const outcome = await apply(token);
    return respond(outcome, outcome === "success" ? 200 : 400);
  } catch { return respond("unavailable", 400); }
}
