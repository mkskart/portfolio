# kartheekkmukkavilli.com

Personal portfolio. Black-and-red, motion-heavy, dual-audience flex piece for
recruiters and engineers.

**Stack:** Next.js 16 (App Router, TS) · Tailwind v4 · Framer Motion ·
React Three Fiber · Vercel.

## Routes

| Path           | Notes                                                       |
|----------------|-------------------------------------------------------------|
| `/`            | Hero, intro, trading bot, LiteWing, work, hobbies, contact  |
| `/trading-bot` | Deep dive — live simulated dashboard, backtest panels       |
| `/resume`      | Animated resume + PDF download                              |
| `/garage`      | Hidden — accessible only via tile-B easter egg              |

## Local dev

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
```

Node 20+, npm 10+.

## Easter eggs

| # | Trigger                                | Effect                                       |
|---|----------------------------------------|----------------------------------------------|
| 1 | Konami code (↑↑↓↓←→←→BA)               | Site flashes red with "DRS ENABLED"          |
| 2 | Click the equity curve                 | Fullscreen scrubable modal                   |
| 3 | Type `verstappen` anywhere             | Site-wide MAX VERSTAPPEN broadcast flash     |
| 4 | Click name 5×                          | Name shatters and reforms                    |
| 5 | Long-press violin tile (800ms)         | Plays a synthesized violin note (Web Audio)  |
| 6 | Type `litewing` anywhere               | Viewport tilts ±2.5° for 2s (matches spec)   |
| 7 | Click the cars tile silhouette 3×      | Reveals hidden link to `/garage`             |

Keyboard-driven eggs (1, 3, 6) are desktop-only by nature.

## Spotify setup

The "Off the Clock" Spotify tile pulls live data from the Spotify Web API via
two serverless routes (`/api/spotify/now-playing`, `/api/spotify/top-tracks`).
Without env vars set, it gracefully shows "Nothing live right now" — no errors,
no broken UI.

### One-time refresh-token exchange

1. Go to <https://developer.spotify.com/dashboard> and create an app.
2. Add `http://localhost:3000/callback` as a redirect URI.
3. Copy the **Client ID** and **Client Secret**.
4. Visit (replace `<CLIENT_ID>`):

   ```
   https://accounts.spotify.com/authorize?response_type=code&client_id=<CLIENT_ID>&scope=user-read-currently-playing%20user-top-read&redirect_uri=http://localhost:3000/callback
   ```

   Approve, then copy the `code` param from the URL you're redirected to.
5. Exchange the code for a refresh token (replace placeholders):

   ```sh
   curl -X POST https://accounts.spotify.com/api/token \
     -u "<CLIENT_ID>:<CLIENT_SECRET>" \
     -d "grant_type=authorization_code" \
     -d "code=<CODE>" \
     -d "redirect_uri=http://localhost:3000/callback"
   ```

6. Save the `refresh_token` from the response.

### Wire env vars

Local dev — copy `.env.example` to `.env.local` and fill in.
Vercel — add the same keys in **Project Settings → Environment Variables**:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

Refresh tokens stay private on the server — they are never sent to the client.

## Resume PDF

Drop the actual PDF at `public/kartheek-mukkavilli-resume.pdf` — the
"Download PDF" button on `/resume` links to that path.

## Deploy

Push to GitHub → connect to Vercel → done.

For the custom domain `kartheekkmukkavilli.com`:

1. Vercel → Project → Settings → Domains → add the domain.
2. In your DNS host (GoDaddy etc.), add the A / CNAME records Vercel shows.

## Design system reference

Colors and typography are CSS variables in `src/app/globals.css`,
registered as Tailwind v4 theme tokens. Use them as utilities:

- Surfaces: `bg-bg-base`, `bg-bg-elevated`, `glass`, `glass-red`
- Reds:     `text-red-glow`, `bg-red-primary`, `border-border-accent`
- Text:     `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Fonts:    `font-display` (Space Grotesk), `font-mono` (JetBrains Mono),
            default sans (Inter)
- Effects:  `red-glow`, `red-text-glow`, `live-dot`

Animation defaults (see `src/lib/motion.ts`):

- Cinematic reveals: `duration: 0.95s`, ease `[0.22, 1, 0.36, 1]`
- Snappy interactions: `duration: 0.18s`
- Reduced motion: `prefers-reduced-motion` gates Three.js frameloops and CSS
  transitions globally (`src/lib/reduced-motion.ts` + `globals.css`).

## Trading bot data

All numbers and charts on `/trading-bot` and the homepage are
**client-side simulated**. No real trading data, no API keys, nothing
connected to live markets. This is intentional and non-negotiable.
