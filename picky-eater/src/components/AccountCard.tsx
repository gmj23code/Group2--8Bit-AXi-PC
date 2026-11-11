"use client";

import { useState } from "react";
import { authEnabled, signOut, useSession } from "@/lib/auth";
import { Button, ButtonLink } from "./Button";

/** Top of Settings: who you are and where your preferences are saved. */
export function AccountCard() {
  const session = useSession();
  const [busy, setBusy] = useState(false);

  if (!authEnabled || session === undefined) return null;

  if (!session) {
    return (
      <div className="rounded-card bg-lavender p-4 flex flex-col gap-3">
        <p className="text-lg">
          <strong>You&apos;re a guest.</strong> Your preferences are saved on this device only.
        </p>
        <ButtonLink href="/login" variant="secondary" className="w-full">
          Log in or sign up to save them
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-brand-soft p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg min-w-0">
        <span className="block text-ink-soft">Saved to your account</span>
        <strong className="block truncate">{session.user.email}</strong>
      </p>
      <Button
        variant="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await signOut(); // preferences on this device are cleared on sign-out
          setBusy(false);
        }}
      >
        {busy ? "Logging out…" : "Log out"}
      </Button>
    </div>
  );
}
