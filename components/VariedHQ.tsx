"use client";

import { useEffect, useState, useCallback } from "react";
import { AGENT_ROSTER, Agent } from "@/lib/agents";
import Link from "next/link";

/* ─── Layout constants (percentage-based) ─── */
const WORLD_PAD = 3; // % padding from edges for perimeter positions
const OFFICE = { x: 25, y: 22, w: 50, h: 56 }; // center rectangle

/* ─── Perimeter slot generation ─── */
function generatePerimeterSlots(count: number): { x: number; y: number }[] {
  // Distribute agents evenly around the perimeter (top, right, bottom, left walls)
  const slots: { x: number; y: number }[] = [];
  const topY = WORLD_PAD + 2;
  const botY = 100 - WORLD_PAD - 8;
  const leftX = WORLD_PAD + 2;
  const rightX = 100 - WORLD_PAD - 2;

  // Perimeter: top edge, right edge, bottom edge, left edge
  const perimeterPoints: { x: number; y: number }[] = [];

  // Top wall — spread across x
  for (let i = 0; i < 5; i++) {
    perimeterPoints.push({ x: 8 + i * 20, y: topY + Math.random() * 3 });
  }
  // Bottom wall
  for (let i = 0; i < 5; i++) {
    perimeterPoints.push({ x: 8 + i * 20, y: botY - Math.random() * 3 });
  }
  // Left wall
  for (let i = 0; i < 3; i++) {
    perimeterPoints.push({ x: leftX + Math.random() * 3, y: 20 + i * 25 });
  }
  // Right wall
  for (let i = 0; i < 3; i++) {
    perimeterPoints.push({ x: rightX - Math.random() * 3, y: 20 + i * 25 });
  }

  // Shuffle and return enough slots
  const shuffled = perimeterPoints.sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    slots.push(shuffled[i % shuffled.length]);
  }
  return slots;
}

function randomPerimeterPos(): { x: number; y: number } {
  const wall = Math.floor(Math.random() * 4);
  const jitter = () => Math.random() * 4 - 2;
  switch (wall) {
    case 0: // top
      return { x: 8 + Math.random() * 84, y: WORLD_PAD + 2 + jitter() };
    case 1: // bottom
      return { x: 8 + Math.random() * 84, y: 92 - WORLD_PAD + jitter() };
    case 2: // left
      return { x: WORLD_PAD + 2 + jitter(), y: 12 + Math.random() * 76 };
    case 3: // right
    default:
      return { x: 98 - WORLD_PAD + jitter(), y: 12 + Math.random() * 76 };
  }
}

function randomOfficePos(): { x: number; y: number } {
  const px = 6;
  const py = 8;
  return {
    x: OFFICE.x + px + Math.random() * Math.max(1, OFFICE.w - px * 2),
    y: OFFICE.y + py + Math.random() * Math.max(1, OFFICE.h - py * 2),
  };
}

