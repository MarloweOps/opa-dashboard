import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const TRADES_DIR = path.join(process.env.HOME || "", "life/trading");
const TRADES_FILE = path.join(TRADES_DIR, "wheel-trades.json");

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

async function ensureFile(): Promise<Trade[]> {
  if (!existsSync(TRADES_DIR)) {
    await mkdir(TRADES_DIR, { recursive: true });
  }
  if (!existsSync(TRADES_FILE)) {
    await writeFile(TRADES_FILE, "[]", "utf-8");
    return [];
  }
  const raw = await readFile(TRADES_FILE, "utf-8");
  return JSON.parse(raw);
}

async function saveTrades(trades: Trade[]) {
  await writeFile(TRADES_FILE, JSON.stringify(trades, null, 2), "utf-8");
}

export async function GET() {
  try {
    const trades = await ensureFile();
    return Response.json({ trades });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trades = await ensureFile();

    const trade: Trade = {
      id: randomUUID(),
      ticker: (body.ticker || "").toUpperCase(),
      strategy: body.strategy || "CSP",
      strike: Number(body.strike) || 0,
      expiry: body.expiry || "",
      premium: Number(body.premium) || 0,
      contracts: Number(body.contracts) || 1,
      status: body.status || "Open",
      costBasis: body.costBasis != null ? Number(body.costBasis) : undefined,
      openedAt: new Date().toISOString(),
      wheelCycle: body.wheelCycle || undefined,
      notes: body.notes || undefined,
    };

    trades.push(trade);
    await saveTrades(trades);
    return Response.json({ trade }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
