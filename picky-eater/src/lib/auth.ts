"use client";

import { createClient, isAuthError, type AuthChangeEvent, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";

// Supabase runs entirely in the browser with the public key. Row Level Security
// (supabase/schema.sql) is what keeps each user's row private.
// If the env vars are missing, accounts are simply hidden and the app runs guest-only,
// which also keeps Demo mode working with no setup.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const authEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!authEnabled || typeof window === "undefined") return null;
  client ??= createClient(SUPABASE_URL!, SUPABASE_KEY!);
  return client;
}

/* ---------- Session as an external store ---------- */

type SessionListener = (event: AuthChangeEvent, session: Session | null) => void;

let session: Session | null | undefined = undefined; // undefined = still checking
const reactListeners = new Set<() => void>();
const sessionListeners = new Set<SessionListener>();
let started = false;

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  const supabase = getSupabase();
  if (!supabase) {
    session = null;
    return;
  }
  // Fires INITIAL_SESSION right away, then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED.
  supabase.auth.onAuthStateChange((event, s) => {
    session = s;
    reactListeners.forEach((l) => l());
    sessionListeners.forEach((l) => l(event, s));
  });
}

/** For non-React code (preference sync). */
export function onSessionChange(listener: SessionListener) {
  ensureStarted();
  sessionListeners.add(listener);
  // If the session was already known before this listener subscribed, replay it
  // so late subscribers don't miss the initial login state.
  if (session !== undefined) listener("INITIAL_SESSION", session);
  return () => sessionListeners.delete(listener);
}

export function getSession() {
  return session;
}

/** `undefined` while checking, `null` when signed out (or accounts disabled). */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(
    (cb) => {
      ensureStarted();
      reactListeners.add(cb);
      return () => reactListeners.delete(cb);
    },
    () => session,
    () => undefined,
  );
}

/* ---------- Actions ---------- */

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; message: string };

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: "Accounts aren't set up in this version." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, message: friendlyAuthError(error) } : { ok: true };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: "Accounts aren't set up in this version." };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/login?confirmed=1` },
  });
  if (error) return { ok: false, message: friendlyAuthError(error) };
  // No session means the project requires email confirmation first.
  return { ok: true, needsConfirmation: !data.session };
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}

/** Plain-language versions of Supabase's error codes. */
function friendlyAuthError(error: unknown): string {
  if (!isAuthError(error)) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match. Please try again.";
    case "user_already_exists":
    case "email_exists":
      return "There's already an account with this email. Try logging in instead.";
    case "weak_password":
      return "Please choose a longer password (at least 8 characters).";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox for our link.";
    case "email_address_invalid":
      return "That email address doesn't look right.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many tries. Please wait a minute and try again.";
    default:
      return error.status === 0 || error.name === "AuthRetryableFetchError"
        ? "You seem to be offline. You can keep going as a guest."
        : "Something went wrong. Please try again.";
  }
}
