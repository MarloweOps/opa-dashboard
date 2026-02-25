"use client";

import { useMemo, useState } from "react";

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

const TABS: Array<Task["status"]> = ["queued", "active", "blocked", "done"];

function priorityPill(priority: Task["priority"]) {
  if (priority === "high") return "pill-red";
  if (priority === "med") return "pill-amber";
  return "pill-gray";
}

export default function TaskBoard({ tasks, onCreated }: { tasks: Task[]; onCreated: (task: Task) => void }) {
  const [tab, setTab] = useState<Task["status"]>("queued");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("OPA");
  const [priority, setPriority] = useState<Task["priority"]>("med");

  const visible = useMemo(() => tasks.filter((task) => task.status === tab), [tasks, tab]);

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), category, priority, status: "queued" }),
    });
    const json = await res.json();
    if (json.task) {
      onCreated(json.task);
      setTitle("");
      setAdding(false);
      setTab("queued");
    }
  };

  return (
    <section className="card !p-0">
      <div className="px-5 pt-5 flex items-center justify-between">
        <h3 className="section-title">Tasks</h3>
        <button type="button" onClick={() => setAdding((prev) => !prev)} className="btn !py-1 !px-2 text-[12px]">
          + Add Task
        </button>
      </div>

      <div className="px-5 mt-4 border-b border-[var(--border)] flex gap-4">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={[
              "pb-3 text-[12px] capitalize border-b-2 transition-colors",
              tab === item
                ? "text-[var(--text-primary)] border-[var(--green)]"
                : "text-[var(--text-secondary)] border-transparent",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-3">
        {adding && (
          <div className="card !p-3.5">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="input" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="select">
                <option>OPA</option>
                <option>TEMPLATE</option>
                <option>EMAIL</option>
                <option>INFRA</option>
                <option>CONTENT</option>
              </select>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} className="select">
                <option value="high">high</option>
                <option value="med">med</option>
                <option value="low">low</option>
              </select>
            </div>
            <button type="button" onClick={addTask} className="btn btn-green mt-2 text-[12px]">
              Save
            </button>
          </div>
        )}

        {visible.length === 0 && (
          <div className="empty-state !min-h-[120px]">
            <p className="text-[14px] text-[var(--text-primary)]">No tasks in this column</p>
          </div>
        )}

        {visible.map((task) => (
          <article key={task.id} className="card !p-3.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[14px] font-medium leading-snug">{task.title}</h4>
              <span className={`${priorityPill(task.priority)} data text-[10px] uppercase`}>{task.priority}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="pill-gray data text-[10px] uppercase">{task.category || "GEN"}</span>
              <span className="data text-[10px] text-[var(--text-secondary)]">
                {new Date(task.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>

            {task.description && <p className="text-[12px] text-[var(--text-secondary)] mt-2 line-clamp-2">{task.description}</p>}
            {task.status === "blocked" && task.blocker && <p className="text-[12px] text-[var(--red)] mt-2">{task.blocker}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
