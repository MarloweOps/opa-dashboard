import { readFile, writeFile, copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export type Trade = {
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

/**
 * On Vercel, the project directory is read-only. We ship seed data in data/wheel-trades.json
 * and copy it to /tmp on first access. Local dev uses ~/life/trading/ directly.
 */
const IS_VERCEL = !!process.env.VERCEL;

// Local dev paths
const LOCAL_DIR = path.join(process.env.HOME || "", "life/trading");
const LOCAL_FILE = path.join(LOCAL_DIR, "wheel-trades.json");

// Vercel paths
const TMP_FILE = "/tmp/wheel-trades.json";
const SEED_FILE = path.join(process.cwd(), "data", "wheel-trades.json");

function getFilePath(): string {
  return IS_VERCEL ? TMP_FILE : LOCAL_FILE;
}

async function ensureTmpSeeded(): Promise<void> {
  if (!IS_VERCEL) return;
  if (existsSync(TMP_FILE)) return;
  // Copy seed data to /tmp on first invocation
  if (existsSync(SEED_FILE)) {
    await copyFile(SEED_FILE, TMP_FILE);
  } else {
    await writeFile(TMP_FILE, "[]", "utf-8");
  }
}

async function ensureLocalDir(): Promise<void> {
  if (IS_VERCEL) return;
  if (!existsSync(LOCAL_DIR)) {
    await mkdir(LOCAL_DIR, { recursive: true });
  }
  if (!existsSync(LOCAL_FILE)) {
    await writeFile(LOCAL_FILE, "[]", "utf-8");
  }
}

export async function loadTrades(): Promise<Trade[]> {
  if (IS_VERCEL) {
    await ensureTmpSeeded();
  } else {
    await ensureLocalDir();
  }
  const filePath = getFilePath();
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function saveTrades(trades: Trade[]): Promise<void> {
  const filePath = getFilePath();
  await writeFile(filePath, JSON.stringify(trades, null, 2), "utf-8");

  // On local dev, also sync back to the canonical location if different
  if (!IS_VERCEL && existsSync(LOCAL_DIR)) {
    // Already writing to LOCAL_FILE, no extra sync needed
  }
}
