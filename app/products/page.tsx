import { getStatus } from "@/lib/data";

export const dynamic = "force-dynamic";

const DOWNLOADS = [
  { label: "OPA Production Master v1.3", file: "/downloads/OPA-Production-Master-v1.3.xlsx", size: "47 KB" },
  { label: "OPA Production Master v1.2", file: "/downloads/OPA-Production-Master-v1.2.xlsx", size: "46 KB" },
  { label: "OPA Production Master v1.1", file: "/downloads/OPA-Production-Master-v1.1.xlsx", size: "45 KB" },
  { label: "OPA Production Master v1.0", file: "/downloads/OPA-Production-Master-v1.0.xlsx", size: "44 KB" },
];

export default async function ProductsPage() {
  const status = await getStatus();

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
      <section className="panel xl:col-span-2">
        <div className="panel-header">↓ Products</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="border border-sage/20 bg-forest/10 p-4">
            <p className="mono text-[10px] text-sage tracking-wider">OPA PRODUCTION MASTER</p>
            <h3 className="text-[16px] text-porcelain mt-2">v1.4 (in progress)</h3>
            <p className="text-[12px] text-sage-light mt-2">Commercial production operating system template for F45 operators.</p>
            <div className="mt-3 space-y-1 mono text-[10px]">
              <div className="flex justify-between"><span className="text-sage">Lemon Squeezy</span><span className="text-honey">Pending Setup</span></div>
              <div className="flex justify-between"><span className="text-sage">MRR</span><span className="text-[#4ade80]">${status.mrr.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sage">Paying users</span><span className="text-porcelain">{status.payingUsers}</span></div>
            </div>
            <button disabled className="mt-4 mono text-[10px] px-3 py-2 border border-sage/20 text-sage/50 cursor-not-allowed">
              PUSH TO LEMON SQUEEZY
            </button>
          </article>

          <article className="border border-sage/20 bg-forest/10 p-4">
            <p className="mono text-[10px] text-sage tracking-wider">OPA SAAS SNAPSHOT</p>
            <h3 className="text-[16px] text-porcelain mt-2">Operations Metrics</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between"><span className="text-[12px] text-sage-light">MRR</span><span className="mono text-[12px] text-[#4ade80]">${status.mrr.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span className="text-[12px] text-sage-light">Template Revenue</span><span className="mono text-[12px] text-porcelain">${status.lsRevenue.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span className="text-[12px] text-sage-light">Trials This Week</span><span className="mono text-[12px] text-porcelain">{status.trialsThisWeek}</span></div>
            </div>
          </article>
        </div>
      </section>

      <aside className="panel">
        <div className="panel-header">Downloads</div>
        <div className="p-4 space-y-2">
          {DOWNLOADS.map((item) => (
            <a key={item.file} href={item.file} download className="block border border-sage/20 bg-forest/10 px-3 py-2 hover:border-sage/40 transition">
              <p className="mono text-[10px] text-porcelain">{item.label}</p>
              <p className="mono text-[9px] text-sage mt-1">.xlsx · {item.size}</p>
            </a>
          ))}
          <div className="pt-2 border-t border-sage/15">
            <p className="mono text-[10px] text-sage tracking-wider mb-2">VERSION HISTORY</p>
            <ul className="space-y-1">
              {DOWNLOADS.map((item) => (
                <li key={item.label} className="mono text-[10px] text-sage-light">{item.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
