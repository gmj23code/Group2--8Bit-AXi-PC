"use client";

import { useId, useRef, useState } from "react";
import { CUSTOM_MAX_COUNT, CUSTOM_MAX_LENGTH, matchBuiltIn, normalizeEntry, type Option } from "@/lib/options";
import { Icon } from "./Icon";

type RuleChipsProps = {
  kind: "diet" | "allergy";
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  /** The user's own "+ Other" entries for this section. */
  custom: string[];
  onCustomChange: (entries: string[]) => void;
};

const chip = "min-h-12 px-4 rounded-full border text-base font-medium inline-flex items-center gap-2 transition-colors";
const chipOn = "bg-brand text-white border-brand";
const chipOff = "bg-surface text-ink border-line-strong hover:bg-subtle";

/**
 * Searchable multi-select chips plus an "+ Other" option for anything not in the list.
 * Built-in chips are toggle buttons (aria-pressed); custom entries are always "on" and
 * have their own remove button. Every state change is also announced in words.
 */
export function RuleChips({ kind, options, selected, onToggle, custom, onCustomChange }: RuleChipsProps) {
  const noun = kind === "diet" ? "diets" : "allergies";
  const ids = useId();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const draftRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const shown = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.aliases?.some((a) => a.includes(q)))
    : options;
  const count = selected.length + custom.length;

  function openAdd(prefill = "") {
    setAdding(true);
    setDraft(prefill);
    setMessage(null);
    // Focus after the panel renders.
    setTimeout(() => draftRef.current?.focus(), 0);
  }

  function add(text: string) {
    const entry = normalizeEntry(text);
    if (!entry) return setMessage("Type something first.");

    const builtIn = matchBuiltIn(options, entry);
    if (builtIn) {
      if (!selected.includes(builtIn.id)) onToggle(builtIn.id);
      setDraft("");
      setQuery("");
      return setMessage(`“${builtIn.label}” is already in the list, so we selected it for you.`);
    }
    if (custom.some((c) => c.toLowerCase() === entry.toLowerCase())) return setMessage(`You already added “${entry}”.`);
    if (custom.length >= CUSTOM_MAX_COUNT) return setMessage(`You can add up to ${CUSTOM_MAX_COUNT} of your own.`);

    onCustomChange([...custom, entry]);
    setDraft("");
    setQuery("");
    setMessage(`Added “${entry}”. It's treated as a hard no.`);
    draftRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <label htmlFor={`${ids}-search`} className="sr-only">
            Search {noun}
          </label>
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
          <input
            id={`${ids}-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${noun}`}
            autoComplete="off"
            className="w-full min-h-12 pl-11 pr-4 rounded-xl border border-line-strong bg-surface text-base placeholder:text-ink-soft"
          />
        </div>
        <p className="shrink-0 text-sm text-ink-soft tabular-nums" aria-live="polite">
          {count} selected
        </p>
      </div>

      {/* Chips */}
      <div role="group" aria-label={kind === "diet" ? "Diets" : "Allergies"} className="flex flex-wrap gap-2.5">
        {shown.map((opt) => {
          const isOn = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(opt.id)}
              className={`${chip} ${isOn ? chipOn : chipOff}`}
            >
              {isOn && <Icon name="check" size={18} />}
              {opt.label}
            </button>
          );
        })}

        {/* The user's own entries: always shown, each removable. */}
        {custom.map((entry) => (
          <span key={entry} className={`${chip} ${chipOn} pr-1.5`}>
            <Icon name="check" size={18} />
            {entry}
            <button
              type="button"
              onClick={() => {
                onCustomChange(custom.filter((c) => c !== entry));
                setMessage(`Removed “${entry}”.`);
              }}
              aria-label={`Remove ${entry}`}
              className="ml-1 w-9 h-9 grid place-items-center rounded-full hover:bg-white/15"
            >
              <Icon name="x" size={18} />
            </button>
          </span>
        ))}

        <button
          type="button"
          aria-expanded={adding}
          aria-controls={`${ids}-add`}
          onClick={() => (adding ? setAdding(false) : openAdd())}
          className={`${chip} border-dashed ${adding ? "bg-subtle border-ink-soft" : "bg-surface border-line-strong hover:bg-subtle"}`}
        >
          <Icon name="plus" size={18} /> Other
        </button>
      </div>

      {q && shown.length === 0 && !adding && (
        <div className="rounded-xl bg-subtle px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <p>No match for “{query.trim()}”.</p>
          <button
            type="button"
            onClick={() => openAdd(query.trim())}
            className="self-start min-h-12 px-4 rounded-lg font-semibold text-brand hover:bg-brand-soft inline-flex items-center gap-2"
          >
            <Icon name="plus" size={18} /> Add it as your own
          </button>
        </div>
      )}

      {/* "+ Other" panel */}
      {adding && (
        <div id={`${ids}-add`} className="rounded-xl border border-line bg-subtle/60 p-4">
          <label htmlFor={`${ids}-draft`} className="block font-medium">
            Add your own {kind === "diet" ? "diet or food rule" : "allergy"}
          </label>
          <p id={`${ids}-hint`} className="text-sm text-ink-soft mt-0.5 mb-3">
            {kind === "diet" ? "For example “no mushrooms” or “no raw fish”." : "For example “pine nuts” or “strawberries”."} Each one
            is treated as a hard no.
          </p>
          <div className="flex gap-2">
            <input
              ref={draftRef}
              id={`${ids}-draft`}
              type="text"
              value={draft}
              maxLength={CUSTOM_MAX_LENGTH}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // don't submit the whole form
                  add(draft);
                }
                if (e.key === "Escape") setAdding(false);
              }}
              aria-describedby={`${ids}-hint`}
              autoComplete="off"
              className="flex-1 min-w-0 min-h-12 px-4 rounded-xl border border-line-strong bg-surface text-base"
            />
            <button
              type="button"
              onClick={() => add(draft)}
              className="shrink-0 min-h-12 px-5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft tabular-nums">
              {draft.length}/{CUSTOM_MAX_LENGTH}
            </p>
            <button type="button" onClick={() => setAdding(false)} className="min-h-12 px-3 rounded-lg font-medium text-ink-soft hover:text-ink">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Announces adds, removes, and problems. */}
      <p aria-live="polite" className="text-sm text-ink-soft empty:hidden">
        {message}
      </p>
    </div>
  );
}
