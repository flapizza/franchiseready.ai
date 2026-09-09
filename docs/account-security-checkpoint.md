# Account security checkpoint

Starting branch: `feature/fp002-interactive-runtime`. Starting HEAD, upstream and remote branch: `1d362ec2b65df76689acaec583686744083bcf12`.

## Redirect correction and preservation

The old `getSafeReturnPath` checked the origin of the first URL parse, then returned its normalized pathname. `/.//example.invalid` normalized to `//example.invalid`; the callback's second URL parse interpreted that as an external network-path reference. The same class affected encoded dot segments.

The existing shared validator now requires an explicit local path, rejects ambiguous backslashes, whitespace, controls, encoded separators, nested escapes and malformed path escapes, checks the normalized path, and verifies its final resolved origin. Fallbacks receive the same validation. Queries remain data and safe local queries are preserved. No second redirect validator was introduced.

Tests check final origins for protocol-relative inputs, dot-segment normalization, backslashes, encoded slashes/backslashes, nested percent escapes, absolute URLs, controls, malformed escapes and unsafe fallbacks. Legitimate `/crm`, `/crm/brands`, `/settings/security`, `/login`, `/auth/confirm`, `/auth/update-password` and local query strings retain their destination.

Every direct consumer was reviewed: `feature/auth/actions/sign-in.ts`, `app/(public)/auth/callback/route.ts`, `feature/auth/utils/callback-urls.ts`, `lib/auth/session.ts`, and `proxy.ts`. Callback URL construction also serves signup confirmation and password recovery.

The user authorized only the validator correction within protected `lib/auth/routes.ts`. Its existing assessment-routing changes remain outside the security commit.

| Preserved item | SHA-256 |
| --- | --- |
| Original `lib/auth/routes.ts` | `CC308584F8B93940739D7BA3E1BAA9F675EFFF9A184CEDDE5A8D41CB461E3A46` |
| Authorized replacement working-file baseline | `57DF160486A22626D0799CB33FA6D18BFF304C7779E089FBAC48CE896EF6DBBC` |
| Historical and current `.env.local` | `3B7CD602F0DD77812A7E5B374FB4D4DFB2D48A671F192FA3059215C4411D7860` |

The existing `%TEMP%/frangroove-auth-preservation.json` manifest was amended after redirect tests passed. The other 37 entries and files retain their original hashes. The amended baseline means 37 original hashes plus the authorized working-file hash above. `.env.local` remains ignored. Assessment changes remain uncommitted and unstaged; only the validator hunk is eligible for staging from `lib/auth/routes.ts`.

## Visible functionality and security design

- Settings includes a Security destination at `/settings/security`, with Current password, New password, Confirm new password and Change Password. The page and action independently require a real Supabase user; demo access cannot authorize the mutation. Settings uses a compact mobile header because the fixed desktop shell previously hid the form at phone widths.
- The action obtains identity and email through `getUser()`, then verifies the current password using `signInWithPassword()` on an isolated, non-persisting Supabase client with the public key. The verified user ID must equal the original authenticated ID. Submitted emails, user IDs and workspace IDs do not choose the target. `updateUser()` runs only after verification and also supplies `current_password`. Temporary verification sessions are signed out. This does not depend on the hosted current-password enforcement flag, which is presently disabled.
- Password validation requires 12–72 characters, at most 72 UTF-8 bytes, a nonblank password and matching confirmation. Change-password also rejects reuse of the supplied current password. The shared password schema, including signup, now matches Production's existing 12-character minimum; login still accepts existing credentials without applying a new minimum.
- The existing login recovery link is visibly labeled “Forgot password?”. The existing recovery-request page calls `resetPasswordForEmail()` and returns the same neutral success message for valid email input whether Auth accepts, rejects or throws. No provider details or account-existence result are returned.
- Recovery uses the established SSR PKCE exchange and `APP_URL` callback construction with `next=/auth/update-password`. Callback redirects use the canonical application origin and the corrected shared validator. Successful exchange removes the code from the destination. Callback responses use `no-store` and `no-referrer`; raw provider errors are not logged.
- The reset page and action both require `getUser()` and verified `getClaims()` data for the same user with an unexpired JWT and a recovery AMR timestamp within 15 minutes. Ordinary password sessions, absent sessions and expired recovery claims fail closed. The user can request another link; PKCE requires the browser that initiated recovery. There are no custom reset tokens or application recovery-session tables.
- On normal success, Supabase global sign-out is requested and the user reaches `/login?password=updated` with a clear success message. A fresh login reaches `/crm`. If sign-out fails after the password has already changed, the form still reports the successful update and offers `/crm`; existing protection sends an unauthenticated visitor to login. Supabase revokes refresh sessions, but already-issued access JWTs can remain valid until expiry. No custom token-revocation model was added.
- Passwords exist only in form input, action-local variables and supported Auth calls. The implementation performs no application-table password writes, password logging, URL serialization or password-bearing action-state returns. Browser code imports no service-role client. The local service-role key is used solely by the local fixture runner and is absent from the built browser JavaScript.

