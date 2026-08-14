import type {
  SupabaseClient,
  SupabaseClientOptions,
} from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

export type { SupabaseClient, SupabaseClientOptions };

/**
 * Creates a Supabase client for anonymous access.
 * This client uses the anon key and is suitable for public operations.
 *
 * @param supabaseUrl - The Supabase project URL
 * @param supabaseAnonKey - The Supabase anonymous key
 * @param options - Optional Supabase client options
 * @returns A Supabase client instance
 *
 * @example
 * ```ts
 * // In Next.js (apps/web)
 * import { env } from "@/env";
 * const supabase = createSupabaseClient(
 *   env.NEXT_PUBLIC_SUPABASE_URL,
 *   env.NEXT_PUBLIC_SUPABASE_ANON_KEY
 * );
 *
 * // In Expo (apps/mobile)
 * const supabase = createSupabaseClient(
 *   process.env.EXPO_PUBLIC_SUPABASE_URL!,
 *   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
 * );
 * ```
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: SupabaseClientOptions<"public">,
) {
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

/**
 * Creates an authenticated Supabase client using a custom JWT.
 * This enables Row Level Security (RLS) policies to work with external auth providers.
 *
 * Use this when you need to access Supabase resources with user-specific permissions.
 *
 * @param supabaseUrl - The Supabase project URL
 * @param supabaseAnonKey - The Supabase anonymous key
 * @param accessToken - A JWT token (e.g., from BetterAuth session)
 * @param options - Optional additional Supabase client options
 * @returns A Supabase client instance configured with the access token
 *
 * @example
 * ```ts
 * // On the server, get the user's session and create an authenticated client
 * const session = await getSession();
 * if (session?.session?.token) {
 *   const supabase = createAuthenticatedSupabaseClient(
 *     env.NEXT_PUBLIC_SUPABASE_URL,
 *     env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *     session.session.token
 *   );
 *   const { data } = await supabase.from('posts').select('*');
 * }
 * ```
 */
export function createAuthenticatedSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  accessToken: string,
  options?: SupabaseClientOptions<"public">,
) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    ...options,
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
