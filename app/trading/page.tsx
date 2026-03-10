"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDown, Plus, X } from "@/components/icons";

/* ──── Types ──── */

type Trade = {
  id: string;
  ticker: string;
  strategy: string;
  side?: "SELL" | "BUY";
  strike: number;
  expiry: string;
  premium: number;
  contracts: number;
  status: "Open" | "Assigned" | "Expired" | "Called Away" | "Closed" | "BTC" | "Rolled";
  costBasis?: number;
  openedAt: string;
  closedAt?: string;
  pnl?: number;
  wheelCycle?: string;
  notes?: string;
};

/* ──── Helpers ──── */

const STRATEGY_COLORS: Record<string, { color: string; border: string; bg: string }> = {
  CSP: { color: "#F59E0B", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.08)" },
  CC: { color: "#22C55E", border: "rgba(34,197,94,0.3)", bg: "rgba(34,197,94,0.08)" },
  "CC-LEAP": { color: "#10B981", border: "rgba(16,185,129,0.3)", bg: "rgba(16,185,129,0.08)" },
  Assignment: { color: "#3B82F6", border: "rgba(59,130,246,0.3)", bg: "rgba(59,130,246,0.08)" },
  BTC: { color: "#71717A", border: "rgba(113,113,122,0.3)", bg: "rgba(113,113,122,0.08)" },
  STC: { color: "#71717A", border: "rgba(113,113,122,0.3)", bg: "rgba(113,113,122,0.08)" },
  PUT: { color: "#EF4444", border: "rgba(239,68,68,0.3)", bg: "rgba(239,68,68,0.08)" },
  ROLL: { color: "#8B5CF6", border: "rgba(139,92,246,0.3)", bg: "rgba(139,92,246,0.08)" },
  STOCK: { color: "#06B6D4", border: "rgba(6,182,212,0.3)", bg: "rgba(6,182,212,0.08)" },
  DEPOSIT: { color: "#64748B", border: "rgba(100,116,139,0.3)", bg: "rgba(100,116,139,0.08)" },
};

const STATUS_COLORS: Record<string, string> = {
  Open: "#22C55E",
  Assigned: "#3B82F6",
  Expired: "#71717A",
  "Called Away": "#F59E0B",
  Closed: "#71717A",
  BTC: "#71717A",
  Rolled: "#8B5CF6",
};

