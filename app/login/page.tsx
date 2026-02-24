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
    <main className="min-h-screen flex items-center justify-center bg-[#0D1B2A]">
      <div className="w-full max-w-sm p-8 border border-[#839788]/20 rounded-sm bg-[#0a1520]">
        <div className="mb-8 text-center">
          <h1 className="serif text-2xl font-semibold text-[#FAF9F5] tracking-tight">
            The Varied<span className="text-[#C4725F]">.</span>
          </h1>
          <p className="mono text-[10px] text-[#839788] tracking-widest mt-1">MARLOWE OPS</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="mono text-[10px] text-[#839788] tracking-wider uppercase">
              Access Key
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••••••••••"
              className={`
                mono text-sm text-[#FAF9F5] bg-[#0D1B2A] border rounded-sm px-3 py-2.5
                outline-none transition-colors placeholder-[#839788]/30
                ${err ? "border-[#C4725F] focus:border-[#C4725F]" : "border-[#839788]/30 focus:border-[#839788]/60"}
              `}
            />
          </div>

          {err && (
            <p className="mono text-[10px] text-[#C4725F] tracking-wide">
              incorrect access key
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pw}
            className="
              mono text-[11px] tracking-wider uppercase
              bg-[#134611] text-[#FAF9F5] border border-[#134611]
              px-4 py-2.5 rounded-sm
              hover:bg-[#134611]/80 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {loading ? "verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
