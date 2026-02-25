"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DocRenderer({ content }: { content: string }) {
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-[30px] mt-8 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-[24px] mt-7 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="section-title mt-6 mb-2 text-[var(--text-secondary)]">{children}</h3>,
          h4: ({ children }) => <h4 className="text-[16px] mt-4 mb-2 text-[var(--text-primary)]">{children}</h4>,
          p: ({ children }) => <p className="text-[15px] leading-relaxed mb-4 text-[var(--text-secondary)]">{children}</p>,
          strong: ({ children }) => <strong className="text-[var(--text-primary)] font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic text-[var(--text-primary)]">{children}</em>,
          ul: ({ children }) => <ul className="mb-4 space-y-2 pl-5 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 space-y-2 pl-5 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-2 border-[var(--green)] pl-4 my-4 text-[var(--text-primary)]">{children}</blockquote>,
          code: ({ children }) => <code className="data text-[12px] bg-black/25 px-1.5 py-0.5 rounded text-[var(--amber)]">{children}</code>,
          pre: ({ children }) => <pre className="data text-[12px] bg-black/30 border border-[var(--border)] rounded-xl p-4 overflow-x-auto mb-4">{children}</pre>,
          hr: () => <hr className="border-[var(--border)] my-8" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 border border-[var(--border)] rounded-xl">
              <table className="w-full text-[14px]">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="data text-[11px] text-[var(--text-dim)] text-left py-2 px-3 border-b border-[var(--border)] uppercase">{children}</th>,
          td: ({ children }) => <td className="text-[var(--text-secondary)] py-2 px-3 border-b border-[var(--border)]">{children}</td>,
          img: ({ src, alt }) => (
            <div className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt || ""} className="w-full rounded-xl object-cover max-h-80" style={{ filter: "brightness(0.9)" }} />
              {alt && <p className="data text-[11px] text-[var(--text-dim)] mt-2 text-center">{alt}</p>}
            </div>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-[var(--blue)] hover:text-[var(--text-primary)] underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
