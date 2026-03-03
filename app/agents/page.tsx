"use client";

import PokemonCard from "@/components/PokemonCard";
import { OPUS_AGENTS, SONNET_AGENTS, HAIKU_AGENTS } from "@/lib/agents";

const TIER_SECTIONS = [
  { label: "OPUS TIER", agents: OPUS_AGENTS, accentColor: "#D4A855" },
  { label: "SONNET TIER", agents: SONNET_AGENTS, accentColor: "#A1A1AA" },
  { label: "HAIKU TIER", agents: HAIKU_AGENTS, accentColor: "#CD7F32" },
] as const;

export default function AgentsPage() {
  return (
    <div className="agents-page-wrap" style={{ padding: "var(--space-8)", maxWidth: 1400, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-2xl)",
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          lineHeight: 1,
          marginBottom: "var(--space-3)",
        }}>
          THE PLAYWRIGHTS
        </h1>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          fontWeight: 300,
          color: "var(--text-muted)",
        }}>
          16 Agents. One Mission.
        </p>
      </div>

      {/* Tier sections */}
      {TIER_SECTIONS.map((section) => (
        <div key={section.label} style={{ marginBottom: "var(--space-12)" }}>
          {/* Section header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-6)",
          }}>
            <span style={{
              width: 3,
              height: 20,
              borderRadius: 2,
              background: section.accentColor,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              fontWeight: 400,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: section.accentColor,
            }}>
              {section.label}
            </span>
            <span style={{
              flex: 1,
              height: 1,
              background: "var(--border)",
            }} />
          </div>

          {/* Card grid */}
          <div className="pokemon-grid">
            {section.agents.map((agent) => (
              <PokemonCard key={agent.name} agent={agent} status="idle" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
