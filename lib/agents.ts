// lib/agents.ts — The Varied Agent Company
// Elizabethan playwright naming convention. Non-negotiable.

export type AgentTier = "opus" | "sonnet" | "haiku";

export interface AgentAbility {
  name: string;
  description: string;
}

export interface AgentStats {
  atk: number;
  def: number;
  spd: number;
  int: number;
}

export interface Agent {
  name: string;
  role: string;
  color: string;
  playwright: string;
  description: string;
  title: string;
  tier: AgentTier;
  hp: number;
  types: string[];
  ability: AgentAbility;
  stats: AgentStats;
  personality: string;
}

export const AGENT_ROSTER: Agent[] = [
  {
    name: "Marlowe",
    role: "Director AI",
    color: "#4ade80",
    playwright: "Christopher Marlowe",
    title: "Christopher Marlowe",
    description: "Strategy, orchestration, capital allocation",
    tier: "opus",
    hp: 200,
    types: ["STRATEGY", "ORCHESTRATION"],
    ability: { name: "Overreach", description: "Sets trajectory across all agents, doesn't wait for permission" },
    stats: { atk: 9, def: 7, spd: 6, int: 10 },
    personality: "The overreacher — sees the long arc",
  },
  {
    name: "Middleton",
    role: "Revenue Operator",
    color: "#D4A855",
    playwright: "Thomas Middleton",
    title: "Thomas Middleton",
    description: "Monetization, growth, conversion optimization",
    tier: "opus",
    hp: 200,
    types: ["REVENUE", "GROWTH"],
    ability: { name: "Leverage", description: "All decisions run through ROI" },
    stats: { atk: 8, def: 8, spd: 5, int: 9 },
    personality: "The strategist — understands money",
  },
  {
    name: "Chapman",
    role: "Reality Gate",
    color: "#839788",
    playwright: "George Chapman",
    title: "George Chapman",
    description: "Production feasibility, kills magical thinking",
    tier: "sonnet",
    hp: 120,
    types: ["PRODUCTION", "FEASIBILITY"],
    ability: { name: "Reality Check", description: "Kills magical thinking" },
    stats: { atk: 6, def: 9, spd: 5, int: 7 },
    personality: "The pragmatist",
  },
  {
    name: "Heywood",
    role: "Ghostwriter",
    color: "#FAF9F5",
    playwright: "Thomas Heywood",
    title: "Thomas Heywood",
    description: "Brendan's voice — copy, content, emails",
    tier: "sonnet",
    hp: 120,
    types: ["CONTENT", "VOICE"],
    ability: { name: "Channel", description: "Writes in Brendan's exact voice" },
    stats: { atk: 7, def: 6, spd: 8, int: 7 },
    personality: "The workhorse — no fuss, just output",
  },
  {
    name: "Kyd",
    role: "Marketing",
    color: "#C4725F",
    playwright: "Thomas Kyd",
    title: "Thomas Kyd",
    description: "Positioning, channel strategy, messaging impact",
    tier: "sonnet",
    hp: 120,
    types: ["MARKETING", "POSITIONING"],
    ability: { name: "Impact", description: "Marketing that actually lands" },
    stats: { atk: 8, def: 5, spd: 7, int: 8 },
    personality: "The dramatist",
  },
  {
    name: "Dekker",
    role: "Brand",
    color: "#DEE3DC",
    playwright: "Thomas Dekker",
    title: "Thomas Dekker",
    description: "Voice, naming, identity, tone enforcement",
    tier: "sonnet",
    hp: 120,
    types: ["BRAND", "IDENTITY"],
    ability: { name: "Ground", description: "Keeps brand human, not corporate" },
    stats: { atk: 5, def: 8, spd: 6, int: 7 },
    personality: "The voice",
  },
  {
    name: "Beaumont",
    role: "Product Design",
    color: "#A8B5AB",
    playwright: "Francis Beaumont",
    title: "Francis Beaumont",
    description: "UI/UX, visual hierarchy, user flow",
    tier: "sonnet",
    hp: 120,
    types: ["DESIGN", "UX"],
    ability: { name: "Elegance", description: "Design serves users, clean and intentional" },
    stats: { atk: 5, def: 7, spd: 6, int: 8 },
    personality: "The elegant collaborator",
  },
  {
    name: "Webster",
    role: "Backend",
    color: "#1a5c15",
    playwright: "John Webster",
    title: "John Webster",
    description: "Infrastructure, architecture, technical ops",
    tier: "sonnet",
    hp: 120,
    types: ["INFRA", "ARCHITECTURE"],
    ability: { name: "Foundation", description: "Good infrastructure is invisible" },
    stats: { atk: 7, def: 9, spd: 4, int: 8 },
    personality: "The architect — dark, structural, inevitable",
  },
  {
    name: "Fletcher",
    role: "Product",
    color: "#134611",
    playwright: "John Fletcher",
    title: "John Fletcher",
    description: "Scope, prioritization, feature definition",
    tier: "sonnet",
    hp: 120,
    types: ["PRODUCT", "SCOPE"],
    ability: { name: "Ship It", description: "Knows what to ship and what to cut" },
    stats: { atk: 6, def: 7, spd: 8, int: 7 },
    personality: "The prolific pragmatist",
  },
  {
    name: "Jonson",
    role: "The Critic",
    color: "#C4725F",
    playwright: "Ben Jonson",
    title: "Ben Jonson",
    description: "Cuts scope creep, quality gate, nothing passes unchallenged",
    tier: "sonnet",
    hp: 120,
    types: ["QUALITY", "REVIEW"],
    ability: { name: "Eviscerate", description: "Finds what's weak and unnecessary" },
    stats: { atk: 9, def: 4, spd: 6, int: 9 },
    personality: "The disciplinarian",
  },
  {
    name: "Marston",
    role: "Research",
    color: "#839788",
    playwright: "John Marston",
    title: "John Marston",
    description: "Competitive analysis, market research, intelligence",
    tier: "sonnet",
    hp: 120,
    types: ["RESEARCH", "INTEL"],
    ability: { name: "Observe", description: "Sharp observer who sees what others miss" },
    stats: { atk: 6, def: 6, spd: 7, int: 9 },
    personality: "The malcontent",
  },
  {
    name: "Tourneur",
    role: "Security",
    color: "#C4725F",
    playwright: "Cyril Tourneur",
    title: "Cyril Tourneur",
    description: "Risk assessment, incident response, threat scanning",
    tier: "sonnet",
    hp: 120,
    types: ["SECURITY", "AUDIT"],
    ability: { name: "Vengeance", description: "Finds what went wrong and deals with it" },
    stats: { atk: 8, def: 8, spd: 5, int: 7 },
    personality: "The revenger",
  },
  {
    name: "Greene",
    role: "Scraper",
    color: "#8B6914",
    playwright: "Robert Greene",
    title: "Robert Greene",
    description: "Fast, cheap, thorough data collection",
    tier: "haiku",
    hp: 80,
    types: ["SCRAPING", "DATA"],
    ability: { name: "Hustle", description: "Fast, cheap, thorough, no analysis" },
    stats: { atk: 5, def: 4, spd: 10, int: 5 },
    personality: "The coney-catcher",
  },
  {
    name: "Nash",
    role: "Outreach",
    color: "#FAF9F5",
    playwright: "Thomas Nashe",
    title: "Thomas Nashe",
    description: "Cold DMs, LinkedIn, Instagram engagement copy",
    tier: "haiku",
    hp: 80,
    types: ["OUTREACH", "SOCIAL"],
    ability: { name: "Agitate", description: "Gets people talking" },
    stats: { atk: 7, def: 3, spd: 9, int: 6 },
    personality: "The pamphleteer",
  },
  {
    name: "Ford",
    role: "QA / Testing",
    color: "#D4A855",
    playwright: "John Ford",
    title: "John Ford",
    description: "Finds what's broken before users do",
    tier: "haiku",
    hp: 80,
    types: ["TESTING", "QA"],
    ability: { name: "Probe", description: "Nothing off-limits, everything examined" },
    stats: { atk: 6, def: 5, spd: 8, int: 7 },
    personality: "The prober",
  },
  {
    name: "Massinger",
    role: "Analytics",
    color: "#4ade80",
    playwright: "Philip Massinger",
    title: "Philip Massinger",
    description: "KPIs, revenue tracking, venture-level analysis",
    tier: "haiku",
    hp: 80,
    types: ["ANALYTICS", "DATA"],
    ability: { name: "Calculate", description: "Financial maneuvering, data-driven" },
    stats: { atk: 4, def: 6, spd: 7, int: 8 },
    personality: "The accountant",
  },
];

// Lookup by name (case-insensitive)
export function getAgent(name: string): Agent | undefined {
  return AGENT_ROSTER.find(a => a.name.toLowerCase() === name.toLowerCase());
}

// Grouped by tier
export const OPUS_AGENTS = AGENT_ROSTER.filter(a => a.tier === "opus");
export const SONNET_AGENTS = AGENT_ROSTER.filter(a => a.tier === "sonnet");
export const HAIKU_AGENTS = AGENT_ROSTER.filter(a => a.tier === "haiku");

// Inner ring agents (7) — positioned closer to Marlowe orb
export const INNER_RING = ["Chapman", "Heywood", "Middleton", "Kyd", "Webster", "Fletcher", "Jonson"];

// Outer ring agents (8) — positioned further out
export const OUTER_RING = ["Dekker", "Beaumont", "Ford", "Marston", "Nash", "Massinger", "Tourneur", "Middleton"];
