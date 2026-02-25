"use client";

import { useEffect, useMemo, useState } from "react";
import { AGENT_ROSTER } from "@/lib/agents";
import MarloweBanner from "@/components/MarloweBanner";
import AgentCard from "@/components/AgentCard";
import ApprovalCard from "@/components/ApprovalCard";
import TaskBoard from "@/components/TaskBoard";
import { CheckCircle2 } from "@/components/icons";

type Approval = {
  id: string;
  title: string;
  description: string | null;
  risk_level: "low" | "med" | "high";
  context: string | null;
  created_at: string;
  status: "pending" | "approved" | "denied";
};

type RuntimeAgent = {
  id: string;
  name: string;
  role: string | null;
  task: string | null;
  status: "active" | "queued" | "done";
  started_at: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: "queued" | "active" | "blocked" | "done";
  priority: "high" | "med" | "low";
  blocker: string | null;
  created_at: string;
  updated_at: string;
};

export default function CommandPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [agents, setAgents] = useState<RuntimeAgent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [approvalsRes, agentsRes, tasksRes] = await Promise.all([
          fetch("/api/approvals", { cache: "no-store" }),
          fetch("/api/agents", { cache: "no-store" }),
          fetch("/api/tasks", { cache: "no-store" }),
        ]);

        const [approvalsJson, agentsJson, tasksJson] = await Promise.all([
          approvalsRes.json(),
          agentsRes.json(),
          tasksRes.json(),
        ]);

        if (!active) return;
        setApprovals(approvalsJson.approvals || []);
        setAgents(agentsJson.agents || []);
        setTasks(tasksJson.tasks || []);
      } catch {
        // keep stale state when polling fails
      }
    };

    load();
    const poll = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, []);

  const pendingApprovals = approvals.filter((item) => item.status === "pending");

  const runtimeByName = useMemo(() => {
    const map = new Map<string, RuntimeAgent>();
    for (const item of agents) {
      map.set(item.name.toLowerCase(), item);
    }
    return map;
  }, [agents]);

  const marlowe = AGENT_ROSTER.find((agent) => agent.name === "Marlowe")!;
  const marloweRuntime = runtimeByName.get("marlowe");
  const marloweTask = marloweRuntime?.task || pendingApprovals[0]?.title || "Building Mission Control v2 - sidebar, agent grid, approvals";
  const marloweStatus = marloweRuntime?.status === "active" ? "ACTIVE" : pendingApprovals.length > 0 ? "WAITING" : "BUILDING";

  const rosterCards = AGENT_ROSTER.filter((agent) => agent.name !== "Marlowe").map((agent) => {
    const runtime = runtimeByName.get(agent.name.toLowerCase());
    const runtimeStatus: "active" | "building" | "idle" =
      runtime?.status === "active" ? "active" : runtime?.status === "queued" ? "building" : "idle";
    const runtimeLabel = runtimeStatus === "active" ? "ACTIVE" : runtimeStatus === "building" ? "BUILDING" : "IDLE";
    const minutes = runtime ? minutesSince(runtime.started_at) : 0;

    return {
      ...agent,
      runtime,
      runtimeStatus,
      runtimeLabel,
      progress: runtimeStatus === "active" ? Math.min(92, 20 + minutes * 2) : 0,
      task: runtime?.task || "Available",
    };
  });

  const selected = selectedAgent ? rosterCards.find((agent) => agent.name === selectedAgent) : null;

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5">
      <section className="space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] font-semibold text-[var(--text-primary)]">The Office</h2>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">AI team headquarters - live view</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="pill-green"><span className="status-dot live" />Working</span>
            <span className="pill-amber"><span className="status-dot building" />Building</span>
            <span className="pill-gray"><span className="status-dot pending" />Waiting</span>
            <span className="pill-gray"><span className="status-dot pending" />Idle</span>
          </div>
        </header>

        <MarloweBanner
          task={marloweTask}
          status={marloweStatus}
          startedAt={marloweRuntime?.started_at}
          progress={Math.min(95, 35 + minutesSince(marloweRuntime?.started_at) * 2)}
        />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">The Company</h3>
            <span className="data text-[12px] text-[var(--text-secondary)]">{AGENT_ROSTER.length} agents</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
            {rosterCards.map((agent) => (
              <AgentCard
                key={agent.name}
                agent={{
                  name: agent.name,
                  role: agent.role,
                  color: agent.color,
                  runtimeStatus: agent.runtimeStatus,
                  runtimeLabel: agent.runtimeLabel,
                  startedAt: agent.runtime?.started_at,
                  progress: agent.progress,
                  task: agent.task,
                }}
                onClick={() => setSelectedAgent(agent.name)}
              />
            ))}
          </div>
        </section>

        <section className="card !p-0">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[var(--border)]">
            <h3 className="section-title">Live Activity</h3>
            <span className="text-[12px] text-[var(--text-dim)]">Last hour</span>
          </div>
          <div className="p-5 space-y-3">
            {agents.length === 0 && (
              <div className="empty-state !min-h-[120px]">
                <CheckCircle2 size={44} className="text-[var(--text-dim)]" />
                <p className="text-[14px] text-[var(--text-primary)]">No live activity</p>
              </div>
            )}
            {agents.slice(0, 6).map((agent) => {
              const roster = AGENT_ROSTER.find((item) => item.name.toLowerCase() === agent.name.toLowerCase());
              return (
                <div key={agent.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="status-dot" style={{ backgroundColor: roster?.color || "var(--text-dim)" }} />
                    <p className="text-[13px] text-[var(--text-primary)]">
                      <strong>{agent.name}</strong> · {(agent.task || "awaiting task").slice(0, 56)}
                    </p>
                  </div>
                  <span className="data text-[11px] text-[var(--text-secondary)]">{minutesSince(agent.started_at)}m ago</span>
                </div>
              );
            })}
          </div>
        </section>

        <TaskBoard tasks={tasks} onCreated={(task) => setTasks((prev) => [task, ...prev])} />
      </section>

      <aside className="space-y-4">
        <section className="card !p-0 sticky top-[72px]">
          <div className="px-5 pt-5 pb-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="section-title">Approvals</h3>
            <span className="pill-amber data text-[10px]">{pendingApprovals.length}</span>
          </div>

          <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
            {pendingApprovals.length === 0 && (
              <div className="empty-state">
                <CheckCircle2 size={48} className="text-[var(--green)]" />
                <p className="text-[15px] text-[var(--text-primary)]">No pending approvals</p>
                <p className="text-[13px] text-[var(--text-secondary)]">Queue is clear.</p>
              </div>
            )}
            {pendingApprovals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onResolved={(id) => setApprovals((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        </section>
      </aside>

      <div
        className={[
          "fixed top-[56px] right-0 bottom-0 w-full max-w-md bg-[var(--bg-surface)] border-l border-[var(--border)] z-50 transition-transform duration-300",
          selected ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {selected && (
          <div className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-[16px]">{selected.name}</h3>
              <button type="button" onClick={() => setSelectedAgent(null)} className="btn !py-1 !px-2 text-[12px]">
                Close
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <p className="section-title mb-2">Task</p>
                <p className="text-[14px] text-[var(--text-primary)]">{selected.runtime?.task || "Available"}</p>
              </div>

              <div>
                <p className="section-title mb-2">Session ID</p>
                <p className="data text-[12px] text-[var(--text-secondary)]">{selected.runtime?.id || "-"}</p>
              </div>

              {selected.runtimeStatus === "active" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAgents((prev) => prev.filter((item) => item.id !== selected.runtime?.id))}
                    className="btn btn-red text-[12px]"
                  >
                    Kill
                  </button>
                  <button type="button" className="btn text-[12px]">
                    Steer
                  </button>
                </div>
              )}

              <div>
                <p className="section-title mb-2">Last Output Preview</p>
                <div className="rounded-lg border border-[var(--border)] bg-black/20 p-3">
                  <p className="data text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    {selected.runtime?.task
                      ? `Working on: ${selected.runtime.task}`
                      : "No recent output. Agent is available for a new directive."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function minutesSince(iso?: string) {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 60000));
}
