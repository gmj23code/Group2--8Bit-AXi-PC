"use client";

import { z } from "zod";
import { getSession, getSupabase, onSessionChange } from "./auth";
import { AnalysisSchema, PreferencesSchema, type Preferences } from "./schema";
import { createStorageStore } from "./storage-store";

// How preferences are stored:
// - localStorage is ALWAYS the copy the UI reads, so screens load instantly and work offline.
// - When logged in, every save also goes to Supabase, and on login we pull the account's
//   saved copy down. Pages only ever call usePreferences() / savePreferences().

const prefsStore = createStorageStore("picky-eater:preferences", PreferencesSchema);
export const usePreferences = prefsStore.use;

/** `warning` = saved on this device, but the account copy didn't update (non-blocking). */
export type SaveResult = { ok: true; warning?: string } | { ok: false; message: string };

export async function savePreferences(prefs: Preferences): Promise<SaveResult> {
  if (!prefsStore.save(prefs)) {
    return { ok: false, message: "We couldn't save on this device. Your browser may be blocking storage." };
  }
  const userId = getSession()?.user.id;
  if (!userId) return { ok: true };

  const { error } = await pushToCloud(userId, prefs);
  if (error) {
    console.error("[prefs] cloud save failed:", error.message);
    return { ok: true, warning: "Saved on this device, but we couldn't reach your account. Save again when you're online." };
  }
  return { ok: true };
}

// The database uses snake_case column names; map explicitly both ways.
const CLOUD_COLUMNS = "restrictions, allergies, goals, custom_restrictions, custom_allergies, notes";

function pushToCloud(userId: string, prefs: Preferences) {
  return getSupabase()!.from("preferences").upsert({
    user_id: userId,
    restrictions: prefs.restrictions,
    allergies: prefs.allergies,
    goals: prefs.goals,
    custom_restrictions: prefs.customRestrictions,
    custom_allergies: prefs.customAllergies,
    notes: prefs.notes,
    updated_at: new Date().toISOString(),
  });
}

type CloudRow = {
  restrictions: string[];
  allergies: string[];
  goals: string[];
  custom_restrictions: string[] | null;
  custom_allergies: string[] | null;
  notes: string;
};

function fromCloud(row: CloudRow) {
  return PreferencesSchema.safeParse({
    restrictions: row.restrictions,
    allergies: row.allergies,
    goals: row.goals,
    customRestrictions: row.custom_restrictions ?? [],
    customAllergies: row.custom_allergies ?? [],
    notes: row.notes,
  });
}

/**
 * On login: if the account has saved preferences, use them on this device.
 * If it doesn't (brand-new account), upload what the user picked as a guest,
 * so nothing they set up before signing up is lost.
 */
async function syncOnLogin(userId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data, error } = await supabase
    .from("preferences")
    .select(CLOUD_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle<CloudRow>();
  if (error) {
    // Most likely cause after an update: the new columns haven't been added yet
    // (run the "Upgrade" block in supabase/schema.sql).
    console.error("[prefs] cloud load failed:", error.message);
    return; // keep using the local copy
  }
  if (data) {
    const parsed = fromCloud(data);
    if (parsed.success) prefsStore.save(parsed.data);
  } else {
    const local = prefsStore.read();
    if (local) await pushToCloud(userId, local);
  }
}

/** Run the login sync right now and wait for it (used by the login screen before redirecting). */
export async function syncPreferencesNow(): Promise<Preferences | null> {
  const userId = getSession()?.user.id;
  if (userId) await syncOnLogin(userId);
  return prefsStore.read();
}

let syncStarted = false;
/** Called once from <AuthSync /> in the root layout. */
export function startPreferenceSync() {
  if (syncStarted) return;
  syncStarted = true;
  onSessionChange((event, session) => {
    if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session) {
      // Supabase advises against awaiting its own calls inside this callback; defer.
      setTimeout(() => void syncOnLogin(session.user.id), 0);
    }
    if (event === "SIGNED_OUT") {
      // Shared phones/tablets: don't leave one person's diet info for the next person.
      prefsStore.clear();
      analysisStore.clear();
    }
  });
}

/** Demo mode: sample menu + mocked results, no network or API key needed. */
const demoStore = createStorageStore("picky-eater:demo-mode", z.boolean());
export function useDemoMode() {
  return demoStore.use() ?? false;
}
export const setDemoMode = demoStore.save;

/** Latest scan results. Session-only: they're about this restaurant visit. */
export const analysisStore = createStorageStore("picky-eater:analysis", AnalysisSchema, "session");
export const useAnalysis = analysisStore.use;