/* ─── Color helpers ─── */
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
  active,
}: {
  agent: Agent;
  walkFrame: number;
  glow?: boolean;
  active?: boolean;
}) {
  const head = lighten(agent.color, 20);
  const body = agent.color;
  const legs = darken(agent.color, 45);
  const f = active ? walkFrame % 2 : 0; // idle agents stand still

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: glow
          ? `drop-shadow(0 0 6px ${agent.color}80)`
          : active
            ? `drop-shadow(0 0 4px ${agent.color}50)`
            : "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
        transition: "filter 200ms ease",
        opacity: active ? 1 : 0.55,
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

/* ─── Furniture pieces ─── */
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
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    // Start everyone on perimeter
    const init: Record<string, { x: number; y: number }> = {};
    const slots = generatePerimeterSlots(AGENT_ROSTER.length);
    AGENT_ROSTER.forEach((a, i) => {
      init[a.name] = slots[i];
    });
    return init;
  });

  const [frame, setFrame] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  /* Poll activity to determine active agents */
  const pollActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity?limit=30", { cache: "no-store" });
      const data = await res.json();
      const entries = data.activity || [];

      // Agent is "active" if their name appears in a recent job (within last 5 minutes)
      // or if the job is currently running
      const now = Date.now();
      const recentThreshold = 5 * 60 * 1000; // 5 minutes
      const active = new Set<string>();

      const agentNames = AGENT_ROSTER.map((a) => a.name.toLowerCase());

      for (const entry of entries) {
        const jobName = (entry.jobName || "").toLowerCase();
        const ts = entry.completedAtMs || entry.startedAtMs || 0;
        const isRecent = now - ts < recentThreshold;
        const isRunning = entry.status === "running";

        if (isRecent || isRunning) {
          // Try to match agent name in the job name
          for (const name of agentNames) {
            if (jobName.includes(name)) {
              active.add(
                AGENT_ROSTER.find(
                  (a) => a.name.toLowerCase() === name
                )!.name
              );
            }
          }
        }
      }

      // If no agents matched from activity, randomly activate 2-4 agents
      // to keep the visualization interesting
      if (active.size === 0) {
        const shuffled = [...AGENT_ROSTER].sort(() => Math.random() - 0.5);
        const count = 2 + Math.floor(Math.random() * 3);
        shuffled.slice(0, count).forEach((a) => active.add(a.name));
      }

      setActiveAgents(active);
    } catch {
      // On error, randomly activate a few agents
      const shuffled = [...AGENT_ROSTER].sort(() => Math.random() - 0.5);
      const count = 2 + Math.floor(Math.random() * 3);
      const active = new Set<string>();
      shuffled.slice(0, count).forEach((a) => active.add(a.name));
      setActiveAgents(active);
    }
  }, []);

  useEffect(() => {
    pollActivity();
    const id = setInterval(pollActivity, 30000);
    return () => clearInterval(id);
  }, [pollActivity]);

  /* Walk-cycle frame toggle (300ms) */
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 300);
    return () => clearInterval(id);
  }, []);

  /* Move agents based on active state */
  useEffect(() => {
    // Immediately position agents based on active state
    setPositions((prev) => {
      const next = { ...prev };
      AGENT_ROSTER.forEach((agent) => {
        if (activeAgents.has(agent.name)) {
          // Move to office
          next[agent.name] = randomOfficePos();
        } else {
          // Move to perimeter (only if currently in office area)
          const cur = prev[agent.name];
          if (
            cur &&
            cur.x > OFFICE.x - 2 &&
            cur.x < OFFICE.x + OFFICE.w + 2 &&
            cur.y > OFFICE.y - 2 &&
            cur.y < OFFICE.y + OFFICE.h + 2
          ) {
            next[agent.name] = randomPerimeterPos();
          }
        }
      });
      return next;
    });
  }, [activeAgents]);

  /* Idle drift: perimeter agents shuffle slightly, office agents reposition within office */
  useEffect(() => {
    const id = setInterval(() => {
      setPositions((prev) => {
        const next = { ...prev };
        const shuffled = [...AGENT_ROSTER].sort(() => Math.random() - 0.5);
        const count = 3 + Math.floor(Math.random() * 3);

        shuffled.slice(0, count).forEach((agent) => {
          if (activeAgents.has(agent.name)) {
            // Active agents shuffle within the office
            next[agent.name] = randomOfficePos();
          } else {
            // Idle agents drift slightly along perimeter
            const cur = prev[agent.name];
            if (cur) {
              next[agent.name] = {
                x: cur.x + (Math.random() - 0.5) * 4,
                y: cur.y + (Math.random() - 0.5) * 4,
              };
              // Clamp to keep on perimeter-ish area
              next[agent.name].x = Math.max(
                WORLD_PAD,
                Math.min(100 - WORLD_PAD, next[agent.name].x)
              );
              next[agent.name].y = Math.max(
                WORLD_PAD + 4,
                Math.min(100 - WORLD_PAD - 4, next[agent.name].y)
              );
            }
          }
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [activeAgents]);

  const activeCount = activeAgents.size;

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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: activeCount > 0 ? "#4ade80" : "var(--text-muted)",
              letterSpacing: "0.05em",
            }}
          >
            {activeCount} active
          </span>
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

        {/* Perimeter zone — subtle border glow on walls */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0 30px rgba(255,255,255,0.015)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Center OFFICE rectangle */}
        <div
          style={{
            position: "absolute",
            left: `${OFFICE.x}%`,
            top: `${OFFICE.y}%`,
            width: `${OFFICE.w}%`,
            height: `${OFFICE.h}%`,
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 3,
            background: "rgba(255,255,255,0.018)",
            zIndex: 0,
          }}
        >
          {/* Office floor pattern — denser grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
              `,
              backgroundSize: "12px 12px",
              borderRadius: 3,
              pointerEvents: "none",
            }}
          />

          {/* "THE FLOOR" label */}
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.1)",
              fontWeight: 500,
              userSelect: "none",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            THE FLOOR
          </span>

          {/* Active count badge */}
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 7,
              letterSpacing: "0.08em",
              color: activeCount > 0 ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.06)",
              fontWeight: 400,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {activeCount > 0 ? `${activeCount} WORKING` : "IDLE"}
          </span>
        </div>

        {/* Corner labels for perimeter zones */}
        <span
          style={{
            position: "absolute",
            top: 6,
            left: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.06)",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          STANDBY
        </span>
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.06)",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          STANDBY
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 6,
            left: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.06)",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          STANDBY
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 6,
            right: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.06)",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          STANDBY
        </span>

        {/* Furniture inside the office */}
        <Desk x={35} y={35} />
        <Desk x={42} y={35} />
        <Desk x={55} y={35} />
        <Desk x={62} y={35} />
        <Desk x={35} y={55} />
        <Desk x={55} y={55} />
        <Server x={27} y={40} />
        <Server x={27} y={50} />
        <Server x={73} y={40} />

        {/* Agent sprites */}
        {AGENT_ROSTER.map((agent) => {
          const pos = positions[agent.name];
          if (!pos) return null;
          const isHovered = hovered === agent.name;
          const isActive = activeAgents.has(agent.name);
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
                    background: "rgba(0,0,0,0.92)",
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
                      color: isActive ? "#4ade80" : "var(--text-tertiary)",
                      marginTop: 2,
                    }}
                  >
                    {isActive ? "WORKING" : "STANDBY"} · {agent.types.join(" · ")}
                  </div>
                </div>
              )}

              <Sprite
                agent={agent}
                walkFrame={frame}
                glow={isHovered || isOpus}
                active={isActive}
              />

              {/* Name tag */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 7,
                  color: isActive ? `${agent.color}cc` : `${agent.color}55`,
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

        {/* "THE VARIED" watermark */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: "rgba(255,255,255,0.03)",
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
