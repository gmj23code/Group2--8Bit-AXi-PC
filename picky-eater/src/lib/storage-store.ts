"use client";

import { useSyncExternalStore } from "react";
import type { z } from "zod";

/**
 * A tiny typed store backed by localStorage or sessionStorage, readable from React
 * via useSyncExternalStore (no effects, no hydration flicker of stale state).
 * Bad or missing data reads as `null`; blocked storage (private mode) fails softly.
 */
export function createStorageStore<S extends z.ZodType>(
  key: string,
  schema: S,
  area: "local" | "session" = "local",
) {
  type T = z.infer<S>;
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T | null = null;

  const storage = () => (area === "local" ? window.localStorage : window.sessionStorage);

  function read(): T | null {
    let raw: string | null = null;
    try {
      raw = storage().getItem(key);
    } catch {}
    // Return the same object until the stored string changes (required by useSyncExternalStore).
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = null;
      if (raw) {
        try {
          const result = schema.safeParse(JSON.parse(raw));
          cachedValue = result.success ? result.data : null;
        } catch {}
      }
    }
    return cachedValue;
  }

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    window.addEventListener("storage", onChange); // keeps other tabs in sync
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  }

  return {
    read,
    save(value: T): boolean {
      try {
        storage().setItem(key, JSON.stringify(value));
        listeners.forEach((l) => l());
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        storage().removeItem(key);
      } catch {}
      listeners.forEach((l) => l());
    },
    /** `undefined` while loading (server render / first paint), `null` if nothing saved. */
    use(): T | null | undefined {
      return useSyncExternalStore(subscribe, read, () => undefined);
    },
  };
}
