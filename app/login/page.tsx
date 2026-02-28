"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setErr(true);
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-8)",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: "var(--space-10)", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-2xl)",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            The Varied
          </h1>
          <p className="t-label" style={{ marginTop: "var(--space-2)" }}>
            Mission Control
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <label className="t-label">Access</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            autoComplete="current-password"
            placeholder="Enter access key"
            className="input"
          />

          {err && <span className="pill pill-red" style={{ alignSelf: "flex-start" }}>Incorrect</span>}

          <button
            type="submit"
            disabled={loading || !pw}
            className="btn btn-accent"
            style={{ width: "100%", justifyContent: "center", marginTop: "var(--space-2)" }}
          >
            {loading ? "Verifying" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
