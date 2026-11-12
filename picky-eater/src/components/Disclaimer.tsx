import { Icon } from "./Icon";

export function Disclaimer() {
  return (
    <p className="flex gap-2.5 rounded-lg border border-line bg-surface px-4 py-3 text-[0.95rem] text-ink-soft">
      <Icon name="info" size={18} className="mt-0.5" />
      <span>AI estimates may be wrong. Always confirm allergens with restaurant staff.</span>
    </p>
  );
}
