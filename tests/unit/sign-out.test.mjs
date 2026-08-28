import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const actionUrl = new URL(
  "../../feature/auth/actions/sign-out.ts",
  import.meta.url,
);
const componentUrl = new URL(
  "../../feature/auth/components/sign-out-button.tsx",
  import.meta.url,
);
const topBarUrl = new URL(
  "../../feature/layout/components/TopBar.tsx",
  import.meta.url,
);

test("authenticated shell exposes the existing sign-out server action", async () => {
  const [action, component, topBar] = await Promise.all([
    readFile(actionUrl, "utf8"),
    readFile(componentUrl, "utf8"),
    readFile(topBarUrl, "utf8"),
  ]);

  assert.match(action, /supabase\.auth\.signOut\(\)/);
  assert.match(component, /import \{ signOut \} from "@\/feature\/auth\/actions\/sign-out"/);
  assert.match(component, /return signOut\(\)/);
  assert.match(component, /"Signing Out\.\.\." : "Sign Out"/);
  assert.match(topBar, /<SignOutButton \/>/);
});

test("sign-out failures use the sanitized auth result in an accessible alert", async () => {
  const [action, component] = await Promise.all([
    readFile(actionUrl, "utf8"),
    readFile(componentUrl, "utf8"),
  ]);

  assert.match(action, /return authFailure\("unexpected"\)/);
  assert.doesNotMatch(action, /error\.message|error\.cause|JSON\.stringify\(error/);
  assert.match(component, /state\.status === "error"/);
  assert.match(component, /role="alert"/);
  assert.match(component, /\{state\.message\}/);
});
