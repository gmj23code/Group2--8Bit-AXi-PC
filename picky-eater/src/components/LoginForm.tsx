"use client";

import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authEnabled, signIn, signUp, useSession } from "@/lib/auth";
import { syncPreferencesNow } from "@/lib/preferences-store";
import { Button, ButtonLink } from "./Button";
import { Mascot } from "./Mascot";

type Mode = "login" | "signup";

const input =
  "w-full min-h-14 px-4 rounded-2xl border-2 border-line bg-white text-lg placeholder:text-ink-soft";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const session = useSession();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "login" ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  if (!authEnabled) {
    return (
      <Shell title="Accounts are coming soon">
        <p className="text-lg text-ink-soft">For now, your preferences are saved on this device.</p>
        <ButtonLink href="/preferences" className="w-full">
          Continue as guest
        </ButtonLink>
      </Shell>
    );
  }

  if (session === undefined) return null;

  if (session) {
    return (
      <Shell title="You're logged in">
        <p className="text-lg text-ink-soft">
          Signed in as <strong className="text-ink">{session.user.email}</strong>
        </p>
        <ButtonLink href="/scan" className="w-full">
          📸 Scan a menu
        </ButtonLink>
        <ButtonLink href="/settings" variant="secondary" className="w-full">
          My preferences
        </ButtonLink>
      </Shell>
    );
  }

  if (checkEmail) {
    return (
      <Shell title="Check your email 📬">
        <p className="text-lg">
          We sent a link to <strong>{email}</strong>. Tap it to confirm your account, then come back and log in.
        </p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            setCheckEmail(false);
            setMode("login");
          }}
        >
          I confirmed it, log me in
        </Button>
      </Shell>
    );
  }

  async function handleSubmit() {
    setError(null);
    if (mode === "signup" && password.length < 8) {
      setError("Please choose a password with at least 8 characters.");
      return;
    }
    setBusy(true);
    const result = mode === "login" ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    if (!result.ok) {
      setBusy(false);
      setError(result.message);
      return;
    }
    if (result.needsConfirmation) {
      setBusy(false);
      setCheckEmail(true);
      return;
    }
    // Pull the account's saved preferences (or upload guest ones) before moving on.
    const prefs = await syncPreferencesNow();
    router.push(prefs ? "/scan" : "/preferences");
  }

  const isLogin = mode === "login";

  return (
    <Shell title={isLogin ? "Welcome back" : "Save your preferences"}>
      <p className="text-lg text-ink-soft">
        {isLogin
          ? "Log in to load your saved preferences."
          : "Make a free account so your preferences follow you to every restaurant."}
      </p>

      {params.get("confirmed") && (
        <p role="status" className="rounded-xl bg-great-bg text-great font-extrabold px-4 py-3">
          ✓ Email confirmed! You can log in now.
        </p>
      )}

      {/* Segmented switch between the two modes (toggle buttons, state via aria-pressed). */}
      <div role="group" aria-label="Sign up or log in" className="grid grid-cols-2 gap-2 rounded-full bg-white border-2 border-line p-1">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`min-h-12 rounded-full text-lg font-extrabold ${mode === m ? "bg-brand text-white" : "text-ink"}`}
          >
            {m === "signup" ? "Sign up" : "Log in"}
          </button>
        ))}
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div>
          <label htmlFor="email" className="block font-extrabold text-lg mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-extrabold text-lg mb-1">
            Password
          </label>
          <div className="flex gap-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              aria-describedby={isLogin ? undefined : "password-hint"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              className="shrink-0 min-h-14 px-4 rounded-2xl border-2 border-line bg-white font-bold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {!isLogin && (
            <p id="password-hint" className="text-ink-soft mt-1">
              At least 8 characters.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl border-2 border-bad bg-bad-bg text-bad font-extrabold px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "One moment…" : isLogin ? "Log in" : "Create my account"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-ink-soft font-bold" aria-hidden="true">
        <span className="flex-1 border-t border-line" /> or <span className="flex-1 border-t border-line" />
      </div>
      <ButtonLink href="/preferences" variant="secondary" className="w-full">
        Continue as guest
      </ButtonLink>
      <p className="text-center text-ink-soft">As a guest, your preferences stay on this device only.</p>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pt-8 flex flex-col gap-4">
      <title>{`${title} · Picky Eater`}</title>
      <div className="flex flex-col items-center text-center gap-3">
        <Mascot size={80} />
        <h1 className="text-3xl font-extrabold">{title}</h1>
      </div>
      {children}
    </div>
  );
}
