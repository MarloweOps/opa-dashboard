"use client";

type RuntimeStatus = "active" | "building" | "waiting" | "idle";

type AgentCardData = {
  name: string;
  role: string;
  color: string;
  task: string | null;
  runtimeStatus: RuntimeStatus;
  runtimeLabel: string;
  startedAt?: string;
  progress?: number;
};

const STATUS_STYLE: Record<RuntimeStatus, string> = {
  active: "pill-green",
  building: "pill-amber",
  waiting: "pill-amber",
  idle: "pill-gray",
};

export default function AgentCard({
  agent,
  onClick,
}: {
  agent: AgentCardData;
  onClick: () => void;
}) {
  const initials = agent.name.slice(0, 1).toUpperCase();
  const isActive = agent.runtimeStatus === "active";
  const isIdle = agent.runtimeStatus === "idle";
  const mins = agent.startedAt ? minutesSince(agent.startedAt) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "card text-left w-full relative overflow-hidden",
        isActive ? "border-l-[3px] border-l-[var(--green)] bg-[rgba(74,222,128,0.06)]" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="h-11 w-11 rounded-full text-white text-[15px] font-semibold flex items-center justify-center"
          style={{ backgroundColor: agent.color, opacity: isIdle ? 0.6 : 1 }}
        >
          {initials}
        </span>
        <span className={`${STATUS_STYLE[agent.runtimeStatus]} data uppercase text-[10px]`}>{agent.runtimeLabel}</span>
      </div>

      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-4">{agent.name}</h3>
      <p className="text-[13px] text-[var(--text-secondary)]">{agent.role}</p>

      <p className="text-[12px] text-[var(--text-secondary)] mt-3 truncate">{agent.task || "Available"}</p>

      <div className="mt-3">
        <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${agent.progress ?? (isActive ? 45 : 0)}%`,
              backgroundColor: isActive ? "var(--green)" : "var(--text-dim)",
            }}
          />
        </div>
        <p className="data text-[10px] text-[var(--text-secondary)] mt-1.5">
          {isActive ? `running ${mins}m` : isIdle ? "idle" : "queued"}
        </p>
      </div>
    </button>
  );
}

function minutesSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 60000));
}
