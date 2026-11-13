# Picky Eater

Photograph a restaurant menu, or upload its PDF, and see which dishes fit your diet, allergies, and health goals. Each dish gets a 0–100 score, a plain-language reason, and clear warnings.

> AI estimates may be wrong. Always confirm allergens with restaurant staff.

## Quick start (2 minutes, no keys needed)

Requires **Node.js 20+** (tested on Node 26).

```bash
cd picky-eater
npm install
npm run dev
```

Open http://localhost:3000, set your preferences, and go to **Scan**. **Demo mode is on by default:** pick one of six sample menus, watch it "scan", and see every dish ranked for you. No API key, no network, no AI calls.

## Demo mode: the sample menu library

Six made-up restaurants (no real names, logos, or branding), each with its own language, cuisine, and look. They prove Picky Eater works across menus, scripts, and diets, **without paying for AI scans**.

| Sample menu | Language | Pages · dishes | Look | Good for showing |
|---|---|---|---|---|
| **Trattoria del Girasole** | Italian | 3 · 44 | Cream paper, elegant serif, rustic | Hidden pine nuts (pesto), anchovy (puntarelle), lard (cannoli), pork gelatin (panna cotta) |
| **Izakaya Tsukiakari** | Japanese | 2 · 26 | Minimal, vertical name with red seal | Names only; hidden fish stock (dashi), mirin (alcohol), wheat in soba |
| **Taquería El Nopal Azul** | Spanish | 1 · 20 | Chalkboard, hand-lettered | Lard in beans and tamales, peanuts/sesame in mole, clam juice in a cocktail |
| **Mashawi Al-Arz** | Arabic (right-to-left) | 1 · 21 | Ornate border, warm colors | Halal-certified kitchen; tahini (sesame) and pine nuts |
| **Kesar Rasoi** | Hindi + English subtitles | 2 · 26 | Maroon & saffron, decorative headers | Vegetarian and Jain dishes; hidden ghee, cashews, wheat in hing |
| **The Brass Lantern Deli** | English | 2 · 26 | Retro diner | Kosher-certified, keto/high-protein plates; hidden schmaltz, anchovy |

**How it works** ([`src/lib/demo/`](src/lib/demo/)):

