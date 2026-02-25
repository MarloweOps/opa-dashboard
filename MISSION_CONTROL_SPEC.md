# Mission Control v2 — Build Spec

## Overview
Transform marlowe-dashboard into a full ops center for Brendan Lynch + Marlowe.
Dark war-room aesthetic. Feels alive. Interactive. Fun.

---

## Architecture

### Layout (ALL pages)
Replace current single-page layout with:
- **Persistent left sidebar** (220px wide, fixed position)
- **Top bar** (60px, fixed, full width minus sidebar)
- **Main content area** (scrollable, padding adjusted for sidebar + topbar)

### Sidebar component: `components/Sidebar.tsx`
- Background: `#060d05` (darker than panels)
- Top: "THE VARIED" in serif + terracotta dot, below it "MISSION CONTROL" in mono 9px sage
- Nav links (with active highlight in forest/20 border-l-2 forest-light):
  - `/` → ▸ Overview
  - `/command` → ⬡ Marlowe (show badge count from approval_queue if > 0)
  - `/today` → ◈ Today
  - `/briefs` → ◷ Briefs
  - `/outreach` → ◎ Outreach
  - `/products` → ↓ Products
  - `/crons` → ⟳ Automations
  - `/docs` → ≡ Docs
  - `/inbox` → ↑ Inbox
- Bottom of sidebar: pulsing green dot + "SYSTEM ONLINE" + current time (client-side, updates every second)
- Hover states: slight bg highlight, text goes porcelain

### Top bar: `components/TopBar.tsx`
- Background: `rgba(6,13,5,0.95)` with blur backdrop
- Border bottom: 1px solid rgba(131,151,136,0.15)
- Left: current page title (passed as prop)
- Center: live MRR stat (`$0`) in mono green — pulls from Supabase ops_status
- Right: Brendan + Marlowe avatar initials (B / M in small circles) + live clock

### Update `app/layout.tsx`
Wrap all children in the sidebar + topbar layout. Pass pathname for active nav state.
Use `usePathname()` in a client wrapper component.

---

## Page 1: `/command` — Marlowe Command Center
**This is the hero page. Make it feel like a real AI ops center.**

### Marlowe Brain Visualization (top, full width)
CSS/SVG animated component: `components/MarloweOrb.tsx`

