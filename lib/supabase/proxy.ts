import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnvironment } from "@/lib/env";

export type RefreshedSession = {
  isAuthenticated: boolean;
  response: NextResponse;
};

export async function refreshSupabaseSession(
  request: NextRequest,
): Promise<RefreshedSession> {
  const environment = getPublicEnvironment();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  return {
    isAuthenticated: Boolean(claims?.sub),
    response,
  };
}

export function redirectWithSession(
  destination: URL,
  sessionResponse: NextResponse,
) {
  const response = NextResponse.redirect(destination);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  const cacheControl = sessionResponse.headers.get("cache-control");
  if (cacheControl) {
    response.headers.set("cache-control", cacheControl);
  }

  return response;
}
