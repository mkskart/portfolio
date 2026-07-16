# kartheekkmukkavilli.com

My personal portfolio — a black-and-red, motion-heavy site that reframes itself
for three different audiences. ECE @ UT Austin; embedded systems, ML, and
algorithmic trading.

**Live:** [kartheekkmukkavilli.com](https://kartheekkmukkavilli.com)

## About

This is a single site with three personalities. A recruiter skimming for a
firmware role, a quant desk, and a software team each want a different story out
of the same body of work — so instead of flattening into one generic page, the
site has a **mode** toggle that re-frames everything: the hero subtitle, the
intro, the skill groupings, the order projects appear in, how each past role is
described, and which resume downloads. The mode lives in the URL (`?mode=quant`),
so a single link can hand someone the version meant for them.

The aesthetic is deliberate — black canvas, a single Ferrari red, heavy on
motion and a few F1 references. It's a flex piece as much as a résumé.

## Features

- **Three audience modes** — Firmware · Quant · SWE. One toggle reskins the
  whole site (copy, skills, project ordering, experience framing, resume),
  persisted in the URL.
- **Interactive trading dashboard** (`/trading-bot`) — animated equity curves,
  backtest panels, and live-simulated metrics for the QuantClaw project.
- **LiteWing deep dive** (`/litewing`) — a build page for the custom ESP32
  flight controller.
- **3D garage** (`/garage`) — a hidden gallery of supercar `.glb` models in
  real-time 3D, reachable only through an easter egg.
- **Easter eggs** — a Konami-code red flash, typed word triggers
  (`verstappen`, `litewing`), and a handful of tile-local surprises.
- **Accessible by default** — keyboard navigation, skip-to-content, JSON-LD
  structured data, and a global `prefers-reduced-motion` gate that cuts the 3D
  frameloops and transitions.

## Architecture

Next.js App Router. The interesting part is the mode system; the rest is
conventional component structure.

```
src/
  app/            # routes + layout
  components/     # UI by area — hero, trading, litewing, garage, hobbies, easter-eggs
  lib/            # mode system, motion presets, project data, theme helpers
public/           # resume PDFs, 3D .glb models, audio/video, images
```

**The mode system** is the spine:

- `lib/mode.ts` — the `SiteMode` type (`firmware | quant | swe`), the default,
  and read/write of the `?mode=` URL param.
- `lib/mode-content.ts` — all per-mode copy in one place: subtitle cycles,
  intro, skill categories, project ordering, and how each role (HCRL, NOV, JPMC)
  is framed for that audience.
- `lib/projects-data.ts` — the canonical project list; each mode just reorders
  it by id.
- `lib/mode-context.tsx` — React context that makes the active mode available
  across the tree.

**Routes**

| Path           | What it is                                              |
|----------------|--------------------------------------------------------|
| `/`            | Home — hero, intro, featured projects, experience, hobbies, contact |
| `/trading-bot` | QuantClaw deep dive (all data client-side simulated)   |
| `/litewing`    | LiteWing flight-controller deep dive                  |
| `/resume`      | Animated resume with a per-mode PDF download          |
| `/garage`      | Hidden 3D car gallery                                 |

**Design system** — colors, typography, and effects are CSS variables in
`app/globals.css`, registered as Tailwind v4 theme tokens. Motion defaults live
in `lib/motion.ts`; the reduced-motion gate in `lib/reduced-motion.ts`.

## Tech stack

| Layer      | Tools                                                          |
|------------|----------------------------------------------------------------|
| Framework  | Next.js 16 (App Router) · React 19 · TypeScript               |
| Styling    | Tailwind CSS v4 (CSS-variable theme tokens)                   |
| Motion     | Framer Motion                                                 |
| 3D         | React Three Fiber · drei · three                             |
| Data viz   | Recharts                                                      |
| Fonts      | Space Grotesk (display) · Inter (sans) · JetBrains Mono (mono) |
| Hosting    | Vercel                                                        |

---

*All numbers and charts on `/trading-bot` and the homepage are client-side
simulations — nothing here is wired to live markets or real money.*
