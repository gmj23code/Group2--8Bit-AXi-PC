"use client";

import { useEffect, useState } from "react";

// Asks the server once whether live AI scanning is set up (an API key exists).
// Offline or any error → treated as "not available", which shows the sample menus.

let cached: Promise<boolean> | null = null;

function fetchLiveScanning(): Promise<boolean> {
  cached ??= fetch("/api/status")
    .then((r) => r.json())
    .then((j) => Boolean(j?.liveScanning))
    .catch(() => {
      cached = null; // try again next time (e.g. back online)
      return false;
    });
  return cached;
}

/** `undefined` while checking, then true/false. */
export function useLiveScanning(): boolean | undefined {
  const [live, setLive] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    void fetchLiveScanning().then((v) => {
      if (alive) setLive(v);
    });
    return () => {
      alive = false;
    };
  }, []);
  return live;
}
