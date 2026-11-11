import { Mascot } from "@/components/Mascot";
import { WelcomeActions } from "@/components/WelcomeActions";

const STEPS = [
  { emoji: "📝", text: "Tell us what you can't eat and what you're aiming for." },
  { emoji: "📸", text: "Snap a photo of the menu." },
  { emoji: "✅", text: "See every dish scored from 0 to 100, just for you." },
];

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center text-center pt-10 gap-6">
      <Mascot size={120} />
      <div>
        <h1 className="text-4xl font-extrabold leading-tight">Know what you can eat before you order.</h1>
        <p className="text-xl text-ink-soft mt-3">
          Picky Eater reads the menu and finds the dishes that fit your diet, allergies, and goals.
        </p>
      </div>

      <ol className="w-full flex flex-col gap-3 text-left">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-center gap-4 rounded-card bg-white border border-line p-4 shadow-sm">
            <span className="text-3xl" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="text-lg font-bold">{s.text}</span>
          </li>
        ))}
      </ol>

      <WelcomeActions />
    </div>
  );
}
