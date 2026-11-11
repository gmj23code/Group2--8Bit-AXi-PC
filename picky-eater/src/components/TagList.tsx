export function TagList({ tags, max }: { tags: string[]; max?: number }) {
  const shown = max ? tags.slice(0, max) : tags;
  if (shown.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Tags">
      {shown.map((t) => (
        <li key={t} className="rounded-full bg-lavender px-3 py-1 text-sm font-bold">
          {t}
        </li>
      ))}
      {max && tags.length > max && (
        <li className="rounded-full px-2 py-1 text-sm font-bold text-ink-soft">+{tags.length - max} more</li>
      )}
    </ul>
  );
}
