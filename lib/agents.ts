// lib/agents.ts — The Varied Agent Company
// Elizabethan playwright naming convention. Non-negotiable.

export interface Agent {
  name: string;
  role: string;
  color: string;
  playwright: string;
  description: string;
}

export const AGENT_ROSTER: Agent[] = [
  { name: "Marlowe",   role: "Director AI",    color: "#4ade80", playwright: "Christopher Marlowe", description: "Strategy, orchestration, capital allocation" },
  { name: "Chapman",   role: "Reality Gate",   color: "#839788", playwright: "George Chapman",      description: "Production feasibility, kills magical thinking" },
  { name: "Heywood",   role: "Ghostwriter",    color: "#FAF9F5", playwright: "Thomas Heywood",      description: "Brendan's voice — copy, content, emails" },
  { name: "Middleton", role: "Revenue",        color: "#D4A855", playwright: "Thomas Middleton",    description: "Monetization, growth, conversion optimization" },
  { name: "Kyd",       role: "Marketing",      color: "#C4725F", playwright: "Thomas Kyd",          description: "Positioning, channel strategy, messaging impact" },
  { name: "Dekker",    role: "Brand",          color: "#DEE3DC", playwright: "Thomas Dekker",       description: "Voice, naming, identity, tone enforcement" },
  { name: "Beaumont",  role: "Product Design", color: "#A8B5AB", playwright: "Francis Beaumont",    description: "UI/UX, visual hierarchy, user flow" },
  { name: "Webster",   role: "Backend",        color: "#1a5c15", playwright: "John Webster",        description: "Infrastructure, architecture, technical ops" },
  { name: "Fletcher",  role: "Product",        color: "#134611", playwright: "John Fletcher",       description: "Scope, prioritization, feature definition" },
  { name: "Jonson",    role: "The Critic",     color: "#C4725F", playwright: "Ben Jonson",          description: "Cuts scope creep, quality gate, nothing passes unchallenged" },
  { name: "Ford",      role: "QA / Testing",   color: "#D4A855", playwright: "John Ford",           description: "Finds what's broken before users do" },
  { name: "Marston",   role: "Research",       color: "#839788", playwright: "John Marston",        description: "Competitive analysis, market research, intelligence" },
  { name: "Nash",      role: "Outreach",       color: "#FAF9F5", playwright: "Thomas Nashe",        description: "Cold DMs, LinkedIn, Instagram engagement copy" },
  { name: "Massinger", role: "Analytics",      color: "#4ade80", playwright: "Philip Massinger",    description: "KPIs, revenue tracking, venture-level analysis" },
  { name: "Tourneur",  role: "Security",       color: "#C4725F", playwright: "Cyril Tourneur",      description: "Risk assessment, incident response, threat scanning" },
];

// Lookup by name (case-insensitive)
export function getAgent(name: string): Agent | undefined {
  return AGENT_ROSTER.find(a => a.name.toLowerCase() === name.toLowerCase());
}

// Inner ring agents (7) — positioned closer to Marlowe orb
export const INNER_RING = ["Chapman", "Heywood", "Middleton", "Kyd", "Webster", "Fletcher", "Jonson"];

// Outer ring agents (8) — positioned further out
export const OUTER_RING = ["Dekker", "Beaumont", "Ford", "Marston", "Nash", "Massinger", "Tourneur", "Middleton"];
