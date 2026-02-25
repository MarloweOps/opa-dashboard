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

function priorityDot(priority: Task["priority"]) {
  if (priority === "high") return "bg-terracotta";
  if (priority === "med") return "bg-honey";
  return "bg-sage";
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
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <span>◈ Marlowe Tasks</span>
        <button
          type="button"
          onClick={() => setAdding((prev) => !prev)}
          className="mono text-[10px] text-sage hover:text-porcelain transition-colors"
        >
          + ADD TASK
        </button>
      </div>

      <div className="px-4 pt-3 border-b border-sage/15 flex gap-4">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`mono text-[10px] uppercase pb-2 border-b-2 tracking-wider transition-colors ${
              tab === item ? "text-porcelain border-forest-light" : "text-sage border-transparent"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {adding && (
          <div className="border border-sage/20 bg-forest/10 p-3 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full bg-black/20 border border-sage/20 px-2 py-1.5 text-[12px] text-porcelain mono focus:outline-none focus:border-sage/40"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-black/20 border border-sage/20 px-2 py-1.5 text-[11px] text-sage mono"
              >
                <option>OPA</option>
                <option>TEMPLATE</option>
                <option>EMAIL</option>
                <option>INFRA</option>
                <option>CONTENT</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="bg-black/20 border border-sage/20 px-2 py-1.5 text-[11px] text-sage mono"
              >
                <option value="high">high</option>
                <option value="med">med</option>
                <option value="low">low</option>
              </select>
            </div>
            <button
              type="button"
              onClick={addTask}
              className="mono text-[10px] px-2 py-1 border border-forest text-[#4ade80] bg-forest/15"
            >
              SAVE
            </button>
          </div>
        )}

        {visible.length === 0 && <p className="text-[12px] text-sage italic">No tasks in this column.</p>}

        {visible.map((task) => (
          <article key={task.id} className="border border-sage/20 bg-forest/10 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[12px] text-porcelain font-medium leading-snug">{task.title}</h4>
              <span className="mono text-[9px] px-1.5 py-0.5 border border-sage/30 rounded text-sage">{task.category || "GEN"}</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${priorityDot(task.priority)}`} />
              <span className="mono text-[9px] text-sage uppercase">{task.priority}</span>
            </div>

            {task.description && <p className="text-[11px] text-sage-light mt-2 line-clamp-2">{task.description}</p>}
            {task.status === "blocked" && task.blocker && (
              <p className="text-[11px] text-terracotta mt-2">{task.blocker}</p>
            )}

            <p className="mono text-[9px] text-sage mt-2">
              {new Date(task.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
