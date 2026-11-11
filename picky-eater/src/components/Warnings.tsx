import type { MenuItem } from "@/lib/schema";

/**
 * The two safety messages, used on cards and the detail screen:
 * red = breaks a hard rule; amber = can't confirm, ask staff.
 */
export function Warnings({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  const pad = compact ? "px-3 py-2" : "p-4";
  return (
    <>
      {item.violatesRestrictions.length > 0 && (
        <p className={`rounded-xl border-2 border-bad bg-bad-bg text-bad font-extrabold ${pad}`}>
          <span aria-hidden="true">⛔ </span>
          Not safe for you: {item.violatesRestrictions.join(", ")}
        </p>
      )}
      {item.violatesRestrictions.length === 0 && item.verdict === "ask_server" && (
        <p className={`rounded-xl border-2 border-meh bg-meh-bg text-meh font-extrabold ${pad}`}>
          <span aria-hidden="true">🙋 </span>
          Ask your server{item.askAbout.length > 0 ? ` about: ${item.askAbout.join(", ")}` : " before ordering"}
        </p>
      )}
    </>
  );
}
