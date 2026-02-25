import { getStatus } from "@/lib/data";

export const dynamic = "force-dynamic";

const DOWNLOADS = [
  { label: "OPA Production Master v1.4", file: "/downloads/OPA-Production-Master-v1.4.xlsx", size: "47 KB" },
  { label: "OPA Production Master v1.3", file: "/downloads/OPA-Production-Master-v1.3.xlsx", size: "47 KB" },
  { label: "OPA Production Master v1.2", file: "/downloads/OPA-Production-Master-v1.2.xlsx", size: "46 KB" },
  { label: "OPA Production Master v1.1", file: "/downloads/OPA-Production-Master-v1.1.xlsx", size: "45 KB" },
  { label: "OPA Production Master v1.0", file: "/downloads/OPA-Production-Master-v1.0.xlsx", size: "44 KB" },
];

export default async function ProductsPage() {
  const status = await getStatus();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
      <section className="card xl:col-span-2 space-y-4">
        <h2 className="section-title">Products</h2>

        <article className="card !p-4">
          <p className="section-title">OPA Production Master</p>
          <h3 className="text-[20px] mt-1">v1.4 — Ready</h3>
          <p className="text-[14px] text-[var(--text-secondary)] mt-2">13-sheet commercial production operating system. Info Sheet → CSD1 cross-links, QTY×Rate Change Order, editable markup %.</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <p className="data text-[12px]">MRR <span className="text-[var(--green)]">${status.mrr.toLocaleString()}</span></p>
            <p className="data text-[12px]">Paying users <span className="text-[var(--text-primary)]">{status.payingUsers}</span></p>
            <p className="data text-[12px]">Template revenue <span className="text-[var(--text-primary)]">${status.lsRevenue.toLocaleString()}</span></p>
          </div>
          <button disabled className="btn mt-3 opacity-40 cursor-not-allowed">Push to Lemon Squeezy</button>
        </article>

        <article className="card !p-4">
          <p className="section-title">OPA SaaS Snapshot</p>
          <div className="mt-3 space-y-2 text-[14px]">
            <div className="flex items-center justify-between"><span>MRR</span><span className="data text-[var(--green)]">${status.mrr.toLocaleString()}</span></div>
            <div className="flex items-center justify-between"><span>Template Revenue</span><span className="data text-[var(--text-primary)]">${status.lsRevenue.toLocaleString()}</span></div>
            <div className="flex items-center justify-between"><span>Trials This Week</span><span className="data text-[var(--text-primary)]">{status.trialsThisWeek}</span></div>
          </div>
        </article>
      </section>

      <aside className="card space-y-3">
        <h2 className="section-title">Downloads</h2>
        {DOWNLOADS.map((item) => (
          <a key={item.file} href={item.file} download className="card !p-3.5 hover:bg-[var(--bg-elevated)]">
            <p className="text-[14px] text-[var(--text-primary)]">{item.label}</p>
            <p className="data text-[11px] text-[var(--text-secondary)] mt-1">.xlsx - {item.size}</p>
          </a>
        ))}
      </aside>
    </div>
  );
}
