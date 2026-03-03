"use client";

import type { Agent, AgentTier } from "@/lib/agents";

type StatusMode = "active" | "building" | "idle";

type PokemonCardProps = {
  agent: Agent;
  status?: StatusMode;
};

const TIER_LABEL: Record<AgentTier, string> = {
  opus: "OPUS",
  sonnet: "SONNET",
  haiku: "HAIKU",
};

const STATUS_COLORS: Record<StatusMode, { bg: string; shadow: string }> = {
  active: { bg: "#4ade80", shadow: "0 0 6px rgba(74,222,128,0.6)" },
  building: { bg: "#f59e0b", shadow: "0 0 6px rgba(245,158,11,0.6)" },
  idle: { bg: "#52525B", shadow: "none" },
};

export default function PokemonCard({ agent, status = "idle" }: PokemonCardProps) {
  const tierClass =
    agent.tier === "opus"
      ? "pokemon-card-opus"
      : agent.tier === "sonnet"
        ? "pokemon-card-sonnet"
        : "pokemon-card-haiku";

  const statusDot = STATUS_COLORS[status];

  return (
    <div
      className={`pokemon-card ${tierClass}`}
      style={{
        "--agent-color": agent.color,
        "--agent-color-20": agent.color + "33",
        "--agent-color-40": agent.color + "66",
        "--agent-color-60": agent.color + "99",
      } as React.CSSProperties}
    >
      {/* Holographic overlay for opus */}
      {agent.tier === "opus" && <div className="pokemon-card-holo" />}

      {/* Status dot */}
      <span
        className={status === "active" ? "pokemon-status-pulse" : ""}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: statusDot.bg,
          boxShadow: statusDot.shadow,
          zIndex: 3,
        }}
      />

      {/* Header: name + HP */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, position: "relative", zIndex: 2 }}>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          fontWeight: 400,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          {agent.name}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          fontWeight: 400,
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          <HeartIcon color={agent.color} />
          {agent.hp}
        </span>
      </div>

      {/* Type badges */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, position: "relative", zIndex: 2 }}>
        {agent.types.map((type) => (
          <span
            key={type}
            style={{
              padding: "2px 8px",
              borderRadius: 10,
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fontWeight: 400,
              letterSpacing: "0.06em",
              color: agent.color,
              background: "var(--agent-color-20)",
            }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Avatar area */}
      <div style={{
        width: "100%",
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginBottom: 8,
        zIndex: 2,
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--agent-color-40) 0%, transparent 70%)`,
          filter: "blur(20px)",
        }} />
        {/* Letter */}
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: 80,
          fontWeight: 400,
          color: agent.color,
          lineHeight: 1,
          position: "relative",
          textShadow: `0 0 40px var(--agent-color-60)`,
        }}>
          {agent.name[0]}
        </span>
      </div>

      {/* Tier badge */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, position: "relative", zIndex: 2 }}>
        <span className={`pokemon-tier-badge pokemon-tier-${agent.tier}`}>
          {TIER_LABEL[agent.tier]}
        </span>
      </div>

      {/* Ability section */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderLeft: `3px solid ${agent.color}`,
        borderRadius: 4,
        padding: "8px 10px",
        marginBottom: 12,
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-primary)",
          marginBottom: 2,
        }}>
          {agent.ability.name}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 300,
          color: "var(--text-muted)",
          lineHeight: 1.4,
        }}>
          {agent.ability.description}
        </div>
      </div>

      {/* Stats bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, position: "relative", zIndex: 2 }}>
        {(["atk", "def", "spd", "int"] as const).map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 400,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              width: 26,
              flexShrink: 0,
            }}>
              {key}
            </span>
            <div style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${agent.stats[key] * 10}%`,
                height: "100%",
                borderRadius: 2,
                background: agent.color,
                transition: "width 0.6s ease",
              }} />
            </div>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-muted)",
              width: 14,
              textAlign: "right",
              flexShrink: 0,
            }}>
              {agent.stats[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, position: "relative", zIndex: 2 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 300,
          color: "var(--text-muted)",
          marginBottom: 2,
        }}>
          {agent.role}
        </div>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: 11,
          fontStyle: "italic",
          color: "var(--text-tertiary)",
          lineHeight: 1.3,
        }}>
          {agent.personality}
        </div>
      </div>
    </div>
  );
}

function HeartIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
