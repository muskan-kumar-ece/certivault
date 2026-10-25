import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for client components.
 * Strictly uses public anon key.
 */
export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase URL or Anon/Publishable Key environment variables."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
