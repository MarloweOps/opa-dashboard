import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DocRenderer from './DocRenderer';

export const dynamic = 'force-dynamic';

async function getDoc(slug: string) {
  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await sb
    .from('ops_docs')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const doc = await getDoc(params.slug);
  if (!doc) notFound();

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/docs" className="mono text-[10px] text-sage hover:text-porcelain transition-colors">
          ← DOCUMENTS
        </Link>
      </div>

      <div className="mb-8 pb-6 border-b border-sage/15">
        <div className="flex items-start justify-between gap-4 mb-3">
          <span className="mono text-[10px] text-terracotta tracking-wider uppercase">
            {doc.doc_type}
          </span>
          <span className="mono text-[10px] text-sage">
            {new Date(doc.updated_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </span>
        </div>
        <h1 className="serif text-2xl font-semibold text-porcelain leading-snug">
          {doc.title}
        </h1>
        <p className="mono text-[10px] text-sage mt-2">by {doc.updated_by}</p>
      </div>

      <DocRenderer content={doc.content} />

      <footer className="mt-16 pt-6 border-t border-sage/10">
        <p className="mono text-[10px] text-sage/40">THE VARIED · {doc.updated_by} · {doc.updated_at}</p>
      </footer>
    </main>
  );
}
