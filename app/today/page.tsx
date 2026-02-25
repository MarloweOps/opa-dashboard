"use client";

import { useEffect, useMemo, useState } from "react";

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

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-5 gap-4">
      <section className="xl:col-span-3 panel">
        <div className="panel-header flex items-center justify-between">
          <span>◈ Today&apos;s Focus</span>
          <span className="mono text-[10px] text-sage">Last synced {timeSince(lastSync)} ago</span>
        </div>

        <div className="p-4 space-y-5">
          <TaskGroup
            title="PRIORITY"
            tasks={grouped.priority}
            onToggle={async (task) => {
              const nextDone = !task.done;
              await fetch(`/api/today/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: nextDone, priority: nextDone ? "done" : "priority" }),
              });
              setTasks((prev) =>
                prev.map((item) =>
                  item.id === task.id ? { ...item, done: nextDone, priority: nextDone ? "done" : "priority" } : item
                )
              );
            }}
            priority
          />

          <TaskGroup
            title="BACKLOG"
            tasks={grouped.backlog}
            onToggle={async (task) => {
              const nextDone = !task.done;
              await fetch(`/api/today/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: nextDone, priority: nextDone ? "done" : "backlog" }),
              });
              setTasks((prev) =>
                prev.map((item) =>
                  item.id === task.id ? { ...item, done: nextDone, priority: nextDone ? "done" : "backlog" } : item
                )
              );
            }}
          />

          <TaskGroup
            title="DONE"
            tasks={grouped.done}
            onToggle={async (task) => {
              const nextDone = !task.done;
              await fetch(`/api/today/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: nextDone, priority: nextDone ? "done" : "backlog" }),
              });
              setTasks((prev) =>
                prev.map((item) =>
                  item.id === task.id ? { ...item, done: nextDone, priority: nextDone ? "done" : "backlog" } : item
                )
              );
            }}
          />
        </div>
      </section>

      <aside className="xl:col-span-2 panel p-4 space-y-4">
        <div>
          <p className="mono text-[10px] text-sage tracking-wider mb-2">80/20 FOCUS</p>
          <p className="text-[13px] text-porcelain leading-relaxed">
            {bestTask ? bestTask.task : "No priority task set. Pull one task from backlog into PRIORITY."}
          </p>
        </div>

        <div>
          <p className="mono text-[10px] text-sage tracking-wider mb-2">MARLOWE SEQUENCE</p>
          <p className="text-[12px] text-sage-light leading-relaxed">{status.notes || "No sequence note available."}</p>
        </div>

        <div className="border border-sage/20 bg-forest/10 p-3 space-y-2">
          <p className="mono text-[10px] text-sage tracking-wider">OPA DAILY METRICS</p>
          <div className="flex justify-between mono text-[11px]"><span className="text-sage">MRR</span><span className="text-[#4ade80]">${status.mrr.toLocaleString()}</span></div>
          <div className="flex justify-between mono text-[11px]"><span className="text-sage">Active trials</span><span className="text-porcelain">{status.activeTrials}</span></div>
          <div className="flex justify-between mono text-[11px]"><span className="text-sage">Oldest trial</span><span className="text-porcelain">{status.oldestTrialDays}d</span></div>
        </div>

        <div>
          <p className="mono text-[10px] text-sage tracking-wider mb-2">QUICK LINKS</p>
          <div className="space-y-2">
            <a href="https://app.useopa.com" target="_blank" className="block text-[12px] text-sage-light hover:text-porcelain transition-colors">app.useopa.com</a>
            <a href="/" className="block text-[12px] text-sage-light hover:text-porcelain transition-colors">marlowe-dashboard</a>
            <a href="https://app.resend.com" target="_blank" className="block text-[12px] text-sage-light hover:text-porcelain transition-colors">Resend dashboard</a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  onToggle,
  priority,
}: {
  title: string;
  tasks: TodayTask[];
  onToggle: (task: TodayTask) => void;
  priority?: boolean;
}) {
  return (
    <div>
      <h3 className="mono text-[10px] text-sage tracking-[0.2em] mb-2">{title}</h3>
      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-[12px] text-sage italic">No tasks.</p>}
        {tasks.map((task) => (
          <label
            key={task.id}
            className={`flex items-start gap-3 border px-3 py-2 cursor-pointer transition ${
              priority ? "bg-forest/10 border-forest/40" : "bg-forest/5 border-sage/20"
            } ${task.done ? "opacity-60" : "opacity-100"}`}
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task)}
              className="mt-0.5 accent-[#4ade80]"
            />
            <div className="flex-1">
              <p className={`text-[12px] ${task.done ? "line-through text-sage" : "text-porcelain"}`}>{task.task}</p>
              {task.category && (
                <span className="mono text-[9px] text-sage border border-sage/20 px-1.5 py-0.5 mt-1 inline-block">{task.category}</span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function timeSince(date: Date | null) {
  if (!date) return "-";
  const secs = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  return `${secs}s`;
}
