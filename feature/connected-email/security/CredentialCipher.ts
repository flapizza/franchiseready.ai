import "server-only";

export interface CredentialCipher {
  readonly providerName: string;
  readonly version: number;
  encrypt(accountId: string, plaintext: string): Promise<string>;
  decrypt(accountId: string, ciphertext: string): Promise<string>;
}
