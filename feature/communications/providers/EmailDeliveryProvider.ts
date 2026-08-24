export type ProviderFailureCategory = "credentials" | "scope" | "quota" | "invalid-message" | "provider" | "ambiguous";

export class EmailProviderError extends Error {
  readonly category: ProviderFailureCategory;
  readonly retryable: boolean;
  readonly ambiguous: boolean;
  constructor(message: string, category: ProviderFailureCategory, retryable: boolean, ambiguous: boolean) {
    super(message);
    this.name = "EmailProviderError";
    this.category = category;
    this.retryable = retryable;
    this.ambiguous = ambiguous;
  }
}

export interface EmailDeliveryRequest {
  accessToken: string;
  raw: string;
  threadId?: string;
}
export interface EmailDeliveryReceipt { providerMessageId: string; providerThreadId?: string }
export interface EmailDeliveryProvider { send(request: EmailDeliveryRequest): Promise<EmailDeliveryReceipt> }
