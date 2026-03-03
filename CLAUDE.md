# Mission Control — CLAUDE.md

## What This Is
Mission Control is the local-first ops dashboard for THE VARIED. It runs on the Mac Mini (always on), wired directly into the OpenClaw gateway. Accessible from any device via `mission.thevaried.co` through a Cloudflare Tunnel.

**This is not a Vercel app.** It runs locally via LaunchAgent on port 3001. No CI/CD pipeline — build locally, restart the LaunchAgent.

## Tech Stack
- **Framework:** Next.js 16 with App Router (`app/` directory)
- **Runtime:** Node.js on macOS (LaunchAgent `co.thevaried.mission-control`)
- **Styling:** CSS custom properties in `globals.css` — no Tailwind utility classes in components
- **Database:** Supabase (outreach contacts only). Everything else is filesystem or OpenClaw gateway.
- **Language:** TypeScript
- **Port:** 3001 (dev and production)
- **Tunnel:** Cloudflare Tunnel via LaunchAgent `co.thevaried.cloudflared`

## Data Sources
| Source | How | Used By |
|--------|-----|---------|
| OpenClaw CLI | `child_process.execSync` via `lib/openclaw.ts` | Crons, gateway health/status |
| OpenClaw Gateway HTTP | `fetch` to `localhost:18789` | Chat (SSE streaming) |
| Local filesystem | `fs` via `lib/filesystem.ts` | Files page, Today page |
| Supabase | `@supabase/supabase-js` via `lib/supabase.ts` | Outreach page only |

## Design System — THE VARIED Brand
All values are in `globals.css` as CSS custom properties. Use `var(--token)` everywhere. Never hardcode colors or fonts inline (some legacy components still do — don't add more).

### Colors
- Background: `--bg: #09090B`, `--bg-elevated: #111113`, `--bg-subtle: #18181B`
- Text: `--text-primary: #EDEDEF`, `--text-secondary: #A1A1AA`, `--text-muted: #52525B`
- Accent: `--accent: #D4551E` (burnt orange) — used for active states, status indicators, buttons
- Error: `--red: #C43030`
- No gradients. No shadows. No rounded corners (2px max on cards).

### Fonts
- `--font-serif`: Instrument Serif — wordmark, page titles
- `--font-tech`: Syne — card headings, feature names
- `--font-mono`: DM Mono — body text, labels, data, code (this is the default body font)
- `--font-impact`: Archivo Black — reserved, rarely used
- `--font-sans`: Bricolage Grotesque — reserved, rarely used

### CSS Classes (use these, don't reinvent)
- `.card` — elevated background, 1px border, 2px radius
- `.t-label` — uppercase mono label (section headers)
- `.t-serif`, `.t-tech`, `.t-mono` — typography presets
- `.btn`, `.btn-accent`, `.btn-ghost` — button styles
- `.pill`, `.pill-muted`, `.pill-red` — status badges
- `.section-label` — section dividers
- `.rule` — horizontal divider

### Spacing
Use `var(--space-N)` where N is 1,2,3,4,6,8,10,12,16. Do not use Tailwind spacing utilities.

## File Structure
```
app/
  page.tsx              — Dashboard (3-column: priorities, crons, devices)
  chat/page.tsx         — Chat with Marlowe (SSE streaming, project selector)
  files/page.tsx        — File browser (upload/download between devices)
  crons/page.tsx        — Cron job management (run, toggle, history)
  today/page.tsx        — today.md rendered with interactive checkboxes
  outreach/page.tsx     — CRM contact tracker (Supabase)
  login/page.tsx        — Password login
  layout.tsx            — Root layout with LayoutShell
  globals.css           — Full design system (DO NOT restructure)
  api/
    chat/route.ts       — SSE proxy to gateway chat completions
    crons/route.ts      — List cron jobs
    crons/[id]/run/     — Trigger cron
    crons/[id]/toggle/  — Enable/disable cron
    crons/[id]/runs/    — Run history
    files/route.ts      — List directory
    files/read/         — Read file content
    files/upload/       — Upload file
    files/download/     — Download file
    files/mkdir/        — Create directory
    gateway/health/     — Gateway health check
    gateway/status/     — Gateway status
    gateway/presence/   — Connected devices
    today/route.ts      — Read today.md
    today/toggle/       — Toggle task checkbox
    today/add/          — Add task
    login/route.ts      — Auth
    outreach/route.ts   — CRM CRUD
    outreach/[id]/      — Single contact

components/
  LayoutShell.tsx       — Sidebar + TopBar wrapper
  Sidebar.tsx           — Nav, gateway status dot, clock
  TopBar.tsx            — Page title, avatars
  AgentCard.tsx         — Agent display card
  icons.tsx             — All SVG icons as React components

lib/
  openclaw.ts           — Gateway client (CLI + HTTP)
  filesystem.ts         — Workspace file ops with path traversal protection
  auth.ts               — API route auth helper
  supabase.ts           — Supabase client (outreach only)
  agents.ts             — Agent roster data
  data.ts               — Legacy, may be unused

middleware.ts           — Cookie-based auth redirect
```

## Conventions
- **All pages are `"use client"`** — this is a dashboard with polling, state, and interactivity
- **API routes use Route Handlers** in `app/api/`
- **No `pages/` directory** — App Router only
- **Inline styles** are used extensively (the codebase was built fast). New code should prefer CSS classes from `globals.css` where they exist, but inline styles matching the design tokens are acceptable.
- **Icons** are custom SVG components in `components/icons.tsx`. Import from there, don't add icon libraries.
- **Polling** for live data: most pages poll their API every 15 seconds via `setInterval`
- **No state management library** — React `useState` + `useEffect` only
- **Authentication** is a single password stored in `DASHBOARD_PASSWORD` env var, checked via cookie

## Environment Variables
```
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=<token>
WORKSPACE_PATH=/Users/middletonbot/Documents/Obsidian Vault/Marlowe
TODAY_MD_PATH=/Users/middletonbot/life/today.md
DASHBOARD_PASSWORD=<password>
```
Supabase keys are also in `.env.local` for the outreach page.

## Do Not Touch
- `globals.css` — the design system. Add classes, don't restructure.
- `middleware.ts` — auth routing works, leave it alone
- `lib/supabase.ts` — Supabase client setup
- `.env.local` — never commit, never log

## Build & Deploy
```bash
# Dev
npm run dev          # localhost:3001

# Production build
npm run build
# Restart LaunchAgent
launchctl kickstart -k gui/$(id -u)/co.thevaried.mission-control
```
There is no CI/CD. Build locally, restart the agent.

## OpenClaw Integration
- **CLI binary:** `/opt/homebrew/bin/openclaw`
- **Gateway:** `localhost:18789` (loopback only)
- **Chat completions:** `POST localhost:18789/v1/chat/completions` with Bearer token
- **Cron operations:** `openclaw cron list|run|enable|disable --json`
- **Gateway queries:** `openclaw gateway call health|status|system-presence --json`

## PR / Branch Rules
This project is local-only (no GitHub remote currently). When working:
- One feature at a time
- Build and verify before restarting the LaunchAgent
- Keep the production build clean — `npm run build` must pass with zero errors
