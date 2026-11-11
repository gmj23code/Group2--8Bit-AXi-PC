"use client";

import { useEffect } from "react";
import { startPreferenceSync } from "@/lib/preferences-store";

/** Invisible: starts listening for login/logout so preferences follow the account. */
export function AuthSync() {
  useEffect(() => {
    startPreferenceSync();
  }, []);
  return null;
}
