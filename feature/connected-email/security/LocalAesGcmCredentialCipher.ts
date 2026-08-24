import "server-only";
import { getGoogleOAuthEnvironment } from "@/lib/env";
import type { CredentialCipher } from "./CredentialCipher";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class LocalAesGcmCredentialCipher implements CredentialCipher {
  readonly providerName = "local-aes-256-gcm";
  readonly version = 1;

  private async key() {
    const raw = Buffer.from(getGoogleOAuthEnvironment().GOOGLE_TOKEN_ENCRYPTION_KEY, "base64");
    return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
  }

  async encrypt(accountId: string, plaintext: string): Promise<string> {
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce, additionalData: encoder.encode(accountId) },
      await this.key(),
      encoder.encode(plaintext),
    );
    return `${Buffer.from(nonce).toString("base64url")}.${Buffer.from(ciphertext).toString("base64url")}`;
  }

  async decrypt(accountId: string, payload: string): Promise<string> {
    const [nonceValue, ciphertextValue] = payload.split(".");
    if (!nonceValue || !ciphertextValue) throw new Error("Stored credential envelope is invalid.");
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Buffer.from(nonceValue, "base64url"), additionalData: encoder.encode(accountId) },
      await this.key(),
      Buffer.from(ciphertextValue, "base64url"),
    );
    return decoder.decode(plaintext);
  }
}
