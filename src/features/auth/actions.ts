"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAuthRateLimit } from "@/server/rate-limit";
import { redirect } from "next/navigation";

/**
 * Sends a passwordless 6-digit OTP code to the provided email address.
 */
export async function sendOtpAction(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const rateLimit = checkAuthRateLimit(email);
  if (!rateLimit.allowed) {
    return { error: "Too many authentication attempts. Please wait a minute before trying again." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Verifies the 6-digit OTP code sent to the email.
 */
export async function verifyOtpAction(email: string, token: string) {
  if (!email || !token) {
    return { error: "Email and verification code are required." };
  }

  const rateLimit = checkAuthRateLimit(email);
  if (!rateLimit.allowed) {
    return { error: "Too many attempts. Please wait a minute before trying again." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: token.trim(),
    type: "email",
  });

  if (error) {
    return { error: "That code is invalid or expired. Please request a new one." };
  }

  return { success: true };
}

/**
 * Signs out the current user session and redirects to /login.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