## Hosted email readiness — read-only inspection

Management API GETs inspected both projects; no hosted writes or test emails were sent.

| Setting | Production `dpsmwqdjtgckfxkukxjj` | Preview `dleaiihhthhdxghycdls` |
| --- | --- | --- |
| Site URL | `https://app.frangroove.com` | `http://localhost:3000` |
| Redirect allowlist | Canonical callback plus encoded confirmation and update-password destinations | Empty |
| Password minimum | 12 | 6 |
| Custom SMTP | Not configured | Not configured |
| Send-email hook | Disabled | Disabled |
| Default email rate | 2/hour | 2/hour |

Hosted recovery is **not production-ready for ordinary FranGroove users**. Supabase's default mail service only sends to project-team addresses, is rate-limited and has no delivery SLA. No actual hosted delivery was proven. See [Supabase custom SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

Before promotion, separately authorize an Auth mail service, correct Preview's site URL/redirect allowlist, review its weaker password minimum, and prove delivery and PKCE completion on the intended hosted origin. Production already lists the intended recovery callback. This checkpoint does not configure SMTP, an email hook, Resend Auth delivery, Vercel variables, DNS or Supabase settings.

## Local validation

Commands and evidence:

- `npx tsc --noEmit`; `npm run lint`; production `next build` through the local runner.
- `node --test tests/unit/account-security.test.mjs tests/unit/redirect-security.test.mjs`: 11 focused tests, including wrong/missing current password, identity mismatch, password/confirmation policy, anti-enumeration, canonical callback construction, final redirect origins, recovery expiry and post-update sign-out failure.
- Existing Google OAuth and workspace-invitation regressions: 11 tests.
- `node scripts/local-account-security.mjs --forwarded-ports`: production build and local browser tests. `--skip-build` repeats browser validation against an existing local build. The configuration also runs the preserved owner-login regression file when it is present locally.
- Browser coverage exercises fresh one-submit login to `/crm`, explicit next, malicious next, authenticated `/login`, sign-out/protected-route denial, Settings navigation, wrong-current-password rejection, password change, old-password rejection/new-password login, ordinary-session reset denial, captured recovery email, reset completion and invalid callback handling. It compares recovery responses for existing and absent local accounts.
- Desktop 1440px and mobile 390px reviews cover Settings Security, recovery request and update-password. Screenshots are in ignored `test-results/`; passwords, tokens, traces and videos are not captured. Console/page errors are collected without recording their potentially sensitive payloads.
- The local runner verifies unchanged user identity and organization membership after the workflow and scans browser JavaScript for the local service-role key.
- Focused whitespace and staged-diff checks exclude the preserved generated-types EOF warning.

Local infrastructure uses GoTrue v2.196.0 and Mailpit v1.30.2. Windows reserved the usual Supabase host port. Temporary loopback forwarding containers expose the existing local API at 15421 and mail UI at 15424; only the test mail link's local port is adapted to reach that same Auth service. Application callback construction remains canonical. No database recreation or migration was performed.

## Files in the security change

Modified: `lib/auth/routes.ts` (validator hunk only), `app/(protected)/settings/layout.tsx`, `app/(public)/auth/callback/route.ts`, `app/(public)/auth/update-password/page.tsx`, `app/(public)/login/page.tsx`, `feature/auth/actions/password-reset.ts`, `feature/auth/components/update-password-form.tsx`, `feature/auth/types/actions.ts`, `feature/auth/utils/validation.ts`, `feature/layout/components/AppShell.tsx`.

Created: `app/(protected)/settings/security/page.tsx`, `feature/auth/actions/change-password.ts`, `feature/auth/components/change-password-form.tsx`, `feature/auth/utils/recovery-session.ts`, `scripts/local-account-security.mjs`, `tests/account-security.config.ts`, `tests/e2e/account-security.spec.ts`, `tests/unit/account-security.test.mjs`, `tests/unit/redirect-security.test.mjs`, and this report.

The intended single commit is `Add secure self-service account recovery`, pushed normally to the development branch after validation and preservation checks. No deployment, hosted configuration/data change or migration is part of this checkpoint.
