"use client";

type OrbState = "idle" | "thinking" | "working" | "waiting" | "alert";

type Agent = {
  id: string;
  name: string;
  status: string;
};

const ORB_STYLES: Record<OrbState, { color: string; pulse: string; label: string; rings: number }> = {
  idle: { color: "rgba(74,222,128,0.4)", pulse: "3s", label: "SYSTEM IDLE", rings: 1 },
  thinking: { color: "rgba(74,222,128,0.7)", pulse: "1.5s", label: "ANALYZING", rings: 2 },
  working: { color: "#4ade80", pulse: "0.8s", label: "WORKING", rings: 3 },
  waiting: { color: "#D4A855", pulse: "2s", label: "AWAITING INPUT", rings: 2 },
  alert: { color: "#C4725F", pulse: "1.3s", label: "ATTENTION REQUIRED", rings: 1 },
};

export default function MarloweOrb({
  agentState,
  stateText,
  startedAt,
  activeAgents,
}: {
  agentState: OrbState;
  stateText: string;
  startedAt?: string;
  activeAgents: Agent[];
}) {
  const style = ORB_STYLES[agentState];
  const elapsed = startedAt ? formatDuration(Date.now() - new Date(startedAt).getTime()) : "00:00";

  return (
    <section className="panel relative h-[200px] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(131,151,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(131,151,136,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundColor: "#0a0f09",
        }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <div className="relative w-[360px] h-[110px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 110" fill="none">
            {activeAgents.slice(0, 4).map((agent, index) => {
              const points = [
                { x: 180, y: 18 },
                { x: 328, y: 56 },
                { x: 180, y: 94 },
                { x: 32, y: 56 },
              ];
              const p = points[index];
              return (
                <line
                  key={agent.id}
                  x1="180"
                  y1="56"
                  x2={p.x}
                  y2={p.y}
                  stroke={style.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  className="dashline"
                />
              );
            })}
          </svg>

          {activeAgents.slice(0, 4).map((agent, index) => {
            const positions = ["top-[0px] left-[160px]", "top-[38px] left-[308px]", "top-[76px] left-[160px]", "top-[38px] left-[12px]"];
            return (
              <div key={agent.id} className={`absolute ${positions[index]} flex flex-col items-center -translate-x-1/2 -translate-y-1/2`}>
                <span
                  className="w-10 h-10 rounded-full border border-sage/40 bg-forest/30"
                  style={{ boxShadow: `0 0 18px ${style.color}` }}
                />
                <span className="mono text-[9px] text-sage mt-1 tracking-wider">{agent.name}</span>
              </div>
            );
          })}

          <div className="relative w-20 h-20 rounded-full border border-sage/20 orb-core" style={{ background: style.color }}>
            {Array.from({ length: style.rings }).map((_, index) => (
              <span
                key={index}
                className="absolute inset-0 rounded-full border ring"
                style={{
                  borderColor: style.color,
                  animationDelay: `${index * 0.35}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mono text-[11px] text-porcelain tracking-[0.14em] mt-1 uppercase">{stateText || style.label}</div>
        <div className="mono text-[10px] text-sage mt-1">RUNNING {elapsed}</div>
        {(agentState === "waiting" || agentState === "alert") && (
          <div className="mono text-[10px] tracking-[0.18em] mt-1 flash" style={{ color: style.color }}>
            {style.label}
          </div>
        )}
      </div>

      <style jsx>{`
        .orb-core {
          animation: pulseOrb var(--pulse-speed) ease-in-out infinite;
          --pulse-speed: ${style.pulse};
          box-shadow: 0 0 24px ${style.color};
        }
        .ring {
          animation: ringOut 2.2s ease-out infinite;
        }
        .dashline {
          animation: dashShift 1.6s linear infinite;
        }
        .flash {
          animation: flashText 1.8s ease-in-out infinite;
        }
        @keyframes pulseOrb {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.07);
            opacity: 1;
          }
        }
        @keyframes ringOut {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @keyframes dashShift {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes flashText {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

function formatDuration(ms: number) {
  if (Number.isNaN(ms) || ms < 0) return "00:00";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${String(minutes).padStart(2, "0")}m`;
}
