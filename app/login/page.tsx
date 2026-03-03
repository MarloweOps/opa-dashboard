"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value ?? "";
    if (!value) {
      setErr(true);
      return;
    }
    setLoading(true);
    setErr(false);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setErr(true);
        setLoading(false);
      }
    } catch {
      setErr(true);
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "25dvh",
      padding: "25dvh var(--space-8) var(--space-8)",
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
          <label className="t-label" htmlFor="pw-input">Access</label>
          <input
            id="pw-input"
            ref={inputRef}
            type="password"
            enterKeyHint="go"
            autoComplete="current-password"
            placeholder="Enter access key"
            className="input"
            style={{ fontSize: "16px" }}
          />

          {err && <span className="pill pill-red" style={{ alignSelf: "flex-start" }}>Incorrect</span>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent"
            style={{ width: "100%", justifyContent: "center", marginTop: "var(--space-2)", touchAction: "manipulation" }}
          >
            {loading ? "Verifying" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
