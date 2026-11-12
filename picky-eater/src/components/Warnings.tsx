import type { MenuItem } from "@/lib/schema";
import { Icon } from "./Icon";

/**
 * The two safety messages, used on cards and the detail screen:
 * red = breaks a hard rule; amber = can't confirm, ask staff.
 * Each has an icon and a plain-words lead-in, not just a color.
 */
export function Warnings({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  const box = `flex gap-2.5 rounded-lg ${compact ? "px-3 py-2 text-[0.95rem]" : "p-4"}`;
  return (
    <>
      {item.violatesRestrictions.length > 0 && (
        <p className={`${box} bg-bad-bg text-bad`}>
          <Icon name="ban" size={compact ? 18 : 20} className="mt-0.5" />
          <span>
            <strong className="font-semibold">Not safe for you:</strong> {item.violatesRestrictions.join(", ")}
          </span>
        </p>
      )}
      {item.violatesRestrictions.length === 0 && item.verdict === "ask_server" && (
        <p className={`${box} bg-meh-bg text-meh`}>
          <Icon name="help" size={compact ? 18 : 20} className="mt-0.5" />
          <span>
            <strong className="font-semibold">Ask your server</strong>
            {item.askAbout.length > 0 ? ` about: ${item.askAbout.join(", ")}` : " before ordering"}
          </span>
        </p>
      )}
    </>
  );
}
