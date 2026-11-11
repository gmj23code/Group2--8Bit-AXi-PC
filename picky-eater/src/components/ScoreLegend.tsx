import { ScoreBadge } from "./ScoreBadge";

const EXAMPLES = [
  { score: 90, text: "80–100: fits your goals really well" },
  { score: 65, text: "50–79: a good choice" },
  { score: 35, text: "20–49: not ideal for your goals" },
  { score: 10, text: "0–19: a poor fit for your goals" },
];

/** Collapsible "How scores work". Uses <details>, so it's accessible with no extra code. */
export function ScoreLegend() {
  return (
    <details className="rounded-card bg-white border-2 border-line p-4">
      <summary className="cursor-pointer font-extrabold text-lg min-h-8">How do scores work?</summary>
      <p className="mt-3 text-ink-soft">
        Each dish gets a score from 0 to 100 based on your health goals. Your #1 goal counts the most.
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {EXAMPLES.map((e) => (
          <li key={e.score} className="flex items-center gap-3">
            <ScoreBadge item={{ score: e.score, violatesRestrictions: [] }} />
            <span className="font-bold">{e.text}</span>
          </li>
        ))}
        <li className="flex items-center gap-3">
          <ScoreBadge item={{ score: 0, violatesRestrictions: ["x"] }} />
          <span className="font-bold">Breaks your diet or allergies. Always scored 0–10.</span>
        </li>
      </ul>
    </details>
  );
}
