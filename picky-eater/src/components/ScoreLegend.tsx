import { Icon } from "./Icon";
import { bandFor } from "./ScoreBadge";

const ROWS = [
  { score: 90, range: "80–100", text: "Fits your goals really well" },
  { score: 65, range: "50–79", text: "A good choice" },
  { score: 35, range: "20–49", text: "Not ideal for your goals" },
  { score: 10, range: "0–19", text: "A poor fit for your goals" },
];

/** Collapsible "How scores work". Uses <details>, so it's accessible with no extra code. */
export function ScoreLegend() {
  return (
    <details className="group rounded-card bg-surface border border-line shadow-card">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-5 min-h-14 font-semibold">
        How do scores work?
        <Icon name="chevronDown" className="text-ink-soft transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">
        <p className="text-ink-soft">
          Each dish is scored from 0 to 100 against your health goals. Your #1 goal counts the most.
        </p>
        <ul className="mt-4 flex flex-col divide-y divide-line">
          {ROWS.map((r) => {
            const band = bandFor({ score: r.score, violatesRestrictions: [] });
            return (
              <li key={r.range} className="flex items-center gap-3 py-2.5">
                <span className={`w-24 shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-center ${band.bg} ${band.text}`}>
                  {band.label}
                </span>
                <span className="tabular-nums text-ink-soft w-16 shrink-0">{r.range}</span>
                <span>{r.text}</span>
              </li>
            );
          })}
          <li className="flex items-center gap-3 py-2.5">
            <span className="w-24 shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-center bg-bad-bg text-bad">Not safe</span>
            <span className="tabular-nums text-ink-soft w-16 shrink-0">0–10</span>
            <span>Breaks your diet or allergies</span>
          </li>
        </ul>
      </div>
    </details>
  );
}
