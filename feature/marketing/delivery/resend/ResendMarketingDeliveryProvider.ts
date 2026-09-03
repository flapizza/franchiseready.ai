import type { MarketingDeliveryProvider, ProviderResult, ProviderSubmission } from "../MarketingDelivery";

type Fetch = typeof fetch;

export interface ResendTransportConfiguration {
  apiKey: string;
  fromEmail: string;
  timeoutMs?: number;
  endpoint?: string;
}

export class ResendMarketingDeliveryProvider implements MarketingDeliveryProvider {
  readonly mode = "external" as const;
  readonly name = "Resend";
  private readonly configuration: ResendTransportConfiguration;
  private readonly fetcher: Fetch;

  constructor(
    configuration: ResendTransportConfiguration,
    fetcher: Fetch = fetch,
  ) { this.configuration=configuration;this.fetcher=fetcher; }

  async submit(input: ProviderSubmission): Promise<ProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.configuration.timeoutMs ?? 10_000);
    try {
      const response = await this.fetcher(this.configuration.endpoint ?? "https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.configuration.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `frangroove/${input.deliveryKey}`,
        },
        body: JSON.stringify({
          from: formatSenderMailbox(this.configuration.fromEmail, input.senderName),
          to: [input.to],
          reply_to: input.replyTo,
          subject: input.subject,
          html: input.html,
          text: input.text,
          tags: safeTags(input.metadata),
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        return { kind: retryableStatus(response.status) ? "transient-failure" : "permanent-failure", code: `resend-http-${response.status}` };
      }
      const body: unknown = await response.json().catch(() => null);
      return isProviderAcceptance(body)
        ? { kind: "accepted", providerMessageId: body.id }
        : { kind: "transient-failure", code: "resend-invalid-response" };
    } catch (error) {
      return { kind: "transient-failure", code: error instanceof Error && error.name === "AbortError" ? "resend-timeout" : "resend-network-error" };
    } finally {
      clearTimeout(timeout);
    }
  }
}

function formatSenderMailbox(mailbox: string, senderName: string) {
  return mailbox.includes("<") ? mailbox : `${safeDisplayName(senderName)} <${mailbox}>`;
}
function safeDisplayName(value: string) { return value.replace(/[\r\n<>]/g, " ").trim().slice(0, 100) || "FranGroove"; }
function safeTags(metadata: Record<string, string>) { return Object.entries(metadata).filter(([name,value])=>/^[A-Za-z0-9_-]{1,50}$/.test(name)&&/^[A-Za-z0-9_-]{1,256}$/.test(value)).slice(0,10).map(([name,value])=>({name,value})); }
function retryableStatus(status: number) { return status===408||status===409||status===425||status===429||status>=500; }
function isProviderAcceptance(value: unknown): value is {id:string} { return typeof value==='object'&&value!==null&&typeof (value as {id?:unknown}).id==='string'&&(value as {id:string}).id.length>0&&(value as {id:string}).id.length<=255; }
