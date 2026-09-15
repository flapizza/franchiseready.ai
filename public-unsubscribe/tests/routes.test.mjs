import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
import test from "node:test";

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", resolve).once("error", reject));
  const address = server.address();
  assert.notEqual(typeof address, "string");
  const port = address.port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function startApplication() {
  const port = await availablePort();
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, SUPABASE_URL: "", SUPABASE_PUBLISHABLE_KEY: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { output += chunk.toString(); });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Application did not start.")), 15_000);
    const poll = setInterval(() => {
      if (output.includes("Ready")) {
        clearInterval(poll);
        clearTimeout(timeout);
        resolve();
      } else if (child.exitCode !== null) {
        clearInterval(poll);
        clearTimeout(timeout);
        reject(new Error("Application exited before becoming ready."));
      }
    }, 25);
  });

  return { child, origin: `http://127.0.0.1:${port}`, output: () => output };
}

test("production route surface is isolated, hardened, and fail-closed", { timeout: 30_000 }, async (context) => {
  const application = await startApplication();
  context.after(() => application.child.kill());

  const rawToken = "R".repeat(32);
  assert.equal(rawToken.length, 32);
  const response = await fetch(`${application.origin}/unsubscribe/${rawToken}`, { redirect: "manual" });
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /This link is unavailable\./);
  assert.equal(body.includes(rawToken), false);
  assert.equal(application.output().includes(rawToken), false);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  assert.match(response.headers.get("content-security-policy") ?? "", /default-src 'none'/);
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.equal(response.headers.get("x-powered-by"), null);

  for (const path of ['/api/marketing/test-unsubscribe/', '/api/marketing/unsubscribe/']) {
    for (const token of ['short-token-value', rawToken]) {
      const reply = await fetch(application.origin + path + token, {method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'},body:'List-Unsubscribe=One-Click',redirect:'manual'});
      assert.equal(reply.status,400);
      assert.equal(reply.headers.get('set-cookie'),null);
      assert.match(reply.headers.get('cache-control'),/no-store/);
      assert.ok(!(await reply.text()).includes(token));
    }
  }
  const testGet = await fetch(application.origin+'/api/marketing/test-unsubscribe/'+rawToken,{redirect:'manual'});
  assert.equal(testGet.status,400);
  assert.equal(testGet.headers.get('location'),null);
  assert.equal(application.output().includes(rawToken),false);
  assert.equal((await fetch(application.origin+'/unsubscribe/'+rawToken,{method:'POST'})).status,405);

  for (const path of ["/", "/crm", "/login", "/api/internal/campaign-delivery", "/api/arbitrary", "/arbitrary/path"]) {
    const isolated = await fetch(`${application.origin}${path}`, { redirect: "manual" });
    assert.equal(isolated.status, 404, `${path} must be unavailable`);
    assert.equal(isolated.headers.get("set-cookie"), null);
    assert.doesNotMatch(await isolated.text(), /FranGroove|campaign|worker|sign in/i);
  }
});
