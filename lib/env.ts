import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  APP_URL: z.url(),
});

const adminEnvironmentSchema = publicEnvironmentSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const persistenceModeSchema = z.enum(["demo", "supabase"]);

function parseEnvironment<T extends z.ZodType>(schema: T): z.output<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid authentication environment configuration: ${names}`);
  }

  return result.data;
}

export function getPublicEnvironment() {
  return parseEnvironment(publicEnvironmentSchema);
}

export function getAdminEnvironment() {
  return parseEnvironment(adminEnvironmentSchema);
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

  if (process.env.NODE_ENV === "production" && result.data === "demo") {
    throw new Error("Production cannot use demo persistence.");
  }

  return result.data;
}
