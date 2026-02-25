"use client";

import { useEffect, useMemo, useState } from "react";
import MarloweOrb from "@/components/MarloweOrb";
import AgentCard from "@/components/AgentCard";
import ApprovalCard from "@/components/ApprovalCard";
import TaskBoard from "@/components/TaskBoard";

type Approval = {
  id: string;
  title: string;
  description: string | null;
  risk_level: "low" | "med" | "high";
  context: string | null;
  created_at: string;
  status: "pending" | "approved" | "denied";
};

type Agent = {
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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
        setLastUpdated(new Date());
      } catch {
        if (active) setLastUpdated(new Date());
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
  const activeTasks = tasks.filter((task) => task.status === "active");
  const blockedTasks = tasks.filter((task) => task.status === "blocked");

  const orbState = useMemo<"idle" | "thinking" | "working" | "waiting" | "alert">(() => {
    if (pendingApprovals.length > 0) return "waiting";
    if (blockedTasks.length > 0) return "alert";
    if (activeTasks.length > 0 && agents.length > 0) return "working";
    if (activeTasks.length > 0) return "thinking";
    return "idle";
  }, [activeTasks.length, agents.length, blockedTasks.length, pendingApprovals.length]);

  const stateText = activeTasks[0]?.title || (pendingApprovals[0] ? pendingApprovals[0].title : "Awaiting commands");
  const stateStartedAt = activeTasks[0]?.updated_at || tasks[0]?.created_at;

  return (
    <div className="p-6">
      <MarloweOrb
        agentState={orbState}
        stateText={stateText}
        startedAt={stateStartedAt}
        activeAgents={agents.filter((agent) => agent.status === "active")}
      />

      <div className="mt-2 mono text-[10px] text-sage">Last updated {timeSince(lastUpdated)} ago</div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <section className="panel">
          <div className="panel-header flex items-center justify-between">
            <span>⬡ Active Agents</span>
            <span className="mono text-[10px] text-sage">{agents.length}</span>
          </div>
          <div className="p-4 space-y-3">
            {agents.length === 0 && (
              <div className="border border-sage/20 bg-forest/10 p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-forest/20 border border-sage/20 mx-auto mb-2" />
                <p className="text-[12px] text-sage">No active sub-agents. System idle.</p>
              </div>
            )}
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onKill={(id) => setAgents((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header flex items-center justify-between">
            <span>⚠ Approvals</span>
            <span className="mono text-[10px] text-terracotta">{pendingApprovals.length}</span>
          </div>
          <div className="p-4 space-y-3">
            {pendingApprovals.length === 0 && (
              <div className="border border-forest/30 bg-forest/10 p-4 text-center">
                <p className="text-[12px] text-[#4ade80]">✓ No pending approvals.</p>
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

        <section>
          <TaskBoard tasks={tasks} onCreated={(task) => setTasks((prev) => [task, ...prev])} />
        </section>
      </div>
    </div>
  );
}

function timeSince(date: Date | null) {
  if (!date) return "-";
  const secs = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  return `${secs}s`;
}
