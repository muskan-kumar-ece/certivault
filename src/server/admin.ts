import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client using the service role key.
 *
 * RESTRICTED:
 * - NEVER import into client components.
 * - Used exclusively for worker background jobs, Razorpay webhooks, and `apply_credit_delta`.
 */
export function adminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase URL or Service Role / Secret Key environment variables."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
