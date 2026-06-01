# kartheekkmukkavilli.com

My personal portfolio — a black-and-red, motion-heavy site that reframes itself
for three different audiences. Built with Next.js and deployed on Vercel.

**Live:** [kartheekkmukkavilli.com](https://kartheekkmukkavilli.com)

---

## What makes it different

- **Three audience modes.** A single toggle reskins the whole site for
  **Firmware**, **Quant**, or **SWE** readers — swapping the hero subtitle,
  intro, skill groups, project ordering, experience framing, and the
  downloadable resume. The active mode persists in the URL (`?mode=quant`) so a
  link can deep-point a recruiter at the right framing.
- **Interactive trading dashboard** (`/trading-bot`) — live-simulated equity
  curves, backtest panels, and metrics rendered with Recharts.
- **3D garage** (`/garage`) — a hidden gallery of `.glb` supercar models
  rendered with React Three Fiber, reachable only through an easter egg.
- **Live Spotify tile** — pulls now-playing and top tracks from the Spotify Web
  API through serverless routes, and degrades gracefully to a quiet placeholder
  when no credentials are configured.
- **Built for accessibility** — full keyboard nav, skip-to-content,
  JSON-LD `Person` structured data, and a global `prefers-reduced-motion` gate
  that disables Three.js frameloops and CSS transitions.

## Tech stack

| Layer       | Tools                                                              |
|-------------|-------------------------------------------------------------------|
| Framework   | Next.js 16 (App Router) · React 19 · TypeScript                   |
| Styling     | Tailwind CSS v4 (CSS-variable theme tokens)                       |
| Motion      | Framer Motion                                                     |
| 3D          | React Three Fiber · drei · three                                  |
| Data viz    | Recharts                                                          |
| Data        | SWR · Spotify Web API (serverless routes)                         |
| Fonts       | Space Grotesk (display) · Inter (sans) · JetBrains Mono (mono)    |
| Hosting     | Vercel                                                            |

## Routes

| Path           | Notes                                                          |
|----------------|----------------------------------------------------------------|
| `/`            | Home — hero, intro, featured projects, experience, hobbies, contact |
| `/trading-bot` | QuantClaw deep dive — simulated dashboard and backtest panels  |
| `/litewing`    | LiteWing flight-controller deep dive                          |
| `/resume`      | Animated resume with a per-mode PDF download                  |
| `/garage`      | Hidden 3D car gallery (reachable via an easter egg)          |
| `/api/spotify/now-playing`, `/api/spotify/top-tracks` | Serverless Spotify proxies |

## Getting started

Requires **Node 20+** and **npm 10+**.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

## Environment variables

Everything renders without any env vars — the Spotify tile simply shows a quiet
placeholder until credentials are present. To light it up, create a
`.env.local` in the project root (and add the same keys in Vercel under
**Project Settings → Environment Variables**):

```sh
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=...
```

<details>
<summary>One-time Spotify refresh-token exchange</summary>

1. Create an app at <https://developer.spotify.com/dashboard>.
2. Add `http://localhost:3000/callback` as a redirect URI.
3. Copy the **Client ID** and **Client Secret**.
4. Visit (substituting `<CLIENT_ID>`), approve, then grab the `code` query param
   from the redirect URL:

   ```
   https://accounts.spotify.com/authorize?response_type=code&client_id=<CLIENT_ID>&scope=user-read-currently-playing%20user-top-read&redirect_uri=http://localhost:3000/callback
   ```

5. Exchange the code for a refresh token:

   ```sh
   curl -X POST https://accounts.spotify.com/api/token \
     -u "<CLIENT_ID>:<CLIENT_SECRET>" \
     -d "grant_type=authorization_code" \
     -d "code=<CODE>" \
     -d "redirect_uri=http://localhost:3000/callback"
   ```

6. Save the `refresh_token` from the response. The refresh token never leaves
   the server — it is only used inside the serverless routes.
</details>

## Resume PDFs

Each mode links to its own resume, served from `public/`:

- `kartheek-mukkavilli-resume-firmware.pdf`
- `kartheek-mukkavilli-resume-quant.pdf`
- `kartheek-mukkavilli-resume-swe.pdf`

Replace these files to update the downloads — no code changes needed.

## Project structure

```
src/
  app/            # App Router: pages, layout, and /api/spotify routes
  components/     # UI by area — hero, trading, litewing, garage, hobbies, easter-eggs
  lib/            # mode system, motion presets, project data, Spotify + theme helpers
public/           # resume PDFs, 3D .glb models, audio/video, images
```

The mode system lives in `src/lib/mode.ts` (types + URL persistence) and
`src/lib/mode-content.ts` (the per-mode copy), with project metadata in
`src/lib/projects-data.ts`.

## Design tokens

Colors, typography, and effects are CSS variables in `src/app/globals.css`,
registered as Tailwind v4 theme tokens and used as utilities — e.g.
`bg-bg-base`, `glass`, `text-red-glow`, `font-display`, `red-glow`. Animation
defaults live in `src/lib/motion.ts`, and the reduced-motion gate in
`src/lib/reduced-motion.ts`.

## Easter eggs

A few hidden bits, because why not:

- **Konami code** (↑↑↓↓←→←→BA) → a site-wide red flash.
- Type **`verstappen`** anywhere → an audio cue.
- Type **`litewing`** anywhere → the viewport briefly banks ±2.5°.
- Plus a handful of tile-local surprises — including the secret door to
  `/garage`. Go find them.

## Deployment

Push to GitHub and connect the repo to Vercel. For the custom domain, add it
under **Settings → Domains** and point the A/CNAME records Vercel provides at
your DNS host.

---

> **Note:** All numbers and charts on `/trading-bot` and the homepage are
> client-side simulations. Nothing here is wired to live markets or real money.
