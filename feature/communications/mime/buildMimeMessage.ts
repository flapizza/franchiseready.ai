export interface MimeIdentity { name?: string; email: string }
export interface MimeMessageInput {
  from: MimeIdentity;
  to: MimeIdentity[];
  subject: string;
  textBody: string;
  internetMessageId: string;
  inReplyTo?: string;
  references?: string[];
}

const CRLF = "\r\n";
const unsafeHeader = /[\r\n]/;
const emailPattern = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;

function header(value: string, label: string): string {
  if (!value || unsafeHeader.test(value)) throw new Error(`${label} contains invalid header characters.`);
  return value;
}

function mailbox(identity: MimeIdentity): string {
  const email = header(identity.email.trim(), "Email address");
  if (!emailPattern.test(email)) throw new Error("Email address is invalid.");
  if (!identity.name) return email;
  const name = header(identity.name.trim(), "Display name").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${name}" <${email}>`;
}

export function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function buildMimeMessage(input: MimeMessageInput): { mime: string; raw: string } {
  const subject = header(input.subject.trim(), "Subject");
  if (!subject) throw new Error("Subject is required.");
  if (!input.textBody.trim()) throw new Error("Message body is required.");
  if (input.to.length === 0) throw new Error("At least one recipient is required.");
  const messageId = header(input.internetMessageId.trim(), "Message-ID");
  const headers = [
    `From: ${mailbox(input.from)}`,
    `To: ${input.to.map(mailbox).join(", ")}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ];
  if (input.inReplyTo) headers.splice(4, 0, `In-Reply-To: ${header(input.inReplyTo, "In-Reply-To")}`);
  if (input.references?.length) headers.splice(5, 0, `References: ${input.references.map((item) => header(item, "References")).join(" ")}`);
  const body = Buffer.from(input.textBody.replace(/\r?\n/g, CRLF), "utf8").toString("base64").match(/.{1,76}/g)?.join(CRLF) ?? "";
  const mime = `${headers.join(CRLF)}${CRLF}${CRLF}${body}${CRLF}`;
  return { mime, raw: encodeBase64Url(mime) };
}
