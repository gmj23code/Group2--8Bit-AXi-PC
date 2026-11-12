"use client";

import { authEnabled, useSession } from "@/lib/auth";
import { usePreferences } from "@/lib/preferences-store";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";

/** Returning users go straight to scanning; new users start with an account (or guest). */
export function WelcomeActions() {
  const prefs = usePreferences();
  const session = useSession();

  // Reserve the space while loading so the page doesn't jump.
  if (prefs === undefined || session === undefined) return <div className="h-14" />;

  const row = "w-full flex flex-col sm:flex-row gap-3";

  if (prefs) {
    return (
      <div className={row}>
        <ButtonLink href="/scan" className="sm:flex-1">
          <Icon name="camera" /> Scan a menu
        </ButtonLink>
        <ButtonLink href="/settings" variant="secondary" className="sm:flex-1">
          Edit my preferences
        </ButtonLink>
      </div>
    );
  }

  if (!authEnabled || session) {
    return (
      <ButtonLink href="/preferences" className="w-full sm:w-auto sm:self-start sm:px-10">
        Get started
      </ButtonLink>
    );
  }

  return (
    <div className={row}>
      <ButtonLink href="/login" className="sm:flex-1">
        Get started
      </ButtonLink>
      <ButtonLink href="/login?mode=login" variant="secondary" className="sm:flex-1">
        I already have an account
      </ButtonLink>
    </div>
  );
}
