"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "@/components/icons";

type TodayTask = { text: string; done: boolean; inProgress: boolean; lineIndex: number };
type TodaySection = { title: string; emoji?: string; tasks: TodayTask[] };
type TodayData = { heading: string; sections: TodaySection[] };

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/today", { cache: "no-store" });
      setData(await r.json());
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 30000);
    return () => clearInterval(poll);
  }, [load]);

  const toggle = async (task: TodayTask) => {
    await fetch("/api/today/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineIndex: task.lineIndex, done: !task.done }),
    });
    load();
  };

  const addTask = async (section: string) => {
    if (!newTask.trim()) return;
    setAdding(true);
    await fetch("/api/today/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTask.trim(), section }),
    });
    setNewTask("");
    setAdding(false);
    load();
  };

  if (!data) {
    return <div style={{ padding: "var(--space-8)" }}><span className="t-label">Loading</span></div>;
  }

  const priority = data.sections.find(s => s.title.toUpperCase().includes("PRIORITY"));
  const nextAction = priority?.tasks.find(t => !t.done);

  return (
    <div className="grid-today mobile-pad" style={{ padding: "var(--space-8)", display: "grid", gap: "var(--space-8)" }}>
      {/* Main */}
      <div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-6)" }}>
          {data.heading}
        </p>

        {data.sections.map((section) => {
          const accent = section.title.toUpperCase().includes("PRIORITY") ? "var(--red)"
            : section.title.toUpperCase().includes("HIGH") ? "var(--accent)"
            : section.title.toUpperCase().includes("LOGGED") || section.title.toUpperCase().includes("DONE") ? "var(--text-muted)"
            : "var(--green)";

          return (
            <div key={section.title} style={{ marginBottom: "var(--space-8)" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "var(--space-2)",
                borderLeft: `2px solid ${accent}`,
                paddingLeft: "var(--space-3)",
                marginBottom: "var(--space-3)",
              }}>
                <span className="t-label">{section.emoji} {section.title}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  {section.tasks.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)" }}>
                {section.tasks.map((task) => (
                  <label
                    key={task.lineIndex}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-4)",
                      background: "var(--bg-elevated)",
                      cursor: "pointer",
                      opacity: task.done ? 0.5 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggle(task)}
                      style={{ marginTop: 3 }}
                    />
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 300,
                      color: task.done ? "var(--text-muted)" : task.inProgress ? "var(--accent)" : "var(--text-primary)",
                      textDecoration: task.done ? "line-through" : "none",
                      flex: 1,
                    }}>
                      {task.text}
                    </span>
                    {task.inProgress && <span className="pill pill-orange">WIP</span>}
                  </label>
                ))}
                {section.tasks.length === 0 && (
                  <div style={{ padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Empty</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar */}
      <div className="today-sidebar" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {/* Next action */}
        <div style={{ borderLeft: "2px solid var(--accent)", paddingLeft: "var(--space-4)" }}>
          <span className="t-label" style={{ display: "block", marginBottom: "var(--space-2)" }}>Next action</span>
          <p style={{
            fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: 400,
            color: "var(--text-primary)", lineHeight: 1.5,
          }}>
            {nextAction ? nextAction.text : "All priorities clear."}
          </p>
        </div>

        <hr className="rule" />

        {/* Add task */}
        <div>
          <span className="t-label" style={{ display: "block", marginBottom: "var(--space-3)" }}>Add task</span>
          <input
            type="text"
            className="input"
            placeholder="What needs doing?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask("NORMAL")}
          />
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <button type="button" onClick={() => addTask("PRIORITY")} disabled={!newTask.trim() || adding} className="btn btn-accent" style={{ fontSize: "var(--text-xs)", padding: "4px 10px" }}>
              <Plus size={11} /> Priority
            </button>
            <button type="button" onClick={() => addTask("NORMAL")} disabled={!newTask.trim() || adding} className="btn" style={{ fontSize: "var(--text-xs)", padding: "4px 10px" }}>
              <Plus size={11} /> Normal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
