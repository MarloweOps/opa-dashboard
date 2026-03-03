"use client";

import { useEffect, useState } from "react";
import { AGENT_ROSTER, Agent } from "@/lib/agents";
import Link from "next/link";

/* ─── Room layout (percentage-based coordinates) ─── */
interface Room {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: string;
}

const ROOMS: Room[] = [
  { id: "command",     label: "COMMAND CENTER", x: 33, y: 0,  w: 34, h: 28, icon: "⚡" },
  { id: "research",    label: "RESEARCH",       x: 0,  y: 0,  w: 31, h: 28, icon: "🔍" },
  { id: "revenue",     label: "REVENUE LAB",    x: 69, y: 0,  w: 31, h: 28, icon: "💰" },
  { id: "content",     label: "CONTENT",        x: 69, y: 36, w: 31, h: 27, icon: "✍️" },
  { id: "engineering", label: "ENGINEERING",     x: 0,  y: 36, w: 31, h: 27, icon: "⚙️" },
  { id: "security",    label: "SECURITY",        x: 0,  y: 71, w: 31, h: 29, icon: "🛡️" },
  { id: "outreach",    label: "OUTREACH",        x: 69, y: 71, w: 31, h: 29, icon: "📡" },
];

const CORRIDOR = { x: 33, y: 30, w: 34, h: 70 };

/* ─── Agent-to-room mapping ─── */
const AGENT_HOME: Record<string, string> = {
  Marlowe: "command",
  Middleton: "revenue",
  Chapman: "research",
  Heywood: "content",
  Kyd: "content",
  Dekker: "content",
  Beaumont: "outreach",
  Webster: "engineering",
  Fletcher: "engineering",
  Jonson: "command",
  Marston: "research",
  Tourneur: "security",
  Greene: "research",
  Nash: "outreach",
  Ford: "engineering",
  Massinger: "revenue",
};

/* ─── Helpers ─── */
function getRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

function randomInRoom(room: { x: number; y: number; w: number; h: number }) {
  const px = 6;
  const py = 8;
  return {
    x: room.x + px + Math.random() * Math.max(1, room.w - px * 2),
    y: room.y + py + Math.random() * Math.max(1, room.h - py * 2),
  };
}

function lighten(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function darken(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/* ─── Pixel character sprite ─── */
function Sprite({
  agent,
  walkFrame,
  glow,
}: {
  agent: Agent;
  walkFrame: number;
  glow?: boolean;
}) {
  const head = lighten(agent.color, 20);
  const body = agent.color;
  const legs = darken(agent.color, 45);
  const f = walkFrame % 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: glow
          ? `drop-shadow(0 0 6px ${agent.color}80)`
          : "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
        transition: "filter 200ms ease",
      }}
    >
      {/* Head */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: head,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 2,
            width: 2,
            height: 2,
            borderRadius: 1,
            background: "#111",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 2,
            width: 2,
            height: 2,
            borderRadius: 1,
            background: "#111",
          }}
        />
      </div>
      {/* Body */}
      <div
        style={{
          width: 12,
          height: 9,
          borderRadius: "0 0 2px 2px",
          background: body,
          marginTop: -1,
          zIndex: 1,
          transform: `translateY(${f === 0 ? 0 : -1}px)`,
        }}
      />
      {/* Legs */}
      <div style={{ display: "flex", gap: f === 0 ? 4 : 2, marginTop: -1 }}>
        <div
          style={{
            width: 3,
            height: 4,
            borderRadius: "0 0 1px 1px",
            background: legs,
            transform: `translateY(${f === 0 ? 0 : -1}px)`,
          }}
        />
        <div
          style={{
            width: 3,
            height: 4,
            borderRadius: "0 0 1px 1px",
            background: legs,
            transform: `translateY(${f !== 0 ? 0 : -1}px)`,
          }}
        />
      </div>
      {/* Shadow */}
      <div
        style={{
          width: 10,
          height: 3,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.3)",
          marginTop: 1,
        }}
      />
    </div>
  );
}

/* ─── Furniture pieces (small pixel decorations per room) ─── */
function Desk({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: 16,
        height: 10,
        background: "#1a1a1f",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 1,
        zIndex: 1,
      }}
    />
  );
}

function Server({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: 8,
        height: 14,
        background: "#12151a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 1,
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "#4ade80",
          margin: "2px auto 0",
          boxShadow: "0 0 4px #4ade8060",
        }}
      />
    </div>
  );
}

