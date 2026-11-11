import { ButtonLink } from "@/components/Button";
import { Mascot } from "@/components/Mascot";

export default function NotFound() {
  return (
    <div className="pt-12 flex flex-col items-center text-center gap-4">
      <title>Page not found · Picky Eater</title>
      <Mascot size={96} mood="thinking" />
      <h1 className="text-3xl font-extrabold">This page isn&apos;t on the menu</h1>
      <p className="text-lg text-ink-soft">The link may be old or mistyped.</p>
      <ButtonLink href="/" className="w-full">
        Go to the start
      </ButtonLink>
    </div>
  );
}
