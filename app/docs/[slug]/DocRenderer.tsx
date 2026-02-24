'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocRenderer({ content }: { content: string }) {
  return (
    <div className="doc-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="serif text-2xl font-semibold text-porcelain mt-10 mb-4 leading-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="serif text-xl font-semibold text-porcelain mt-8 mb-3 leading-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mono text-[11px] font-bold text-sage tracking-widest uppercase mt-6 mb-3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-honey font-semibold mt-4 mb-2 text-sm">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-sage-light text-[14px] leading-relaxed mb-4">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-porcelain font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-porcelain italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1.5 pl-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1.5 pl-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sage-light text-[14px] leading-relaxed before:content-['—'] before:mr-2 before:text-sage/50">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-terracotta pl-4 my-4 italic text-porcelain/80">{children}</blockquote>
          ),
          code: ({ children }) => (
            <code className="mono text-[12px] bg-forest/30 px-1.5 py-0.5 rounded text-honey">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="mono text-[12px] bg-forest-dark border border-sage/15 rounded p-4 overflow-x-auto mb-4">{children}</pre>
          ),
          hr: () => (
            <hr className="border-sage/15 my-8" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-[13px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="mono text-[10px] text-sage tracking-wider uppercase text-left py-2 px-3 border-b border-sage/20">{children}</th>
          ),
          td: ({ children }) => (
            <td className="text-sage-light py-2 px-3 border-b border-sage/10">{children}</td>
          ),
          img: ({ src, alt }) => (
            <div className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ''}
                className="w-full rounded-sm object-cover max-h-80"
                style={{ filter: 'brightness(0.85) contrast(1.05)' }}
              />
              {alt && <p className="mono text-[10px] text-sage mt-2 text-center">{alt}</p>}
            </div>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-forest-light hover:text-porcelain underline transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