/* ─── Main component ─── */
export default function VariedHQ() {
  /* Positions: { agentName: {x, y} } */
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    const init: Record<string, { x: number; y: number }> = {};
    AGENT_ROSTER.forEach((a) => {
      const room = getRoom(AGENT_HOME[a.name] || "command");
      if (room) init[a.name] = randomInRoom(room);
    });
    return init;
  });

  const [frame, setFrame] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  /* Walk-cycle frame toggle (300ms) */
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 300);
    return () => clearInterval(id);
  }, []);

  /* Staggered movement: move 3-5 random agents every ~2.5s */
  useEffect(() => {
    const id = setInterval(() => {
      setPositions((prev) => {
        const next = { ...prev };
        const shuffled = [...AGENT_ROSTER].sort(() => Math.random() - 0.5);
        const count = 3 + Math.floor(Math.random() * 3);

        shuffled.slice(0, count).forEach((agent) => {
          const roll = Math.random();
          let target: { x: number; y: number };

          if (roll < 0.7) {
            /* Stay in home room */
            const room = getRoom(AGENT_HOME[agent.name] || "command");
            target = room ? randomInRoom(room) : { x: 50, y: 50 };
          } else if (roll < 0.9) {
            /* Walk the corridor */
            target = randomInRoom(CORRIDOR);
          } else {
            /* Visit a random room */
            const r = ROOMS[Math.floor(Math.random() * ROOMS.length)];
            target = randomInRoom(r);
          }

          next[agent.name] = target;
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-3)",
        }}
      >
        <span className="t-label">The Varied HQ</span>
        <Link
          href="/agents"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Full Roster →
        </Link>
      </div>

      {/* Game world container */}
      <div
        className="hq-world"
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "58%",
          background: "#08080a",
          borderRadius: 4,
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Pixel grid floor */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Rooms */}
        {ROOMS.map((room) => (
          <div
            key={room.id}
            style={{
              position: "absolute",
              left: `${room.x}%`,
              top: `${room.y}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 2,
              background: "rgba(255,255,255,0.012)",
              zIndex: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 4,
                left: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.12)",
                fontWeight: 400,
                userSelect: "none",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              {room.icon} {room.label}
            </span>
          </div>
        ))}

        {/* Central corridor */}
        <div
          style={{
            position: "absolute",
            left: `${CORRIDOR.x}%`,
            top: `${CORRIDOR.y}%`,
            width: `${CORRIDOR.w}%`,
            height: `${CORRIDOR.h}%`,
            borderLeft: "1px dashed rgba(255,255,255,0.035)",
            borderRight: "1px dashed rgba(255,255,255,0.035)",
            background: "rgba(255,255,255,0.006)",
            zIndex: 0,
          }}
        />

        {/* Furniture / decoration */}
        <Desk x={46} y={10} />
        <Desk x={48} y={14} />
        <Server x={4} y={42} />
        <Server x={8} y={42} />
        <Server x={12} y={42} />
        <Desk x={74} y={42} />
        <Desk x={82} y={42} />
        <Desk x={10} y={10} />
        <Desk x={76} y={10} />

        {/* Agent sprites */}
        {AGENT_ROSTER.map((agent) => {
          const pos = positions[agent.name];
          if (!pos) return null;
          const isHovered = hovered === agent.name;
          const isOpus = agent.tier === "opus";

          return (
            <div
              key={agent.name}
              onMouseEnter={() => setHovered(agent.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -100%)",
                transition: "left 2.8s ease-in-out, top 2.8s ease-in-out",
                zIndex: Math.round(pos.y) + 10,
                cursor: "pointer",
              }}
            >
              {/* Hover tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.9)",
                    border: `1px solid ${agent.color}40`,
                    borderRadius: 3,
                    padding: "4px 10px",
                    whiteSpace: "nowrap",
                    zIndex: 200,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: agent.color,
                      fontWeight: 500,
                    }}
                  >
                    {agent.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 8,
                      color: "var(--text-muted)",
                    }}
                  >
                    {agent.role}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 7,
                      color: "var(--text-tertiary)",
                      marginTop: 2,
                    }}
                  >
                    {agent.types.join(" · ")}
                  </div>
                </div>
              )}

              <Sprite
                agent={agent}
                walkFrame={frame}
                glow={isHovered || isOpus}
              />

              {/* Name tag */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 7,
                  color: `${agent.color}99`,
                  marginTop: 2,
                  textAlign: "center",
                  textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {agent.name}
              </div>
            </div>
          );
        })}

        {/* "THE VARIED" watermark in corridor */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "55%",
            transform: "translate(-50%, -50%)",
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: "rgba(255,255,255,0.04)",
            letterSpacing: "0.2em",
            fontWeight: 400,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}
        >
          THE VARIED
        </div>
      </div>
    </div>
  );
}
