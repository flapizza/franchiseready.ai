import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  APP_URL: z.url(),
});

const adminEnvironmentSchema = publicEnvironmentSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

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
