import { getChatCompletionsURL, getGatewayHeaders } from "@/lib/openclaw";
import { requireDashboardAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

const PROJECT_PROMPTS: Record<string, string> = {
  OPA: "You are Marlowe, operating in the OPA product context. This is for OPA work — product, revenue, email, users, templates, growth. Brand rules are non-negotiable — no wrap book, no AI in copy, no blue.",
  FieldPass: "You are Marlowe, operating in the FieldPass context. This is for FieldPass work — subcontractor compliance, construction GC pricing, Sean partnership. Free for subs is the core brand promise.",
  Revenue: "You are Marlowe, operating in the Trading and Finance context. Capital preservation is the primary constraint. Frame everything as analysis and options, never directives.",
  Creative: "You are Marlowe, operating in the Creative context. This is for director work and music as Frankie Prince — treatments, concepts, bids, creative direction. Be bold.",
  Production: "You are Marlowe, operating in the Production Coordination context. This is for active job work — crew, logistics, budget, schedule, wrap. Work fast and practical.",
  Life: "You are Marlowe, Director AI for The Varied. Help Brendan with daily operations, planning, and general tasks.",
};

export async function POST(req: NextRequest) {
  const denied = requireDashboardAuth(req);
  if (denied) return denied;

  const { messages, project, model } = await req.json();
  const systemPrompt = PROJECT_PROMPTS[project] || PROJECT_PROMPTS.Life;

  const allMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch(getChatCompletionsURL(), {
      method: "POST",
      headers: getGatewayHeaders(),
      body: JSON.stringify({
        model: model || "openclaw:main",
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json({ error: text }, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}
