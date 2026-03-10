import { randomUUID } from "crypto";
import { loadTrades, saveTrades, type Trade } from "@/lib/trades";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trades = await loadTrades();
    return Response.json({ trades });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trades = await loadTrades();

    const trade: Trade = {
      id: body.id || randomUUID(),
      ticker: (body.ticker || "").toUpperCase(),
      strategy: body.strategy || "CSP",
      side: body.side || "SELL",
      strike: Number(body.strike) || 0,
      expiry: body.expiry || "",
      premium: Number(body.premium) || 0,
      contracts: Number(body.contracts) || 1,
      status: body.status || "Open",
      costBasis: body.costBasis != null ? Number(body.costBasis) : undefined,
      openedAt: body.openedAt || new Date().toISOString(),
      closedAt: body.closedAt || undefined,
      pnl: body.pnl != null ? Number(body.pnl) : undefined,
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
