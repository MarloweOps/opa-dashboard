import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocRenderer from "./DocRenderer";

export const dynamic = "force-dynamic";

async function getDoc(slug: string) {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await sb.from("ops_docs").select("*").eq("slug", slug).single();
  return data;
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const doc = await getDoc(params.slug);
  if (!doc) notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <Link href="/docs" className="btn inline-flex">← Documents</Link>

      <header className="card">
        <div className="flex items-start justify-between gap-3">
          <span className="pill-gray">{doc.doc_type}</span>
          <span className="data text-[11px] text-[var(--text-secondary)]">
            {new Date(doc.updated_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-[28px] mt-3">{doc.title}</h1>
        <p className="data text-[12px] text-[var(--text-secondary)] mt-2">by {doc.updated_by}</p>
      </header>

      <section className="card">
        <DocRenderer content={doc.content} />
      </section>
    </main>
  );
}