- Each dish has its **printed** name/description (in the menu's language), an **English** name and description for results, a price in local currency, and an **ingredient list**.
- When you "scan" a sample, it's scored **on your device** against your **real saved preferences**, including your own "+ Other" entries, with the same safety rules as real scans:
  - An ingredient that breaks a rule → red, score 0–10.
  - Vague dishes (soup of the day, shared fryers, "fillings vary") → "Ask your server".
  - Meat without certification → ask about halal/kosher; meat + dairy breaks kosher.
  - A name or description that *sounds* risky (e.g. "Chocolate Egg Cream") → "Ask your server".
- **Change your preferences and scan again, and the results change.** This is the key moment in a pitch: try adding *+ Other: "no mushrooms"* and rescanning the izakaya.
- Menu pages are drawn with HTML/CSS (paper or chalkboard texture, tilt, shadow, glare) from the same data, so pictures always match results.
- **Japanese, Arabic, and Devanagari fonts are committed to the repo** ([`src/fonts/demo/`](src/fonts/demo/), about 630 KB, SIL Open Font License) and loaded with `next/font/local`, so dev, builds, and offline pitches never download them. Japanese keeps only the characters the izakaya menu uses plus all kana: if you edit that menu, rebuild the fonts with [`scripts/make-demo-fonts.mjs`](scripts/make-demo-fonts.mjs) (instructions at the top of the file). The small Latin display fonts still come from Google via `next/font/google` (downloaded once, then cached).
- The scanning animation takes about 2–4 seconds: reading each page → translating → checking allergens → ranking.
- Results show the original dish name, its English name, and a short English description, plus a **Try another menu** button.
- Demo mode **never calls the server's AI route** (verified in testing: zero requests to `/api/analyze`).

### Live scanning (optional, costs API credits)

The real upload and AI code is kept in full (PDFs, multiple photos, page batching; see below). With no `ANTHROPIC_API_KEY`, the Scan screen in live mode shows **"Live scanning coming soon. Try one of our sample menus!"** with a button to the gallery, never an error. Add a key and restart to switch it on.

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
2. Open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the `preferences` table with Row Level Security. **Already set up from an earlier version?** Run it again: it adds the columns for "+ Other" entries and leaves your data alone.
3. Under **Authentication → URL Configuration**, set **Site URL** to `http://localhost:3000` (or your deployed URL).
4. For demos, turn off **Authentication → Sign In / Providers → Email → Confirm email**, so sign-up logs you in right away. Supabase's built-in email sender is heavily rate-limited.

### Testing on a phone

```bash
npm run dev:phone
```

This serves HTTPS on your network, which most phones require before they'll open the camera. Open `https://<your-computer's-IP>:3000` on a phone on the same Wi-Fi and accept the self-signed certificate warning. Uploading photos or PDFs also works over plain `npm run dev -- -H 0.0.0.0`.

## What you can scan

| Input | Limits | How it's sent |
|---|---|---|
| **PDF menu** (text or scanned) | 1 PDF, up to **30 pages** and **25 MB**; no password-protected PDFs | Split into single pages **in the browser** (with `pdf-lib`); each page goes to Claude as a native PDF document |
| **Several photos** (one per page) | Up to **10 photos**, each up to 30 MB before shrinking | Each photo is shrunk in the browser to a ≤2000px JPEG (usually 0.3–1 MB) |
| **One photo** | Same | Same |
| iPhone HEIC photos | Work where the browser can open HEIC (Safari). Elsewhere you get a message pointing to *Take a photo* or the iPhone "Most Compatible" camera setting | |

The server re-checks everything. It identifies the file type from the file's first bytes (not its name), accepts only PDF, JPG, PNG, WebP, or GIF, at most 4 MB per upload, one PDF page per upload, and 30 pages per menu. Each problem gets a friendly message.

### Hosting upload limits (Vercel)

Vercel functions reject request bodies over **4.5 MB**, and a function can run for at most **60 s on the Hobby plan**. Picky Eater is built around both limits:

- **One request = one page.** PDFs are split into single pages in the browser and photos are compressed, so every upload is far below 4.5 MB, whatever the size of the whole menu.
- **Pages run 3 at a time**, each in its own function call, so a 20-page menu never has to fit into one 60-second call.
- If a single PDF page is over 4 MB (rare; usually a very high-resolution scan), the app says so and suggests photos instead. To support those, add a pre-upload to Supabase Storage and pass the file's URL to the server instead of the file itself.
- On Vercel Pro you can raise `maxDuration` in [`src/app/api/analyze/route.ts`](src/app/api/analyze/route.ts) for extra headroom on very dense pages.

## How it works

```
Browser                                   Server (/api/analyze, one call per page)          Claude
───────                                   ─────────────────────────────────────────         ──────
PDF ─► split into pages (pdf-lib) ┐
photos ─► shrink to JPEG ─────────┴► page 1..N ─► check type, size, pages ─► PDF document or image
            3 pages at a time                       + diner profile + system prompt ───────────► structured JSON
                                                    ◄── Zod-validated items ◄──────────────────
                                                    safety rules (scoring.ts) per page
merge pages, remove duplicates, sort ◄──────────── page results
```

1. **Preferences**: diets and allergies (hard rules, including the user's own **"+ Other"** entries), health goals ranked by priority, and soft notes.
2. **Scan**: pages are prepared in the browser (above) and sent one per request to [`/api/analyze`](src/app/api/analyze/route.ts), with live progress ("Reading pages 1–3 of 8…").
3. **AI** ([`analyze-menu.ts`](src/lib/server/analyze-menu.ts)): `claude-sonnet-5-5` with structured outputs, so the reply must match the Zod schema in [`schema.ts`](src/lib/schema.ts).
   - PDFs are sent as native PDF documents. Claude sees each page as an image *and* its extracted text, so **text and scanned PDFs both work** without conversion.
   - The system prompt is cached across pages.
   - If a safety filter wrongly refuses a page, the API's server-side fallback retries on another model.
   - The prompt ([`prompt.ts`](src/lib/prompt.ts)) handles **any cuisine and layout**: multi-column menus, items without descriptions (it writes a short one), any currency, size options, combos, and **non-English names** (kept as printed, plus an English name and description).
4. **Safety rules in code** ([`scoring.ts`](src/lib/scoring.ts), [`rules.ts`](src/lib/rules.ts)). We don't rely on the AI alone:
   - A dish that breaks a diet or allergy, **including custom "+ Other" entries**, gets its score scaled into **0–10**, the verdict **avoid**, a red warning, and is always sorted below safe dishes.
   - A dish the AI can't confirm becomes **"Ask your server"**, capped at 50 so it never looks like a top pick.
   - A keyword check (e.g. "pesto" → tree nuts; custom "no mushrooms" → "mushroom") can only *add* an "Ask your server" flag, never remove a warning. Per-rule exceptions stop false alarms (eggplant isn't egg, rice noodles aren't wheat, coconut cream isn't dairy).
5. **Merging** ([`merge.ts`](src/lib/merge.ts)): results from all pages become one ranked list.
   - A dish that appears on more than one page (same name ignoring accents and case, and same or missing price) is shown once, keeping **the most cautious version**: all warnings combined, the lower score.
   - Same-named dishes with different prices are kept apart (probably sizes or variants).
   - If some pages can't be read, the rest are still shown with a clear notice naming the missing pages.
6. **Results**: sorted best-first, filterable by **page or section** and **"Safe for me only"**. Each badge shows a number and a word as well as a color, and each dish's detail screen has ready-to-ask questions for staff.

### Where data lives

| Data | Guest | Logged in |
|---|---|---|
| Preferences (incl. "+ Other" entries) | `localStorage` | `localStorage` copy plus a Supabase `preferences` row. Loaded on every visit; guest preferences are uploaded on sign-up. Cleared from the device on log-out. |
| Scan results | `sessionStorage` (this visit only) | same |
| Menu photos / PDFs | Not stored. Each page is sent to the API once. | same |

## Testing checklist

Sample menus live in [`test-menus/`](test-menus/). All the restaurants and dishes are made up. Rebuild them with `node scripts/make-test-menus.mjs --render`.

| File | What it tests |
|---|---|
| `bistro-mundo-text.pdf` | 3-page **text PDF**, French/Spanish/Italian names, € prices, a **two-column** page, dishes **without descriptions**, and *Patatas bravas* repeated on pages 1 and 3 (should appear **once**) |
| `golden-lotus-scanned.pdf` | 2-page **scanned (image-only) PDF**, Thai/Vietnamese, $ prices, hidden fish sauce and peanuts, a "shared fryer" note |
| `izakaya-hoshi-photo-1.png`, `-2.png` | **Phone-style photos**, tilted, **Japanese** names, ¥ prices; *唐揚げ* appears on both photos (should appear **once**) |

Suggested profile: **Vegetarian**, **Peanuts** and **Shellfish** allergies, **+ Other: "no mushrooms"**, goal **High protein**.

- [ ] **Demo gallery** (no key, Wi-Fi off): 6 cards with language labels; each menu scans in ~2–4 s with "Reading page…", "Translating from…", and "Checking allergens…"; results show original + English names.
- [ ] **Preferences change results**: scan the izakaya, add *+ Other: "no mushrooms"*, and scan again. *椎茸 (Shiitake)* turns red.
- [ ] **Arabic** results and menu read right-to-left; Japanese, Arabic, and Hindi text never shows empty boxes.
- [ ] **Live mode without a key** shows "Live scanning coming soon" with a button to the sample menus (no error).
- [ ] **Text PDF**: progress shows "Reading pages 1–3 of 3"; *Patatas bravas* appears once; *Bœuf bourguignon* and *Paella de marisco* are red; *Ravioli ai funghi* is red or "Ask your server" for mushrooms; dishes have an English name under the French/Spanish/Italian one; prices keep "€".
- [ ] **Scanned PDF**: dishes are read even though the PDF has no text layer; *Pad Thai*, *Som Tum*, and *Massaman Curry* are red (peanuts); fish-sauce dishes are red for Vegetarian; *Fried Tofu* is "Ask your server" (shared fryer).
- [ ] **Photos**: upload both Izakaya photos at once; Japanese names stay as printed with English names below; *唐揚げ* appears once; *椎茸 (Shiitake)* is flagged for "no mushrooms"; *豚バラ (Pork belly)* is red for Vegetarian.
- [ ] **Filters**: "Show dishes from" lists pages and sections in menu order, and it works together with "Safe for me only".
- [ ] **Bad files**: a `.txt` file, a PDF together with a photo, and a password-protected PDF each give a friendly message.
- [ ] **Limits**: a 31-page PDF or 11 photos are rejected with the limit in the message.
- [ ] **Partial failure**: photograph a blank wall as one page of a multi-photo scan. The other pages still show results, with a notice naming the page that failed.
- [ ] **Disclaimer** is visible on Results and on every dish screen.

## Project structure

```
src/
├─ app/                     # Screens (App Router)
│  ├─ page.tsx              # Welcome
│  ├─ login/                # Sign up / log in / guest
│  ├─ preferences/          # First-run picker
│  ├─ settings/             # Edit preferences + account
│  ├─ scan/                 # Upload (photos/PDF), demo, progress, errors
│  ├─ results/ + [id]/      # Ranked list + dish detail
│  └─ api/analyze/route.ts  # Server-only: one menu page per request
├─ components/              # UI pieces (RuleChips, SectionFilter, LoadingScan, …)
│  └─ demo/                 # Gallery, menu view, menu art (MenuArt.tsx), fonts
└─ lib/
   ├─ schema.ts             # Zod schemas = single source of truth for types
   ├─ options.ts            # Diets, allergies, goals (+ search synonyms)
   ├─ rules.ts              # Every hard rule (built-in + custom): labels, questions, keywords
   ├─ scoring.ts            # Hard-rule enforcement + sorting (shared by AI and demo)
   ├─ merge.ts              # Combines pages, removes duplicates (cautiously)
   ├─ prompt.ts             # System prompt + per-page message
   ├─ scan-input.ts         # PDF splitting / photo prep in the browser
   ├─ analyze-client.ts     # Sends pages (3 at a time), progress, retries
   ├─ limits.ts             # Upload limits shared by browser and server
   ├─ demo/                 # Sample menu library (6 menus) + offline scorer
   ├─ live-status.ts        # Is live AI scanning set up? (asks /api/status)
   ├─ auth.ts, preferences-store.ts   # Supabase + local preference sync
   └─ server/               # Claude call + upload validation (server-only)
supabase/schema.sql         # Table + Row Level Security (safe to re-run)
test-menus/                 # Sample PDFs and photos for testing
scripts/make-test-menus.mjs # Regenerates test-menus/
```

## Design

- **Fonts**: *Instrument Serif* for page titles, *Manrope* for everything else (both via `next/font`, self-hosted).
- **Colors**: warm neutral background, one deep-teal accent, muted green/yellow/orange/red for scores.

## Accessibility

- 18px base text, 48–56px tap targets, high-contrast colors (WCAG AA or better)
- Score and safety state never rely on color alone: every badge has a number and a word, and every warning has an icon and a lead-in
- Toggles use `aria-pressed` / `role="switch"`; errors are announced and focused; there's a skip link
- Unsaved preference changes are never lost: Back asks "Save changes?", and leaving another way auto-saves
- Honors "reduce motion"; works with screen zoom and keyboard-only navigation

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run dev:phone` | Dev server over HTTPS on your network (for phone cameras) |
| `npm run build` / `npm start` | Production build / serve it (stop `npm run dev` first: both use `.next/`) |
| `npm run lint` | ESLint |
| `node scripts/make-test-menus.mjs [--render]` | Rebuild the sample menus |
| `node scripts/make-demo-fonts.mjs <ttfs> <tools>` | Rebuild the self-hosted demo fonts (after editing the Japanese menu) |

## Known limits (MVP)

- AI judgments come from the menu text and typical recipes, not the restaurant's actual ingredients. That's why unclear dishes say "Ask your server."
- There's no rate limiting on `/api/analyze` yet. Each page costs API credits, so add rate limiting before a public launch.
- PDF pages over 4 MB each need the Supabase Storage pre-upload described above.
