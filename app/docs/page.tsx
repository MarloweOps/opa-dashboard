import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getDocs() {
  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await sb
    .from('ops_docs')
    .select('slug, title, doc_type, updated_at, updated_by')
    .order('updated_at', { ascending: false });
  return data || [];
}

const TYPE_COLORS: Record<string, string> = {
  treatment:  'text-terracotta border-terracotta/30 bg-terracotta/10',
  strategy:   'text-honey border-honey/30 bg-honey/10',
  memory:     'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10',
  reference:  'text-sage border-sage/30 bg-sage/10',
  agent:      'text-porcelain border-porcelain/30 bg-porcelain/10',
};

export default async function DocsPage() {
  const docs = await getDocs();

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="mono text-[10px] text-sage hover:text-porcelain transition-colors">
          ← BACK TO OPS
        </Link>
        <h1 className="serif text-2xl font-semibold text-porcelain mt-4">
          The Varied<span className="text-terracotta">.</span>
        </h1>
        <p className="mono text-[11px] text-sage tracking-widest mt-1">DOCUMENTS</p>
      </div>

      {docs.length === 0 && (
        <p className="text-sage text-sm italic">No documents yet.</p>
      )}

      <div className="grid gap-3">
        {docs.map((doc: any) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="panel p-4 hover:border-sage/40 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-porcelain font-medium text-[15px] group-hover:text-porcelain transition-colors leading-snug">
                  {doc.title}
                </h2>
                <p className="mono text-[10px] text-sage mt-1">
                  {new Date(doc.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })} · {doc.updated_by}
                </p>
              </div>
              <span className={`mono text-[9px] px-2 py-1 rounded border ${TYPE_COLORS[doc.doc_type] || TYPE_COLORS.reference} whitespace-nowrap`}>
                {doc.doc_type?.toUpperCase()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-12">
        <p className="mono text-[10px] text-sage/50">THE VARIED · Brendan Lynch + Marlowe</p>
      </footer>
    </main>
  );
}
