# Marlowe Dashboard — Build Spec
_Deploy target: Vercel | Stack: Next.js_
_Purpose: Single-pane visibility into OPA health, revenue, roadmap, agent activity_
_Access: Password-protected or secret URL — Brendan's personal devices, not on this machine_

---

## What It Shows

### Panel 1 — Revenue
- MRR (current + delta from last week)
- Paying users
- Trial signups this week
- Gumroad/LemonSqueezy revenue (when live)
- Guest upload → trial conversion rate

### Panel 2 — Roadmap
- iOS blocks: 2 / 3 / 5 / 7 with status (not started / in progress / shipped)
- Web items: guest upload funnel, quick-scan button, export CTA
- Revenue streams: each of the 6 streams with status
- PO Book: architecture start date + beta target

### Panel 3 — Marlowe Activity
- Last heartbeat: date, risk score, leverage score
- Last 5 changes from ~/life/logs/changes.md
- Active agent runs (if any)
- Last KPI update

### Panel 4 — System Health
- Heartbeat status (last run + next due)
- Tier 1 write status (unlocked / frozen)
- Open action items (from OPA-ROADMAP.md)

---

## Data Source

A single JSON file: `~/life/status.json`
Marlowe writes to this file on every heartbeat and significant event.
Dashboard fetches from GitHub raw URL (public repo) or a simple Vercel API route.

### status.json schema
```json
{
  "updatedAt": "2026-02-24T09:00:00Z",
  "mrr": 343,
  "payingUsers": 7,
  "trialsThisWeek": 0,
  "gumroadRevenue": 0,
  "heartbeat": {
    "lastRun": "2026-02-24T02:30:00Z",
    "riskScore": 2,
    "leverageScore": 3,
    "tier1Status": "unlocked"
  },
  "roadmap": {
    "iosBlock2": "not_started",
    "iosBlock3": "not_started",
    "iosBlock5": "not_started",
    "iosBlock7": "not_started",
    "guestUploadFunnel": "specced",
    "gumroadPack": "building",
    "seoArticles": 2,
    "mexicoActivated": false,
    "foundingMemberSent": false,
    "poBookStarted": false
  },
  "recentChanges": [],
  "activeAgents": []
}
```

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS — OPA brand colors
- **Typography:** Inter (body), JetBrains Mono (numbers/data)
- **Data:** Fetch from GitHub raw or Vercel KV
- **Auth:** Simple password via middleware (one env var)
- **Deploy:** Vercel (separate project from OPA)

---

## Design Principles

- OPA brand colors (Forest, Ink, Porcelain, Moss, Sage)
- No charts or graphs — numbers only (per OPA design guardrails)
- Mobile-first — Brendan reads this from his phone
- Dark mode optional (but not default)
- Last updated timestamp always visible
- If data is stale (>24h), show warning

---

## What I Need From Brendan

1. GitHub account access (to create a new repo: `opa-dashboard`)
2. Vercel account access (or a deploy token)
3. Decision: GitHub raw file (simple, public) or Vercel KV (private, more robust)?

---

## Build Order

1. status.json schema + Marlowe write script
2. Next.js app scaffold with OPA brand
3. Four panels with hardcoded data first
4. Wire up data fetch from status.json
5. Auth middleware (password protect)
6. Deploy to Vercel
7. Marlowe writes status.json on every heartbeat automatically

Estimated build time: 1 focused session (~3-4 hours)
