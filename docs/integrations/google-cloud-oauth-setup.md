# Google Cloud OAuth setup for GMAIL-001

GMAIL-001 authorizes account identity and explicit future sending only. It does not read mail and does not send mail yet.

## Google Cloud configuration

1. Create or select the FranGroove Google Cloud project for the environment.
2. Enable the Gmail API.
3. Configure the Google Auth Platform branding, audience, support contact, authorized domains, privacy policy, and terms links.
4. Choose External audience for multi-customer SaaS. While publishing status is Testing, add only dedicated test users; Testing grants and refresh-token behavior are not suitable for production operation.
5. Configure exactly these scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/gmail.send`
6. Do not add `gmail.readonly`, `gmail.modify`, or `https://mail.google.com/` for GMAIL-001.
7. Create an OAuth client of type Web application.
8. Add the exact callback URI for each environment. Local development normally uses `http://localhost:3000/auth/google/callback`; production must use its configured HTTPS origin and path.
9. Put the client ID, client secret, and callback URI in the deployment secret/configuration system as `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_OAUTH_REDIRECT_URI`. Never put them in `NEXT_PUBLIC_*` values.
10. Generate a 32-byte development encryption key and store its base64 representation as `GOOGLE_TOKEN_ENCRYPTION_KEY`. This local AES boundary is rejected in production; configure the managed-KMS `CredentialCipher` before enabling production OAuth.

The authorized redirect URI must exactly equal `GOOGLE_OAUTH_REDIRECT_URI`. A mismatch causes Google to reject the callback before FranGroove can handle it.

## Consent and verification

`gmail.send` is a sensitive Gmail scope. Complete the applicable OAuth app verification, branding, domain ownership, homepage, privacy-policy, and scope-justification requirements before external production use. The later inbound synchronization pack will request read access incrementally and must complete the separate restricted-scope/security-assessment work before that capability is released.

FranGroove requests offline access and explicit consent so Google can issue a refresh token. Google may omit a refresh token on a repeat grant; FranGroove preserves an existing valid refresh token for the same owner/account. If no refresh token exists, the connection fails rather than storing an online-only account.

## Disconnect and revocation

Disconnect first attempts Google's token revocation endpoint, then destroys FranGroove's encrypted credential envelope and marks the account disconnected. Existing non-secret account audit metadata and future canonical communication history are preserved. Users can also revoke FranGroove from their Google Account security settings; a later provider operation must treat revoked credentials as action required and never fall back to demo behavior.
