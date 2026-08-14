/**
 * @turbo/supabase - Supabase client package for the Turbo monorepo
 *
 * This package provides platform-agnostic Supabase client creation utilities
 * that work across Next.js, Expo, and other environments.
 *
 * @example
 * ```ts
 * import { createSupabaseClient, createAuthenticatedSupabaseClient } from "@turbo/supabase";
 *
 * // Anonymous client
 * const supabase = createSupabaseClient(url, anonKey);
 *
 * // Authenticated client with JWT
 * const authSupabase = createAuthenticatedSupabaseClient(url, anonKey, token);
 * ```
 */

export {
  createSupabaseClient,
  createAuthenticatedSupabaseClient,
} from "./client";

export type { SupabaseClient, SupabaseClientOptions } from "./client";
