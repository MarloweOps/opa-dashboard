import { execSync } from "child_process";

const OPENCLAW_BIN = "/opt/homebrew/bin/openclaw";
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

function cli(cmd: string, timeoutMs = 15000): string {
  try {
    return execSync(`${OPENCLAW_BIN} ${cmd}`, {
      timeout: timeoutMs,
      encoding: "utf-8",
      env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
    }).trim();
  } catch (e: any) {
    throw new Error(`openclaw ${cmd} failed: ${e.message}`);
  }
}

function cliJSON(cmd: string, timeoutMs = 15000): any {
  const raw = cli(cmd + " --json", timeoutMs);
  return JSON.parse(raw);
}

// --- Types ---

export interface GatewayHealth {
  ok: boolean;
  ts: number;
  channels: Record<string, ChannelHealth>;
}

export interface ChannelHealth {
  configured: boolean;
  running: boolean;
  probe?: {
    ok: boolean;
    bot?: { id: number; username: string };
  };
}

export interface GatewayStatus {
  heartbeat: {
    agents: { agentId: string; enabled: boolean; every: string }[];
  };
  sessions: {
    count: number;
    defaults: { model: string; contextTokens: number };
    recent: any[];
  };
  channelSummary: string[];
}

export interface CronJob {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string; tz?: string; at?: string };
  sessionTarget: string;
  payload: {
    kind: string;
    message?: string;
    text?: string;
    model?: string;
    thinking?: string;
    timeoutSeconds?: number;
  };
  delivery?: { mode: string; channel: string; to?: string; bestEffort?: boolean };
  state: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastRunStatus?: string;
    lastError?: string;
    consecutiveErrors?: number;
  };
}

// --- Gateway Health ---

export async function getHealth(): Promise<GatewayHealth> {
  const data = cliJSON("gateway call health");
  return {
    ok: data.ok ?? false,
    ts: data.ts ?? Date.now(),
    channels: data.channels ?? {},
  };
}

// --- Gateway Status ---

export async function getStatus(): Promise<GatewayStatus> {
  return cliJSON("gateway call status");
}

// --- Cron Jobs ---

export async function getCrons(): Promise<CronJob[]> {
  const data = cliJSON("cron list");
  return data.jobs ?? [];
}

export async function runCron(jobId: string): Promise<string> {
  return cli(`cron run ${jobId}`, 5000);
}

export async function toggleCron(jobId: string, enable: boolean): Promise<string> {
  return cli(`cron ${enable ? "enable" : "disable"} ${jobId}`, 5000);
}

// --- Chat Completions (streaming) ---

export function getChatCompletionsURL(): string {
  return `${GATEWAY_URL}/v1/chat/completions`;
}

export function getGatewayHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${GATEWAY_TOKEN}`,
    "Content-Type": "application/json",
  };
}
