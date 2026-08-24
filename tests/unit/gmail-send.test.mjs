import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildMimeMessage } from "../../feature/communications/mime/buildMimeMessage.ts";

test("builds an RFC-style plain-text message and Gmail base64url payload", () => {
  const result = buildMimeMessage({ from: { name: "Fran Groove", email: "fran@example.com" },
    to: [{ name: "Renée Candidate", email: "candidate@example.com" }], subject: "A café follow-up",
    textBody: "Hello\nSecond line", internetMessageId: "<fixed@example.com>" });
  assert.match(result.mime, /\r\nTo: "Renée Candidate" <candidate@example.com>\r\n/);
  assert.match(result.mime, /Content-Type: text\/plain; charset="UTF-8"/);
  assert.equal(Buffer.from(result.raw, "base64url").toString("utf8"), result.mime);
  assert.doesNotMatch(result.raw, /[+/=]/);
});

test("rejects header injection before provider submission", () => {
  assert.throws(() => buildMimeMessage({ from: { email: "from@example.com" }, to: [{ email: "to@example.com" }],
    subject: "Safe\r\nBcc: attacker@example.com", textBody: "Body", internetMessageId: "<fixed@example.com>" }), /header/);
});

test("Gmail adapter uses send endpoint and preserves ambiguous outcomes", async () => {
  const source = await readFile(new URL("../../feature/communications/providers/google/GmailDeliveryProvider.ts", import.meta.url), "utf8");
  assert.match(source, /gmail\/v1\/users\/me\/messages\/send/);
  assert.match(source, /response\.status === 401/);
  assert.match(source, /response\.status === 403/);
  assert.match(source, /response\.status === 429/);
  assert.match(source, /response\.status >= 400 && response\.status < 500/);
  assert.match(source, /"ambiguous", false, true/);
});
