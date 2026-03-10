import { loadTrades, saveTrades } from "@/lib/trades";

export const dynamic = "force-dynamic";

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
