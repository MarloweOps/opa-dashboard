"use client";

type Agent = {
  id: string;
  name: string;
  role: string | null;
  task: string | null;
  status: "active" | "queued" | "done";
  started_at: string;
};

function formatDuration(startedAt: string) {
  const delta = Date.now() - new Date(startedAt).getTime();
  const minutes = Math.max(0, Math.floor(delta / 60000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export default function AgentCard({
  agent,
  onKill,
}: {
  agent: Agent;
  onKill: (id: string) => void;
}) {
  const active = agent.status === "active";

  return (
    <article className="panel p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="mono text-[12px] text-porcelain tracking-wide font-semibold">{agent.name}</h4>
          <p className="text-[11px] text-sage">{agent.role || "Sub-agent"}</p>
        </div>
        <span className={`status-dot ${active ? "building pulse" : "pending"}`} />
      </div>

      <p className="text-[12px] text-sage-light mt-2 line-clamp-2 min-h-[36px]">{agent.task || "Awaiting task assignment."}</p>
      <p className="mono text-[10px] text-sage mt-2">{formatDuration(agent.started_at)}</p>

      <div className="h-1 rounded-full bg-forest-dark mt-2 overflow-hidden">
        {active ? (
          <div className="h-full w-1/2 shimmer" />
        ) : (
          <div className="h-full w-1/4 bg-sage/40" />
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Kill ${agent.name}?`)) onKill(agent.id);
        }}
        className="mt-3 mono text-[10px] px-2 py-1 border border-terracotta/40 text-terracotta hover:bg-terracotta/10 transition-colors"
      >
        KILL
      </button>

      <style jsx>{`
        .shimmer {
          background: linear-gradient(90deg, rgba(74, 222, 128, 0.15), rgba(74, 222, 128, 0.75), rgba(74, 222, 128, 0.15));
          animation: shimmer 1.3s linear infinite;
          background-size: 200% 100%;
        }
        @keyframes shimmer {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
      `}</style>
    </article>
  );
}
