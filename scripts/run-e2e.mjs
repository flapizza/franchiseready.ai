import { spawn } from "node:child_process";
import process from "node:process";

const requestedTests = process.argv.slice(2);
const requiresProductionComposition = requestedTests.some((argument) =>
  argument.includes("contacts-production-persistence.spec.ts")
  || argument.includes("marketing-production-persistence.spec.ts")
  || argument.includes("marketing-provider-unavailable.spec.ts"),
);

const environment = {
  ...process.env,
  PLAYWRIGHT_TEST_MODE: "true",
  CONFERENCE_DEMO_ACCESS: "true",
  ...(requiresProductionComposition && !process.env.PERSISTENCE_MODE
    ? { PERSISTENCE_MODE: "supabase" }
    : {}),
};

function run(modulePath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [modulePath, ...args], {
      cwd: process.cwd(),
      env: environment,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) reject(new Error(`${modulePath} exited from signal ${signal}.`));
      else resolve(code ?? 1);
    });
  });
}

const nextCli = "node_modules/next/dist/bin/next";
const playwrightCli = "node_modules/@playwright/test/cli.js";
const playwrightArgs = ["test", ...requestedTests];

const buildCode = await run(nextCli, ["build"]);
if (buildCode !== 0) process.exit(buildCode);

process.exit(await run(playwrightCli, playwrightArgs));
