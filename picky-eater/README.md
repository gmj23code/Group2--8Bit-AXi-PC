# 🥑 Picky Eater

Snap a photo of a restaurant menu and see which dishes fit your diet, allergies, and health goals. Each dish gets a 0–100 score, a plain-language reason, and clear warnings.

> AI estimates may be wrong. Always confirm allergens with restaurant staff.

## Quick start (2 minutes, no keys needed)

Requires **Node.js 20+** (tested on Node 26).

```bash
cd picky-eater
npm install
npm run dev
```

Open http://localhost:3000. Set your preferences, go to **Scan**, turn on **Demo mode**, and tap **Check this menu**. Demo mode works offline with no API keys, so it's the safe choice for a live pitch.

## Turning on the real features

Copy the template, fill in what you need, and restart `npm run dev`:

```bash
cp .env.example .env.local        # Windows: copy .env.example .env.local
```

| Variable | Needed for | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Real menu scans | [platform.claude.com](https://platform.claude.com/) → API Keys. Server-only; never sent to the browser. |
| `ANTHROPIC_MODEL` | Optional | Defaults to `claude-sonnet-5-5`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Accounts | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts | Same page: the **anon** or **publishable** key. **Never** the `service_role`/secret key. |

Every variable is optional. Without the Anthropic key, use Demo mode. Without Supabase, the app runs guest-only and saves preferences on the device.

### Supabase setup (accounts + saved preferences)

1. Create a project at [supabase.com](https://supabase.com) (the free tier is fine).
2. Open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the `preferences` table with Row Level Security.
3. Under **Authentication → URL Configuration**, set **Site URL** to `http://localhost:3000` (or your deployed URL).
4. For demos, turn off **Authentication → Sign In / Providers → Email → Confirm email**, so sign-up logs you in right away. Supabase's built-in email sender is heavily rate-limited.

### Testing on a phone

```bash
npm run dev:phone
```

This serves HTTPS on your network, which most phones require before they'll open the camera. Open `https://<your-computer's-IP>:3000` on a phone on the same Wi-Fi and accept the self-signed certificate warning. Uploading from the photo gallery also works over plain `npm run dev -- -H 0.0.0.0`.

## How it works

```
Phone ──photo (shrunk to 1600px JPEG)──► /api/analyze ──image + profile──► Claude (vision, JSON schema)
   ▲                                          │
   └──────── validated, rule-checked results ◄┘   scoring.ts enforces the safety rules
```

1. **Preferences**: diets and allergies (hard rules), health goals (ranked by priority), and free-text notes.
2. **Scan**: the photo is shrunk in the browser, then sent with the profile to [`/api/analyze`](src/app/api/analyze/route.ts).
3. **AI**: [`analyze-menu.ts`](src/lib/server/analyze-menu.ts) calls Claude with structured outputs, so the reply must match the Zod schema in [`schema.ts`](src/lib/schema.ts). If a safety filter wrongly refuses a photo, the API's server-side fallback retries on another model.
4. **Safety rules in code** ([`scoring.ts`](src/lib/scoring.ts)). We don't rely on the AI alone:
   - A dish that breaks a diet or allergy gets its score scaled into **0–10**, the verdict **avoid**, a red warning, and is always sorted below safe dishes.
   - A dish the AI can't confirm becomes **"Ask your server"**, capped at 50 so it never looks like a top pick.
   - A small keyword check (e.g. "pesto" → tree nuts) can only *add* an "Ask your server" flag, never remove a warning.
   - Warnings for rules the user didn't pick are dropped.
5. **Results**: sorted best-first, with a "Safe for me only" filter, color-coded badges that also carry a word and a symbol, and a detail screen with ready-to-ask questions for staff.

### Where data lives

| Data | Guest | Logged in |
|---|---|---|
| Preferences | `localStorage` | `localStorage` copy plus a Supabase `preferences` row. Loaded on every visit; guest preferences are uploaded on sign-up. Cleared from the device on log-out. |
| Scan results | `sessionStorage` (this visit only) | same |
| Menu photos | Not stored. Sent to the API once. | same |

## Project structure

```
src/
├─ app/                     # Screens (App Router)
│  ├─ page.tsx              # Welcome
│  ├─ login/                # Sign up / log in / guest
│  ├─ preferences/          # First-run picker
│  ├─ settings/             # Edit preferences + account
│  ├─ scan/                 # Camera/upload, demo toggle, loading + error states
│  ├─ results/ + [id]/      # Ranked list + dish detail
│  └─ api/analyze/route.ts  # Server-only Claude call
├─ components/              # Small UI pieces (ScoreBadge, ChipGroup, PriorityRanker, …)
└─ lib/
   ├─ schema.ts             # Zod schemas = single source of truth for types
   ├─ scoring.ts            # Hard-rule enforcement + sorting (shared by AI and demo)
   ├─ prompt.ts             # System prompt + per-user message
   ├─ demo.ts               # Sample menu, scored on-device against real preferences
   ├─ auth.ts               # Supabase client + session
   ├─ preferences-store.ts  # Local + cloud preference sync
   └─ server/analyze-menu.ts
supabase/schema.sql         # Table + Row Level Security policies
```

## Accessibility

- 18px base text, 48–56px tap targets, high-contrast colors (WCAG AA or better)
- Score and safety state never rely on color alone: every badge has a number, a word, and a symbol
- Toggles use `aria-pressed` / `role="switch"`; errors are announced and focused; there's a skip link
- Honors "reduce motion"; works with screen zoom and keyboard-only navigation

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run dev:phone` | Dev server over HTTPS on your network (for phone cameras) |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |

## Known limits (MVP)

- One menu photo per scan (multi-page menus: scan each page).
- AI judgments come from the menu text and typical recipes, not the restaurant's actual ingredients. That's why unclear dishes say "Ask your server."
- There's no rate limiting on `/api/analyze` yet. Add it before a public launch.
