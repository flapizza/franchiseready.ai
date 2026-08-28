import test from "node:test";
import assert from "node:assert/strict";
import { resolveAppUrl } from "../../lib/env.ts";

const invalidAppUrl = /Invalid authentication environment configuration: APP_URL/;

test("uses an explicit valid APP_URL", () => {
  assert.equal(
    resolveAppUrl({ APP_URL: "http://localhost:3000" }),
    "http://localhost:3000",
  );
});

test("explicit APP_URL takes precedence over Vercel variables", () => {
  assert.equal(
    resolveAppUrl({
      APP_URL: "https://explicit.example.com",
      VERCEL_TARGET_ENV: "preview",
      VERCEL_URL: "generated-preview.vercel.app",
      VERCEL_BRANCH_URL: "ignored-branch.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "ignored-production.vercel.app",
    }),
    "https://explicit.example.com",
  );
});

test("derives a Vercel Preview APP_URL from VERCEL_URL", () => {
  assert.equal(
    resolveAppUrl({
      VERCEL_TARGET_ENV: "preview",
      VERCEL_URL: "frangroove-preview-abc123-flapizza.vercel.app",
    }),
    "https://frangroove-preview-abc123-flapizza.vercel.app",
  );
});

test("fails when VERCEL_URL is missing in Preview", () => {
  assert.throws(
    () => resolveAppUrl({ VERCEL_TARGET_ENV: "preview" }),
    invalidAppUrl,
  );
});

test("rejects a malformed VERCEL_URL", () => {
  assert.throws(
    () =>
      resolveAppUrl({
        VERCEL_TARGET_ENV: "preview",
        VERCEL_URL: "preview host.vercel.app",
      }),
    invalidAppUrl,
  );
});

test("rejects an unsafe non-HTTPS VERCEL_URL value", () => {
  assert.throws(
    () =>
      resolveAppUrl({
        VERCEL_TARGET_ENV: "preview",
        VERCEL_URL: "http://unsafe.example.com",
      }),
    invalidAppUrl,
  );
});

test("uses an explicit APP_URL in Production", () => {
  assert.equal(
    resolveAppUrl({
      APP_URL: "https://app.frangroove.com",
      VERCEL_TARGET_ENV: "production",
      VERCEL_URL: "production-deployment.vercel.app",
    }),
    "https://app.frangroove.com",
  );
});

test("fails closed in Production without explicit APP_URL", () => {
  assert.throws(
    () =>
      resolveAppUrl({
        VERCEL_TARGET_ENV: "production",
        VERCEL_URL: "production-deployment.vercel.app",
      }),
    invalidAppUrl,
  );
});

test("fails closed outside Vercel Preview without explicit APP_URL", () => {
  assert.throws(
    () =>
      resolveAppUrl({
        VERCEL_TARGET_ENV: "development",
        VERCEL_URL: "development-deployment.vercel.app",
      }),
    invalidAppUrl,
  );
});

test("does not use branch or Production URLs as Preview fallbacks", () => {
  assert.throws(
    () =>
      resolveAppUrl({
        VERCEL_TARGET_ENV: "preview",
        VERCEL_BRANCH_URL: "ignored-branch.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "ignored-production.vercel.app",
      }),
    invalidAppUrl,
  );
});
