export function TagList({ tags, max }: { tags: string[]; max?: number }) {
  const shown = max ? tags.slice(0, max) : tags;
  if (shown.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
      {shown.map((t) => (
        <li key={t} className="rounded-md bg-subtle px-2.5 py-1 text-sm font-medium text-ink-soft">
          {t}
        </li>
      ))}
      {max && tags.length > max && (
        <li className="px-1.5 py-1 text-sm font-medium text-ink-soft">+{tags.length - max} more</li>
      )}
    </ul>
  );
}
