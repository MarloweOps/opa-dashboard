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
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="serif text-[34px] text-[var(--text-primary)] leading-none">
            The Varied<span style={{ color: "var(--terracotta)" }}>.</span>
          </h1>
          <p className="data text-[10px] text-[var(--text-secondary)] tracking-[0.2em] mt-2 uppercase">Mission Control</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="section-title">Access Key</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••••••••••"
            className="input"
          />

          {err && <p className="pill-red w-fit">Incorrect access key</p>}

          <button type="submit" disabled={loading || !pw} className="btn btn-green disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
