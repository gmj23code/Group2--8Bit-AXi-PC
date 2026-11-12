import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="pt-16 flex flex-col gap-4 max-w-md">
      <title>Page not found · Picky Eater</title>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">404</p>
      <h1 className="font-display text-[2.6rem] leading-[1.05]">This page isn&apos;t on the menu</h1>
      <p className="text-ink-soft">The link may be old or mistyped.</p>
      <ButtonLink href="/" className="mt-2 self-start px-8">
        Go to the start
      </ButtonLink>
    </div>
  );
}
