"use client";

import { authEnabled, useSession } from "@/lib/auth";
import { usePreferences } from "@/lib/preferences-store";
import { ButtonLink } from "./Button";

/** Returning users go straight to scanning; new users start with an account (or guest). */
export function WelcomeActions() {
  const prefs = usePreferences();
  const session = useSession();

  // Reserve the space while loading so the page doesn't jump.
  if (prefs === undefined || session === undefined) return <div className="h-14" />;

  if (prefs) {
    return (
      <div className="w-full flex flex-col gap-3">
        <ButtonLink href="/scan" className="w-full">
          📸 Scan a menu
        </ButtonLink>
        <ButtonLink href="/settings" variant="secondary" className="w-full">
          Edit my preferences
        </ButtonLink>
      </div>
    );
  }

  if (!authEnabled || session) {
    return (
      <ButtonLink href="/preferences" className="w-full">
        Get started
      </ButtonLink>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <ButtonLink href="/login" className="w-full">
        Get started
      </ButtonLink>
      <ButtonLink href="/login?mode=login" variant="secondary" className="w-full">
        I already have an account
      </ButtonLink>
    </div>
  );
}
