"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Protects unsaved edits on a page. Three layers, from friendliest to last-resort:
 * 1. In-app links (header logo, Settings, etc.) are intercepted while `dirty`, and
 *    `pendingHref` is set so the page can ask "Save changes?".
 * 2. If the page unmounts some other way (e.g. the browser back gesture), `onAutoSave`
 *    runs so selections are never silently lost.
 * 3. Reloading or closing the tab triggers the browser's own "Leave site?" warning.
 */
export function useUnsavedGuard(dirty: boolean, onAutoSave: () => void) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const dirtyRef = useRef(dirty);
  const autoSaveRef = useRef(onAutoSave);
  const skipAutoSave = useRef(false);

  useEffect(() => {
    dirtyRef.current = dirty;
    autoSaveRef.current = onAutoSave;
  });

  // 1. Intercept same-site link clicks (capture phase runs before Next's <Link> handler).
  useEffect(() => {
    if (!dirty) return;
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  // 3. Reload / close tab.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // 2. Leaving any other way: save automatically.
  useEffect(
    () => () => {
      if (dirtyRef.current && !skipAutoSave.current) autoSaveRef.current();
    },
    [],
  );

  return {
    pendingHref,
    /** Ask before going somewhere (used by the page's own Back button). */
    requestLeave: (href: string) => setPendingHref(href),
    cancelLeave: () => setPendingHref(null),
    /**
     * Turn the unmount auto-save off/on. Off before an explicit save (so a save that
     * re-renders the page doesn't save twice) and after the user chose "Don't save".
     */
    setAutoSave: (enabled: boolean) => {
      skipAutoSave.current = !enabled;
    },
  };
}
