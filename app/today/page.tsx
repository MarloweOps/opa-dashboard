"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "@/components/icons";

type TodayTask = {
  id: string;
  task: string;
  category: string | null;
  priority: "priority" | "backlog" | "done";
  done: boolean;
  updated_at: string;
};

type OpsStatus = {
  mrr: number;
  activeTrials: number;
  oldestTrialDays: number;
  notes: string;
  updatedAt: string;
};

const EMPTY_STATUS: OpsStatus = {
  mrr: 0,
  activeTrials: 0,
  oldestTrialDays: 0,
  notes: "",
  updatedAt: new Date().toISOString(),
};

export default function TodayPage() {
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [status, setStatus] = useState<OpsStatus>(EMPTY_STATUS);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [tasksRes, statusRes] = await Promise.all([
          fetch("/api/today", { cache: "no-store" }),
          fetch("/api/ops-status", { cache: "no-store" }),
        ]);

        const [tasksJson, statusJson] = await Promise.all([tasksRes.json(), statusRes.json()]);

        if (!active) return;
        setTasks(tasksJson.tasks || []);
        setStatus(statusJson || EMPTY_STATUS);
        setLastSync(new Date());
      } catch {
        if (active) setLastSync(new Date());
      }
    };

    load();
    const poll = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, []);

  const grouped = useMemo(() => {
    const priority = tasks.filter((task) => !task.done && task.priority === "priority");
    const backlog = tasks.filter((task) => !task.done && task.priority !== "priority");
    const done = tasks.filter((task) => task.done || task.priority === "done");
    return { priority, backlog, done };
  }, [tasks]);

  const bestTask = grouped.priority[0] || grouped.backlog[0];

  const toggleTask = async (task: TodayTask, group: "priority" | "backlog" | "done") => {
    const nextDone = !task.done;
    const nextPriority = nextDone ? "done" : group;

    await fetch(`/api/today/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: nextDone, priority: nextPriority }),
    });

    setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, done: nextDone, priority: nextPriority } : item)));
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5">
      <section className="card !p-0">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-[18px] text-[var(--text-primary)]">Today&apos;s Focus</h2>
          <span className="data text-[11px] text-[var(--text-dim)]">Last synced {timeSince(lastSync)} ago</span>
        </div>

        <div className="p-5 space-y-6">
          <TaskGroup title="PRIORITY" accent="var(--green)" tasks={grouped.priority} onToggle={(task) => toggleTask(task, "priority")} />
          <TaskGroup title="BACKLOG" accent="var(--text-dim)" tasks={grouped.backlog} onToggle={(task) => toggleTask(task, "backlog")} />
          <TaskGroup title="DONE" accent="var(--text-dim)" tasks={grouped.done} done onToggle={(task) => toggleTask(task, "done")} />
        </div>
      </section>

      <aside className="space-y-4">
        <section className="card">
          <p className="section-title mb-2">80/20 Focus</p>
          <p className="text-[15px] text-[var(--text-primary)] leading-relaxed">
            {bestTask ? bestTask.task : "No priority task set. Pull one task from backlog into PRIORITY."}
          </p>
        </section>

        <section className="card">
          <p className="section-title mb-3">Quick Stats</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span>Trials remaining</span><span className="data text-[var(--text-primary)]">{status.activeTrials}</span></div>
            <div className="flex items-center justify-between"><span>Oldest trial expiry</span><span className="data text-[var(--text-primary)]">{status.oldestTrialDays} days</span></div>
            <div className="flex items-center justify-between"><span>MRR</span><span className="data text-[var(--green)]">${status.mrr.toLocaleString()}</span></div>
          </div>
        </section>

        <section className="card">
          <p className="section-title mb-3">Quick Links</p>
          <div className="flex flex-col gap-2">
            <LinkButton href="https://app.useopa.com" label="app.useopa.com" />
            <LinkButton href="https://linear.app" label="Linear" />
            <LinkButton href="https://app.resend.com" label="Resend" />
          </div>
        </section>
      </aside>
    </div>
  );
}

function TaskGroup({
  title,
  accent,
  tasks,
  onToggle,
  done,
}: {
  title: string;
  accent: string;
  tasks: TodayTask[];
  onToggle: (task: TodayTask) => void;
  done?: boolean;
}) {
  return (
    <div>
      <h3 className="section-title mb-3" style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 8 }}>
        {title}
      </h3>
      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-[13px] text-[var(--text-dim)]">No tasks.</p>}
        {tasks.map((task) => (
          <label
            key={task.id}
            className={[
              "card !p-3.5 flex items-start gap-3 cursor-pointer",
              task.done ? "opacity-70" : "opacity-100",
            ].join(" ")}
            style={{ transition: "all 200ms" }}
          >
            <input type="checkbox" checked={task.done} onChange={() => onToggle(task)} className="mt-1 h-4 w-4 accent-[#4ade80]" />
            <div className="flex-1">
              <p className={[
                "text-[14px] transition-all",
                task.done || done ? "line-through text-[var(--text-dim)]" : "text-[var(--text-primary)]",
              ].join(" ")}>
                {task.task}
              </p>
              {task.category && <span className="pill-gray data text-[10px] mt-1.5">{task.category}</span>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn inline-flex items-center justify-between">
      <span>{label}</span>
      <ExternalLink size={14} />
    </a>
  );
}

function timeSince(date: Date | null) {
  if (!date) return "-";
  const secs = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m`;
}
