# Mission Control Redesign Spec
# Reference: AI office UI with agent avatars, clean dark theme, readable cards
# Goal: Friendly, modern, easy to read. Internal tool — we can have fun.

---

## Install first
```bash
npm install lucide-react
```

---

## Design Philosophy
Current problem: mono text everywhere, heavy borders, hard to scan.
Fix: Modern SaaS dark theme. Cards breathe. Icons guide the eye. Agents feel alive.

### Color system (update globals.css)
```css
--bg-base:      #0a0d0a;   /* near-black with green tint */
--bg-surface:   #111714;   /* card backgrounds */
--bg-elevated:  #182018;   /* hover states, active elements */
--border:       rgba(255,255,255,0.07);
--border-hover: rgba(255,255,255,0.13);
--text-primary: #e8ede9;   /* main text - softer than #FAF9F5 */
--text-secondary: #7a8f7d; /* muted text */
--text-dim:     #4a5c4d;   /* very muted */
--green:        #4ade80;   /* active/working */
--amber:        #fbbf24;   /* waiting/building */
--red:          #f87171;   /* alert/blocked */
--blue:         #60a5fa;   /* info */
```

### Typography hierarchy (critical fix)
- **Headings**: Inter 600, --text-primary
- **Body/labels**: Inter 400, --text-secondary  
- **Data only** (numbers, IDs, timestamps): JetBrains Mono
- **Brand wordmark** ("The Varied"): Source Serif 4
- NO MORE mono text for everything — it kills readability

### Cards
```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.card:hover { border-color: var(--border-hover); }
```

---

## Sidebar (complete rewrite)

Width: 240px. Background: #0a0d0a (same as base, separated by border only).

```
[THE VARIED ·]          ← Source Serif, terracotta dot
MISSION CONTROL         ← mono 9px, very muted

─────────────────

⊞  Overview            ← active = green left border + bg-elevated bg
⬡  Command             ← if approvals pending: show count badge
◈  Today               
📋 Briefs              
◎  Outreach            
↓  Products            
⟳  Automations         

─────────────────

≡  Docs                
↑  Inbox               

─────────────────────── (spacer, pushes below to bottom)

● ONLINE  18:24:07      ← green dot, live clock, mono font
```

Use lucide-react icons. Suggested mapping:
- Overview → `LayoutDashboard`
- Command → `Bot` (with badge)
- Today → `CheckSquare`
- Briefs → `Newspaper`
- Outreach → `Users`
- Products → `Package`
- Automations → `Timer`
- Docs → `FileText`
- Inbox → `Inbox`

Active state: `bg-elevated` bg + left border 2px `--green` + text goes `--text-primary`.
Hover state: `bg-elevated` bg, no border change.
Icon size: 16px, color matches text.

---

## TopBar (full width minus sidebar)

Height: 56px. `bg-surface` with bottom border. Sticky.

LEFT: Page title (Inter 600, 16px, --text-primary)
CENTER: Live MRR pill → `$0 MRR` in green pill badge (mono font)
RIGHT: 
  - Search button (icon + "Search" text + `⌘K` badge) — lucide `Search`
  - Divider
  - `B` avatar circle (Brendan, indigo) + `M` avatar circle (Marlowe, green) side by side
  - Live status dot (green pulse)

---

## /command — The Office (full redesign)

### Header
```
⬡ The Office                    ● Working  ○ Building  ○ Waiting  ● Idle
AI team headquarters — live view
```

Status legend in top right: colored dots + labels. Clean and readable.

### Agent Grid (main section, replaces the SVG orb)

Title: "The Company" with agent count

Grid layout: 4 or 5 columns, responsive.

Each **AgentCard**:
```
┌──────────────────────────────┐
│  [M]  ● ACTIVE               │  ← avatar circle + status badge top-right
│                               │
│  Marlowe                      │  ← Inter 600, 15px
│  Director AI                  │  ← Inter 400, 13px, muted
│                               │
│  Building Mission Control v2  │  ← current task, 12px, truncated 1 line
│  ████████░░  running 14m      │  ← progress bar + timer (if active)
└──────────────────────────────┘
```

Avatar circle: 44px, agent's color (from AGENT_ROSTER), initials in white.
Status badge (top-right corner of card): colored dot + label
- ACTIVE: green dot, green text bg-pill
- BUILDING: amber dot, amber
- WAITING: amber dot, "NEEDS INPUT"
- IDLE: gray dot, gray

Card states:
- Active agent: card has green left border (3px), slight green bg tint
- Idle: normal card, 60% opacity on avatar
- No hover for agents with no active task → show "Available" in gray

Clicking an agent card → opens a slide-over/drawer showing:
- Full task description
- Session ID (mono)
- Kill/Steer buttons (only if active)
- Last output preview

### Marlowe section (special — top of grid, full width)
Marlowe gets a wider "hero card" across the top:
```
┌─────────────────────────────────────────────────────────────────┐
│  [M]  MARLOWE — Director AI                    ● ACTIVE  14m   │
│  "Building Mission Control v2 — sidebar, agent grid, approvals" │
│  ████████████████████████████████░░░░  82%                      │
└─────────────────────────────────────────────────────────────────┘
```