States (driven by `agentState` prop: 'idle' | 'thinking' | 'working' | 'waiting' | 'alert'):
- **idle**: single dim green orb (#4ade80 at 40% opacity), slow 3s pulse, single ring
- **thinking**: brighter orb, faster 1.5s pulse, 2 concentric rings animating outward
- **working**: full glow (#4ade80), rapid 0.8s pulse, 3 rings expanding outward on loop, small satellite dots orbiting
- **waiting** (approval needed): amber (#D4A855) orb, 2s pulse, "AWAITING INPUT" text flashes slowly
- **alert**: terracotta (#C4725F) pulse, single ring, "ATTENTION REQUIRED" text

Visual spec:
- Center orb: 80px diameter circle with box-shadow glow matching state color
- Rings: SVG circles that scale from 1x to 2.5x and fade out, staggered timing
- If sub-agents active: smaller satellite orbs (40px) positioned around the main orb at cardinal points, connected by animated dashed SVG lines (stroke-dashoffset animation)
- Each satellite labeled with agent name below it
- Below center orb: current state text in mono uppercase (e.g. "BUILDING PRODUCTION MASTER V1.4")
- Below that: timer showing how long current task has been running

Layout: centered in a 200px-tall dark panel with subtle grid background (#0a0f09 with 1px grid lines at 40px intervals in rgba(131,151,136,0.05))

### Three columns below the orb:

**Column 1: Sub-Agents** (`components/AgentCard.tsx`)
- Header: "⬡ ACTIVE AGENTS" with count badge
- Each agent card:
  - Agent name in bold porcelain (e.g. "CHAPMAN", "HEYWOOD")
  - Role subtitle in sage (e.g. "Language Audit")
  - Task description (truncated to 2 lines)
  - Duration running (e.g. "1h 23m")
  - Status dot (building pulse = active, pending = queued)
  - Progress bar (indeterminate animated shimmer for active, static for queued)
  - KILL button (small, danger red, mono text "KILL", requires confirm on click)
- Empty state: "No active sub-agents. System idle." with dim orb graphic

**Column 2: Approval Queue** (`components/ApprovalCard.tsx`)
- Header: "⚠ APPROVALS" with count badge in terracotta
- Each approval card:
  - Title in porcelain bold
  - Description (2-3 lines) in sage-light
  - Risk badge: LOW (green) / MED (honey) / HIGH (terracotta) — mono uppercase
  - Context block: small mono code-style box showing what Marlowe wants to do
  - Two buttons: APPROVE (green, #4ade80 text, forest border) and DENY (terracotta text, terracotta/20 bg)
  - Timestamp in tiny mono
  - On approve/deny: card fades out with animation, calls PATCH /api/approvals/[id]
- Empty state: "No pending approvals." with green checkmark
- **This is the most important interactive element — make it feel good to use**

**Column 3: Task Board** (`components/TaskBoard.tsx`)
- Header: "◈ MARLOWE TASKS"
- Four status columns as tab-style selector (not full kanban — one view at a time):
  QUEUED | ACTIVE | BLOCKED | DONE
  Active tab: forest border-b-2, porcelain text. Inactive: sage
- Task cards in selected column:
  - Title + category badge (e.g. "OPA", "TEMPLATE", "EMAIL", "INFRA")
  - Priority indicator: high (terracotta dot), med (honey), low (sage)
  - Short description
  - Created timestamp
  - For BLOCKED tasks: show blocker reason in terracotta
- Add Task button (+ icon, opens a simple inline form: title + category + priority select)

---

## Page 2: `/today` — Today's Focus
**Brendan's live task list. The 80/20 view.**

Layout: two columns
Left (60%): Task list
- Source: `ops_today` Supabase table (synced from today.md by update script)
- Group by: PRIORITY / BACKLOG / DONE
- Each task: checkbox (purely visual — clicking marks done in Supabase), task text, category badge
- PRIORITY tasks: slightly highlighted bg (forest/10), bold text
- Smooth check animation (line-through + opacity fade)
- "Last synced" timestamp at top

Right (40%): Focus panel
- Top: 80/20 analysis — "Today's highest-leverage task" derived from task list
- Marlowe's recommended sequence for the day (pulled from `ops_status.notes`)
- OPA daily metrics snapshot (MRR, active trials, days until oldest trial expires)
- Quick links: app.useopa.com, marlowe-dashboard (internal), Resend dashboard

---

## Page 3: `/briefs` — Morning Brief Archive
- Grid of brief cards (most recent first)
- Each card: date, weather one-liner, top stock pick, brief excerpt (3 lines)
- Click to expand full brief in a modal/drawer
- Search bar: filter by keyword across all briefs
- Source: `brief_archive` Supabase table

---

## Page 4: `/outreach` — Coordinator Outreach Tracker
- Table/card list of target coordinators
- Columns: NAME | COMPANY | PLATFORM | STATUS | LAST CONTACT | NOTES
- Status options (dropdown in each row): NOT STARTED / MESSAGED / RESPONDED / CALL BOOKED / CONVERTED / PASSED
- Color-coded status badges
- Add contact button (quick inline form)
- Filter by status
- Source: `outreach_contacts` Supabase table

---

## Page 5: `/products` — Products & Downloads
- Clean product cards
- OPA Production Master: version, file size, download button, Lemon Squeezy status
- OPA SaaS metrics (MRR, paying users)
- Version history list
- "Push to Lemon Squeezy" placeholder button (disabled until LS connected)

---

## Page 6: `/crons` — Automations
- List of all cron jobs with: name, schedule, last run, next run, status, last output preview
- Run Now button for each
- Enable/disable toggle
- Source: static data for now (hardcode morning-brief + drip jobs), with /api/crons route for future

---

## Supabase Tables to Create

### `approval_queue`
```sql
create table approval_queue (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  description text,
  risk_level text default 'low', -- low | med | high
  context text, -- what exactly Marlowe wants to do
  status text default 'pending', -- pending | approved | denied
  resolved_at timestamptz,
  category text -- tier1 | tier2 | external
);
```

### `marlowe_tasks`
```sql
create table marlowe_tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  description text,
  category text, -- OPA | TEMPLATE | EMAIL | INFRA | CONTENT
  status text default 'queued', -- queued | active | blocked | done
  priority text default 'med', -- high | med | low
  blocker text,
  session_id text
);
```

### `active_agents`
```sql
create table active_agents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null, -- CHAPMAN, HEYWOOD, etc.
  role text,
  task text,
  status text default 'active', -- active | queued | done
  session_id text,
  started_at timestamptz default now()
);
```

### `brief_archive`
```sql
create table brief_archive (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  brief_date date not null,
  content text not null,
  weather_line text,
  top_pick text
);
```

### `outreach_contacts`
```sql
create table outreach_contacts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  company text,
  platform text, -- LinkedIn | Instagram | Email | Direct
  status text default 'not_started',
  last_contact timestamptz,
  notes text
);
```

### `ops_today`
```sql
create table ops_today (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  task text not null,
  priority text default 'backlog', -- priority | backlog | done
  category text,
  done boolean default false,
  sort_order int default 0
);
```

---

## API Routes

### `app/api/approvals/route.ts` (GET + POST)
### `app/api/approvals/[id]/route.ts` (PATCH — approve/deny)
### `app/api/tasks/route.ts` (GET + POST)
### `app/api/tasks/[id]/route.ts` (PATCH — update status)
### `app/api/agents/route.ts` (GET active agents)

All routes use Supabase service role key from env.
All PATCH routes require the session cookie (same auth as existing middleware).

---

## Polling Strategy
No WebSockets needed. Use client-side polling:
- `/command` page: poll every 10 seconds (agents + approvals)
- `/today` page: poll every 30 seconds
- Top bar MRR: poll every 60 seconds

Use `useEffect` + `setInterval` in client components. Show a subtle "last updated Xs ago" indicator.

---

## Agent Roster (canonical — Elizabethan playwright naming convention)

Store in `lib/agents.ts` and import everywhere agents are referenced. Non-negotiable names.

```ts
// lib/agents.ts
export const AGENT_ROSTER = [
  { name: "Marlowe",   role: "Director AI",     color: "#4ade80" },
  { name: "Chapman",   role: "Reality Gate",     color: "#839788" },
  { name: "Heywood",   role: "Ghostwriter",      color: "#FAF9F5" },
  { name: "Middleton", role: "Revenue",          color: "#D4A855" },
  { name: "Kyd",       role: "Marketing",        color: "#C4725F" },
  { name: "Dekker",    role: "Brand",            color: "#DEE3DC" },
  { name: "Beaumont",  role: "Product Design",   color: "#A8B5AB" },
  { name: "Webster",   role: "Backend",          color: "#1a5c15" },
  { name: "Fletcher",  role: "Product",          color: "#134611" },
  { name: "Jonson",    role: "The Critic",       color: "#C4725F" },
  { name: "Ford",      role: "QA / Testing",     color: "#D4A855" },
  { name: "Marston",   role: "Research",         color: "#839788" },
  { name: "Nash",      role: "Outreach",         color: "#FAF9F5" },
  { name: "Massinger", role: "Analytics",        color: "#4ade80" },
  { name: "Tourneur",  role: "Security",         color: "#C4725F" },
] as const;
```

**MarloweOrb rendering rule:**
- All 15 agents always render as satellite nodes around the central Marlowe orb
- Idle agents: 30% opacity, no glow, no connecting line
- Active agents: full opacity, pulsing color glow, animated dashed line to center orb
- Satellites arranged in two rings: inner ring (7 agents), outer ring (8 agents)
- Labels: name in mono 9px porcelain, role in mono 8px sage below

---

## Seed Data (hardcode for immediate usefulness)

### Marlowe Tasks (seed with current backlog):
- "Build Production Master v1.4" — status: active — category: TEMPLATE — priority: high
- "Fix Resend API key + test drip" — status: blocked — blocker: "Brendan needs to generate new key at app.resend.com" — category: EMAIL
- "Patch OPA-SYSTEM-BRIEF.md (wrap book line)" — status: queued — category: OPA
- "Wire update-status.sh to Supabase" — status: queued — category: INFRA
- "Save Heywood Articles 1+2 to /life/resources/linkedin/" — status: queued — category: CONTENT
- "Lemon Squeezy setup docs" — status: queued — category: TEMPLATE
- "Outreach target list (coordinators)" — status: queued — category: OPA

### Approval Queue (seed with one example):
- "Run email drip to 6 trial users" — risk: med — context: "Send Day 3/14/25 emails to real trial users via Resend. Blocked until Resend key is live." — status: pending

### Active Agents: empty (Chapman run completed)

---

## Design Notes
- Keep ALL existing brand colors (forest, porcelain, sage, terracotta, honey)
- Add `#4ade80` as "live green" (already used in current codebase)
- Scanline overlay: keep it (it's subtle and good)
- Grid background for command center: very subtle, adds depth
- Animations: use CSS keyframes, not JS-driven — keep it smooth
- Font: keep JetBrains Mono + Source Serif 4 + Inter
- Panels: keep existing `.panel` class aesthetic
- Sidebar links: mono font, 11px, tracking-wider
- Make the approval queue buttons feel satisfying — use a brief scale transform on click

---

## Package dependencies already installed
- @supabase/supabase-js ✓
- tailwindcss ✓
- typescript ✓
- next 14 app router ✓
Nothing new needed.

---

## Completion Signal
When completely done, run:
openclaw system event --text "Done: Mission Control v2 built — sidebar nav, Marlowe command center, approval queue, task board, 6 new pages, 6 new Supabase tables" --mode now
