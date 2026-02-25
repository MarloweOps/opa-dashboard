import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDocs() {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb
    .from("ops_docs")
    .select("slug, title, doc_type, updated_at, updated_by")
    .order("updated_at", { ascending: false });
  return data || [];
}

const TYPE_CLASSES: Record<string, string> = {
  treatment: "pill-red",
  strategy: "pill-amber",
  memory: "pill-green",
  reference: "pill-gray",
  agent: "pill-gray",
};

export default async function DocsPage() {
  const docs = await getDocs();

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <header className="card flex items-center justify-between">
        <div>
          <h1 className="text-[24px]">Docs</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">Knowledge base and runbooks</p>
        </div>
        <Link href="/inbox" className="btn btn-green">+ Send to Marlowe</Link>
      </header>

      {docs.length === 0 && <div className="empty-state"><p className="text-[14px]">No documents yet.</p></div>}

      <div className="space-y-3">
        {docs.map((doc: any) => (
          <Link key={doc.slug} href={`/docs/${doc.slug}`} className="card !p-4 hover:bg-[var(--bg-elevated)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[16px]">{doc.title}</h2>
                <p className="data text-[11px] text-[var(--text-secondary)] mt-1">
                  {new Date(doc.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} · {doc.updated_by}
                </p>
              </div>
              <span className={TYPE_CLASSES[doc.doc_type] || "pill-gray"}>{doc.doc_type}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