### Approval Queue (right column, ~340px)

Title: "Approvals" + count badge in amber

Each approval card:
```
┌────────────────────────────────┐
│  ⚠ MED                         │  ← risk badge
│  Run email drip                │  ← title, Inter 600
│  Send Day 3/14/25 emails...    │  ← description, 2 lines
│                                 │
│  Context:                       │
│  ┌ monospace context block ──┐  │
│  │ via Resend to 6 trial...  │  │
│  └─────────────────────────┘   │
│                                 │
│  [✓ Approve]    [✗ Deny]       │  ← green + red buttons
└────────────────────────────────┘
```

On approve/deny: smooth card collapse animation.
Empty state: green checkmark icon + "No pending approvals" — centered, friendly.

### Live Activity Feed (below grid or right column)

Title: "Live Activity" + "Last hour" muted label

Each item:
```
● Chapman · completed language audit   42m ago
● Heywood · email copy drafted         1h ago
```

Colored dot matches agent color. Agent name is bold. Rest is muted. Mono timestamp.

---

## /today — Today's Focus (redesign)

Clean two-column layout:

Left (tasks):
- Section headers: PRIORITY (green accent line), BACKLOG (muted), DONE (strikethrough)
- Task rows: checkbox (custom styled), task text, category pill badge
- Checking a task: smooth strikethrough + fade animation
- "Last synced X minutes ago" at top right in tiny muted text

Right panel:
- "80/20 Focus" card — Marlowe's recommended top priority in a highlighted card
- Quick stats: trials remaining, days until oldest trial expires, MRR
- Quick links as icon buttons: app.useopa.com ↗, Linear ↗, Resend ↗

---

## /outreach — Outreach Tracker (redesign)

Table → Card/List hybrid. Each coordinator:
```
[Avatar initials]  Sarah Kim                   ● RESPONDED
                   Coordinator · Studioname    
                   Last contact: 2 days ago    [LinkedIn ↗]  [Notes ▼]
```

Status filter pills at top: All | Not Started | Messaged | Responded | Converted
Add Contact: floating + button bottom right, opens modal

---

## /briefs — Brief Archive (redesign)

Card grid, 3 columns:
```
┌─────────────────────┐
│  Feb 25, 2026       │
│  ☀ 69°F · Clear    │
│                     │
│  PYPL · AMD · SOUN  │  ← stock picks
│                     │
│  5 news items       │
│  3 priority tasks   │
│                     │
│  [Read full brief →] │
└─────────────────────┘
```

Click → modal/drawer with full brief content, nicely formatted.

---

## Global patterns to apply everywhere

### Status pills
```css
.pill-green  { background: rgba(74,222,128,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
.pill-amber  { background: rgba(251,191,36,0.12);  color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
.pill-red    { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }
.pill-gray   { background: rgba(255,255,255,0.05); color: #7a8f7d; border: 1px solid rgba(255,255,255,0.08); }
```

### Section headers
```
SECTION TITLE          ← Inter 700, 11px, letter-spacing 0.1em, --text-dim, UPPERCASE
```

### Animations
- Status dots: CSS pulse keyframe (existing, keep)
- Card hover: `transition: border-color 150ms, background 150ms`
- Approval approve/deny: `transition: all 300ms` + `transform: translateX(20px)` + `opacity: 0`
- Task check: `transition: all 200ms` strikethrough

### Empty states
Every empty state gets: centered icon (48px, muted) + heading + subtext. No blank panels.

---

## What NOT to change
- Auth/middleware logic
- Supabase data fetching (lib/data.ts)
- API routes
- The `AGENT_ROSTER` from lib/agents.ts — just render it better
- Existing page content/data — just reskin how it looks

---

## Execution order
1. `npm install lucide-react`
2. Update `globals.css` — new CSS variables, card class, pill classes, remove old mono-heavy rules
3. Rewrite `components/Sidebar.tsx` — icons, Inter font, live clock, active states
4. Rewrite `components/TopBar.tsx` — cleaner layout, MRR pill, avatar circles  
5. Rewrite `components/AgentCard.tsx` — avatar circle, status, task, progress bar
6. Rewrite `components/MarloweOrb.tsx` → rename to `MarloweBanner.tsx` — hero card style
7. Rewrite `components/ApprovalCard.tsx` — cleaner layout, better buttons
8. Update `app/command/page.tsx` — agent grid + approval queue two-column layout
9. Update `app/today/page.tsx` — task list redesign
10. Update `app/briefs/page.tsx` — card grid
11. Update `app/outreach/page.tsx` — list hybrid
12. Update `app/page.tsx` (overview) — same panels but use new card/pill/typography styles
13. Commit + push

When completely done, run:
openclaw system event --text "Done: Mission Control redesign — modern cards, agent grid, icons, readable typography" --mode now
