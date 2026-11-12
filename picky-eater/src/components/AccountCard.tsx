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
      <div className="rounded-card bg-surface border border-line p-5 flex flex-col gap-3 shadow-card">
        <p>
          <strong className="font-semibold">You&apos;re a guest.</strong> Your preferences are saved on this device only.
        </p>
        <ButtonLink href="/login" variant="secondary" className="w-full">
          Log in or sign up to save them
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-surface border border-line p-5 shadow-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-w-0">
        <span className="block text-sm text-ink-soft">Saved to your account</span>
        <strong className="block truncate font-semibold">{session.user.email}</strong>
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
