import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const TRADES_FILE = path.join(process.env.HOME || "", "life/trading/wheel-trades.json");

type Trade = {
  id: string;
  ticker: string;
  strategy: "CSP" | "CC" | "Assignment" | "BTC" | "STC";
  strike: number;
  expiry: string;
  premium: number;
  contracts: number;
  status: "Open" | "Assigned" | "Expired" | "Called Away" | "Closed" | "BTC";
  costBasis?: number;
  openedAt: string;
  closedAt?: string;
  pnl?: number;
  wheelCycle?: string;
  notes?: string;
};

async function loadTrades(): Promise<Trade[]> {
  if (!existsSync(TRADES_FILE)) return [];
  const raw = await readFile(TRADES_FILE, "utf-8");
  return JSON.parse(raw);
}

async function saveTrades(trades: Trade[]) {
  await writeFile(TRADES_FILE, JSON.stringify(trades, null, 2), "utf-8");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const trades = await loadTrades();
    const idx = trades.findIndex((t) => t.id === id);
    if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });

    trades[idx] = { ...trades[idx], ...body };
    await saveTrades(trades);
    return Response.json({ trade: trades[idx] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let trades = await loadTrades();
    const before = trades.length;
    trades = trades.filter((t) => t.id !== id);
    if (trades.length === before) return Response.json({ error: "Not found" }, { status: 404 });

    await saveTrades(trades);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
