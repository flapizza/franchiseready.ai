# Dedicated public marketing application

`marketing/app` is a separate Next.js routing root. It imports the shared public
homepage, design components, and CSS; it does not import the primary application's
layout, proxy, authentication, CRM, or APIs. Only `/`, `/request-demo`, and the
marketing icon are public routes. Unknown routes return Next.js 404 responses.

Run `npm run build:marketing`, then `npm run start:marketing -- -p 3200`.
Run `node --test tests/marketing/public-site.test.mjs` against that server.
`MARKETING_TEST_URL` may point the same read-only tests at a hosted deployment.
No environment variables or operational credentials are required by marketing.

Vercel: repository root, Next.js, Node 24.x, build command
`npm run build:marketing`, output directory `marketing/.next`, manual deployment.
The primary application retains its existing `npm run build` and `.next` output.
Shared public components keep maintenance in one place; operational modules are
not part of the marketing import graph. Root TypeScript excludes the independent
marketing app, which Next.js type-checks with its own tsconfig.

Existing-user access goes to `https://app.frangroove.com/login`. Sales/demo
availability is explicit; no form, mailbox, scheduling integration, or email
submission is implied. Product mockups are illustrative and planned functionality
is identified rather than sold as currently available.

Marketing metadata permits indexing but deliberately omits a canonical URL and
metadataBase until the separately authorized apex/www cutover. At that checkpoint,
set the canonical origin to `https://frangroove.com`; do not make the temporary
Vercel hostname canonical. No application indexing policy is changed here.
