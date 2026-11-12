import { Icon, type IconName } from "@/components/Icon";
import { WelcomeActions } from "@/components/WelcomeActions";

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "sliders", title: "Set your preferences", text: "Diets, allergies, and the health goals that matter to you." },
  { icon: "camera", title: "Photograph the menu", text: "Lay it flat in good light. We read every dish." },
  { icon: "list", title: "See what fits", text: "Every dish scored from 0 to 100 for you, with clear warnings." },
];

export default function WelcomePage() {
  return (
    <div className="pt-12 sm:pt-16 flex flex-col gap-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">Menu scanner</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-[1.02]">
          Know what you can eat before you order.
        </h1>
        <p className="mt-4 text-lg text-ink-soft max-w-xl">
          Picky Eater reads the menu and ranks every dish against your diet, allergies, and goals.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-card bg-surface border border-line p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-brand-soft text-brand grid place-items-center">
                <Icon name={s.icon} />
              </span>
              <span className="text-sm font-medium text-ink-soft tabular-nums">0{i + 1}</span>
            </div>
            <h2 className="mt-4 text-base font-semibold">{s.title}</h2>
            <p className="mt-1 text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ol>

      <WelcomeActions />
    </div>
  );
}
