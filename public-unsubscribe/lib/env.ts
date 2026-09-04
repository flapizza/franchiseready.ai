export interface UnsubscribeEnvironment {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

export function readEnvironment(source: NodeJS.ProcessEnv = process.env): UnsubscribeEnvironment {
  const rawUrl = source.SUPABASE_URL;
  const rawKey = source.SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !rawKey || rawKey.trim() !== rawKey) {
    throw new Error("Unsubscribe service is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Unsubscribe service is unavailable.");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("Unsubscribe service is unavailable.");
  }

  return { supabaseUrl: url.origin, supabasePublishableKey: rawKey };
}
