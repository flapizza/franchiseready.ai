import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const adminEnvironmentSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const appUrlSchema = z.url();

const persistenceModeSchema = z.enum(["demo", "supabase"]);

const googleOAuthEnvironmentSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_OAUTH_REDIRECT_URI: z.url(),
  GOOGLE_TOKEN_ENCRYPTION_KEY: z.string().min(1),
});

const emailAddressSchema = z.email();

function normalizeResendSenderMailbox(value: string): string | null {
  const mailbox = value.trim();
  if (!mailbox || /[\u0000-\u001f\u007f]/.test(mailbox)) return null;

  if (emailAddressSchema.safeParse(mailbox).success) return mailbox;

  const match = /^([^<>]+)<([^<>]+)>$/.exec(mailbox);
  if (!match) return null;

  const displayName = match[1].trim();
  const address = match[2].trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9 .'-]{0,99}$/.test(displayName)) return null;
  if (!emailAddressSchema.safeParse(address).success) return null;

  return `${displayName} <${address}>`;
}

const resendSenderMailboxSchema = z.string().transform((value, context) => {
  const mailbox = normalizeResendSenderMailbox(value);
  if (mailbox) return mailbox;

  context.addIssue({ code: "custom", message: "Invalid sender mailbox" });
  return z.NEVER;
});

const resendEnvironmentSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  RESEND_WEBHOOK_SECRET: z.string().regex(/^whsec_[A-Za-z0-9+/=_-]+$/),
  RESEND_FROM_EMAIL: resendSenderMailboxSchema,
});

const campaignDeliveryWorkerEnvironmentSchema = z.object({
  CAMPAIGN_DELIVERY_WORKER_SECRET: z.string().min(32),
});

function parseEnvironment<T extends z.ZodType>(schema: T): z.output<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid authentication environment configuration: ${names}`);
  }

  return result.data;
}

function invalidAppUrl(): never {
  throw new Error("Invalid authentication environment configuration: APP_URL");
}

export function resolveAppUrl(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  if (environment.APP_URL !== undefined) {
    const explicit = appUrlSchema.safeParse(environment.APP_URL);
    if (!explicit.success) invalidAppUrl();
    return explicit.data;
  }

  if (environment.VERCEL_TARGET_ENV !== "preview") invalidAppUrl();

  const hostname = environment.VERCEL_URL;
  if (!hostname || hostname !== hostname.trim()) invalidAppUrl();

  const derived = `https://${hostname}`;
  const parsed = appUrlSchema.safeParse(derived);
  if (!parsed.success) invalidAppUrl();

  const url = new URL(parsed.data);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.host !== hostname
  ) {
    invalidAppUrl();
  }

  return url.origin;
}

export function getPublicEnvironment() {
  return {
    ...parseEnvironment(publicEnvironmentSchema),
    APP_URL: resolveAppUrl(),
  };
}

export function getAdminEnvironment() {
  return {
    ...getPublicEnvironment(),
    ...parseEnvironment(adminEnvironmentSchema),
  };
}

export function getGoogleOAuthEnvironment() {
  const environment = parseEnvironment(googleOAuthEnvironmentSchema);
  const key = Buffer.from(environment.GOOGLE_TOKEN_ENCRYPTION_KEY, "base64");
  if (key.length !== 32) {
    throw new Error("Invalid authentication environment configuration: GOOGLE_TOKEN_ENCRYPTION_KEY");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Google OAuth credential encryption requires a managed KMS cipher in production.");
  }
  return environment;
}

export type ResendEnvironment = z.infer<typeof resendEnvironmentSchema>;

export function getResendEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): ResendEnvironment | null {
  const result = resendEnvironmentSchema.safeParse(environment);
  return result.success ? result.data : null;
}

export function getCampaignDeliveryWorkerEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const result = campaignDeliveryWorkerEnvironmentSchema.safeParse(environment);
  return result.success ? result.data : null;
}

export type PersistenceMode = z.infer<typeof persistenceModeSchema>;

export function getPersistenceMode(): PersistenceMode {
  const configured = process.env.PERSISTENCE_MODE;
  const implicitDemo =
    process.env.NODE_ENV === "development" ||
    process.env.PLAYWRIGHT_TEST_MODE === "true";
  const result = persistenceModeSchema.safeParse(
    configured ?? (implicitDemo ? "demo" : undefined),
  );

  if (!result.success) {
    throw new Error(
      "PERSISTENCE_MODE must be explicitly set to demo or supabase.",
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.PLAYWRIGHT_TEST_MODE !== "true" &&
    result.data === "demo"
  ) {
    throw new Error("Production cannot use demo persistence.");
  }

  return result.data;
}