function fmt$(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function daysUntil(expiry: string): number {
  const d = new Date(expiry + "T16:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

/* ──── Component ──── */

export default function TradingPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [ticker, setTicker] = useState("");
  const [strategy, setStrategy] = useState("CSP");
  const [strike, setStrike] = useState("");
  const [expiry, setExpiry] = useState("");
  const [premium, setPremium] = useState("");
  const [contracts, setContracts] = useState("1");
  const [notes, setNotes] = useState("");
  const [wheelCycle, setWheelCycle] = useState("");

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch("/api/trading", { cache: "no-store" });
      const data = await res.json();
      if (data.trades) setTrades(data.trades);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  /* ── Derived data ── */
  const openTrades = trades.filter((t) => t.status === "Open" || t.status === "Assigned");
  const closedTrades = trades.filter((t) => t.status !== "Open" && t.status !== "Assigned");

  const totalPremium = trades.reduce((sum, t) => {
    if (t.strategy === "DEPOSIT" || t.strategy === "STOCK") return sum;
    const multiplier = t.side === "BUY" ? -1 : 1;
    return sum + t.premium * t.contracts * 100 * multiplier;
  }, 0);
  const realizedPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winCount = closedTrades.filter((t) => (t.pnl || 0) >= 0).length;
  const winRate = closedTrades.length > 0 ? Math.round((winCount / closedTrades.length) * 100) : 0;

  // Wheel cycles
  const cycleMap = new Map<string, Trade[]>();
  trades.forEach((t) => {
    if (t.wheelCycle) {
      if (!cycleMap.has(t.wheelCycle)) cycleMap.set(t.wheelCycle, []);
      cycleMap.get(t.wheelCycle)!.push(t);
    }
  });

  /* ── Handlers ── */
  const handleSubmit = async () => {
    if (!ticker.trim() || !strike) return;
    setSaving(true);
    try {
      await fetch("/api/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.trim(),
          strategy,
          strike: Number(strike),
          expiry,
          premium: Number(premium) || 0,
          contracts: Number(contracts) || 1,
          notes: notes.trim() || undefined,
          wheelCycle: wheelCycle.trim() || undefined,
        }),
      });
      // Reset
      setTicker(""); setStrike(""); setExpiry(""); setPremium(""); setContracts("1"); setNotes(""); setWheelCycle("");
      setShowForm(false);
      await fetchTrades();
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleClose = async (trade: Trade) => {
    const premium100 = trade.premium * trade.contracts * 100;
    await fetch(`/api/trading/${trade.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Closed",
        closedAt: new Date().toISOString(),
        pnl: premium100,
      }),
    });
    await fetchTrades();
  };

  const handleAssign = async (trade: Trade) => {
    await fetch(`/api/trading/${trade.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Assigned",
        closedAt: new Date().toISOString(),
        costBasis: trade.strike,
      }),
    });
    await fetchTrades();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/trading/${id}`, { method: "DELETE" });
    await fetchTrades();
  };

  /* ── Strategy pill ── */
  const StrategyPill = ({ s }: { s: string }) => {
    const c = STRATEGY_COLORS[s] || STRATEGY_COLORS.BTC;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", borderRadius: 20,
        padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
        fontWeight: 400, letterSpacing: "0.04em",
        color: c.color, borderColor: c.border, background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      }}>
        {s}
      </span>
    );
  };

  /* ── Status pill ── */
  const StatusPill = ({ s }: { s: string }) => {
    const color = STATUS_COLORS[s] || "#71717A";
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 20,
        padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
        fontWeight: 400, letterSpacing: "0.04em",
        color, border: `1px solid ${color}33`, background: `${color}14`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
        {s}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="mobile-pad page-content" style={{ padding: "var(--space-8)" }}>
        <div className="glass-bg" />
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="mobile-pad page-content" style={{ padding: "var(--space-8)", position: "relative" }}>
      <div className="glass-bg" />

      {/* ══════════ HEADER ══════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <h1 className="gradient-text" style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2rem, 4vw, 2.75rem)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}>
          Wheel Tracker
        </h1>
        <button
          className="btn btn-accent"
          onClick={() => setShowForm(!showForm)}
          style={{ fontWeight: 500 }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "New Trade"}
        </button>
      </div>

      <hr className="rule-glass" style={{ marginBottom: "var(--space-6)" }} />

      {/* ══════════ SUMMARY CARDS ══════════ */}
      <div className="grid-trading-summary" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <div className="card" style={{ padding: 20 }}>
          <span className="section-title" style={{ display: "block" }}>Premium Collected</span>
          <span className="number-big number-glow" style={{ fontSize: "1.75rem" }}>{fmt$(totalPremium)}</span>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <span className="section-title" style={{ display: "block" }}>Realized P&L</span>
          <span className="number-big" style={{ fontSize: "1.75rem", color: realizedPnl >= 0 ? "#22C55E" : "var(--red)", textShadow: realizedPnl >= 0 ? "0 0 20px rgba(34,197,94,0.4)" : "0 0 20px rgba(196,48,48,0.4)" }}>
            {fmt$(realizedPnl)}
          </span>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <span className="section-title" style={{ display: "block" }}>Open Positions</span>
          <span className="number-big number-glow" style={{ fontSize: "1.75rem" }}>{openTrades.length}</span>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <span className="section-title" style={{ display: "block" }}>Win Rate</span>
          <span className="number-big" style={{ fontSize: "1.75rem", color: winRate >= 50 ? "#22C55E" : winRate > 0 ? "#F59E0B" : "var(--text-muted)", textShadow: winRate >= 50 ? "0 0 20px rgba(34,197,94,0.4)" : "none" }}>
            {closedTrades.length > 0 ? `${winRate}%` : "---"}
          </span>
        </div>
      </div>

      {/* ══════════ ADD TRADE FORM ══════════ */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: "var(--space-6)" }}>
          <span className="section-title" style={{ display: "block", marginBottom: "var(--space-4)" }}>New Trade</span>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Ticker</label>
              <input className="input" type="text" placeholder="AAPL" value={ticker} onChange={(e) => setTicker(e.target.value)} style={{ textTransform: "uppercase" }} />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Strategy</label>
              <select className="input" value={strategy} onChange={(e) => setStrategy(e.target.value)} style={{ cursor: "pointer" }}>
                <option value="CSP">CSP</option>
                <option value="CC">CC</option>
                <option value="CC-LEAP">CC-LEAP</option>
                <option value="PUT">PUT</option>
                <option value="Assignment">Assignment</option>
                <option value="BTC">BTC</option>
                <option value="STC">STC</option>
                <option value="ROLL">ROLL</option>
                <option value="STOCK">STOCK</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Strike</label>
              <input className="input" type="number" placeholder="150.00" value={strike} onChange={(e) => setStrike(e.target.value)} step="0.01" />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Expiry</label>
              <input className="input" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Premium (per contract)</label>
              <input className="input" type="number" placeholder="2.50" value={premium} onChange={(e) => setPremium(e.target.value)} step="0.01" />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Contracts</label>
              <input className="input" type="number" placeholder="1" value={contracts} onChange={(e) => setContracts(e.target.value)} min="1" />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Wheel Cycle ID</label>
              <input className="input" type="text" placeholder="optional" value={wheelCycle} onChange={(e) => setWheelCycle(e.target.value)} />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Notes</label>
              <input className="input" type="text" placeholder="optional" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
            <button className="btn btn-accent" onClick={handleSubmit} disabled={saving || !ticker.trim() || !strike} style={{ fontWeight: 500 }}>
              {saving ? "Saving..." : "Add Trade"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ OPEN POSITIONS ══════════ */}
      <div className="card" style={{ padding: 24, marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <span className="section-title" style={{ marginBottom: 0 }}>Open Positions</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            {openTrades.length} active
          </span>
        </div>

        {openTrades.length === 0 ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>No open positions.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "70px 70px 80px 90px 80px 50px 90px 70px 1fr",
              gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)",
              borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 2,
              minWidth: 700,
            }}>
              {["Ticker", "Type", "Strike", "Expiry", "Premium", "Qty", "Status", "DTE", "Actions"].map((h) => (
                <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 400 }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {openTrades.map((trade, i) => {
              const dte = daysUntil(trade.expiry);
              const premiumTotal = trade.premium * trade.contracts * 100 * (trade.side === "BUY" ? -1 : 1);
              const isEven = i % 2 === 0;
              return (
                <div key={trade.id} className="feed-item" style={{
                  display: "grid", gridTemplateColumns: "70px 70px 80px 90px 80px 50px 90px 70px 1fr",
                  gap: "var(--space-2)", alignItems: "center",
                  background: isEven ? "rgba(255,255,255,0.01)" : "transparent",
                  borderRadius: 4, padding: "var(--space-2) var(--space-3)",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  minWidth: 700,
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-primary)", fontWeight: 500 }}>
                    {trade.ticker}
                  </span>
                  <StrategyPill s={trade.strategy} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    ${trade.strike.toFixed(2)}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {trade.expiry}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: premiumTotal >= 0 ? "#22C55E" : "var(--red)" }}>
                    {fmt$(premiumTotal)}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {trade.contracts}
                  </span>
                  <StatusPill s={trade.status} />
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)",
                    color: dte <= 3 ? "var(--red)" : dte <= 7 ? "#F59E0B" : "var(--text-secondary)",
                  }}>
                    {dte}d
                  </span>
                  <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
                    <button className="btn" onClick={() => handleClose(trade)} style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}>
                      Close
                    </button>
                    {trade.strategy === "CSP" && (
                      <button className="btn" onClick={() => handleAssign(trade)} style={{ padding: "4px 10px", fontSize: "var(--text-xs)", color: "#3B82F6", borderColor: "rgba(59,130,246,0.3)" }}>
                        Assign
                      </button>
                    )}
                    <button className="btn" onClick={() => handleDelete(trade.id)} style={{ padding: "4px 10px", fontSize: "var(--text-xs)", color: "var(--red)", borderColor: "rgba(196,48,48,0.3)" }}>
                      Del
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════ CLOSED POSITIONS ══════════ */}
      <div className="card" style={{ padding: 24, marginBottom: "var(--space-6)" }}>
        <button
          onClick={() => setShowClosed(!showClosed)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "none", border: "none", cursor: "pointer",
            padding: 0,
          }}
        >
          <span className="section-title" style={{ marginBottom: 0 }}>Closed Positions</span>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {closedTrades.length} trades
            </span>
            <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: showClosed ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms ease" }} />
          </div>
        </button>

        {showClosed && closedTrades.length > 0 && (
          <div style={{ marginTop: "var(--space-4)", overflowX: "auto" }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "70px 70px 80px 90px 80px 50px 90px 90px",
              gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)",
              borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 2,
              minWidth: 620,
            }}>
              {["Ticker", "Type", "Strike", "Expiry", "Premium", "Qty", "Status", "P&L"].map((h) => (
                <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 400 }}>
                  {h}
                </span>
              ))}
            </div>

            {closedTrades.map((trade, i) => {
              const premiumTotal = trade.premium * trade.contracts * 100 * (trade.side === "BUY" ? -1 : 1);
              const pnl = trade.pnl || 0;
              const isEven = i % 2 === 0;
              return (
                <div key={trade.id} style={{
                  display: "grid", gridTemplateColumns: "70px 70px 80px 90px 80px 50px 90px 90px",
                  gap: "var(--space-2)", alignItems: "center",
                  background: isEven ? "rgba(255,255,255,0.01)" : "transparent",
                  borderRadius: 4, padding: "var(--space-2) var(--space-3)",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  minWidth: 620,
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-primary)", fontWeight: 500 }}>
                    {trade.ticker}
                  </span>
                  <StrategyPill s={trade.strategy} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    ${trade.strike.toFixed(2)}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {trade.expiry}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {fmt$(premiumTotal)}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                    {trade.contracts}
                  </span>
                  <StatusPill s={trade.status} />
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 500,
                    color: pnl >= 0 ? "#22C55E" : "var(--red)",
                  }}>
                    {fmt$(pnl)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {showClosed && closedTrades.length === 0 && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "var(--space-4)" }}>
            No closed trades yet.
          </p>
        )}
      </div>

      {/* ══════════ WHEEL CYCLES ══════════ */}
      {cycleMap.size > 0 && (
        <>
          <hr className="rule-glass" style={{ marginBottom: "var(--space-6)" }} />

          <div style={{ marginBottom: "var(--space-6)" }}>
            <span className="section-title" style={{ display: "block", marginBottom: "var(--space-4)" }}>Wheel Cycles</span>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {Array.from(cycleMap.entries()).map(([cycleId, cycleTrades]) => {
                const cyclePnl = cycleTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                const cyclePremium = cycleTrades.reduce((sum, t) => sum + t.premium * t.contracts * 100, 0);
                const allClosed = cycleTrades.every((t) => t.status !== "Open" && t.status !== "Assigned");
                const sorted = [...cycleTrades].sort((a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime());

                return (
                  <div key={cycleId} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-primary)", fontWeight: 500 }}>
                          {sorted[0]?.ticker || cycleId}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", borderRadius: 20,
                          padding: "2px 8px", fontFamily: "var(--font-mono)", fontSize: 10,
                          color: allClosed ? "#22C55E" : "#F59E0B",
                          border: `1px solid ${allClosed ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                          background: allClosed ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
                        }}>
                          {allClosed ? "Complete" : "Active"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          Premium: {fmt$(cyclePremium)}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 500,
                          color: cyclePnl >= 0 ? "#22C55E" : "var(--red)",
                        }}>
                          P&L: {fmt$(cyclePnl)}
                        </span>
                      </div>
                    </div>

                    {/* Cycle flow */}
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      {sorted.map((t, idx) => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <div style={{
                            padding: "var(--space-2) var(--space-3)",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: 8,
                            borderLeft: `2px solid ${STRATEGY_COLORS[t.strategy]?.color || "#71717A"}`,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                              <StrategyPill s={t.strategy} />
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                                ${t.strike}
                              </span>
                            </div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                              {t.expiry} / {fmt$(t.premium * t.contracts * 100)}
                            </div>
                          </div>
                          {idx < sorted.length - 1 && (
                            <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
