"use client";

type MarloweBannerProps = {
  task: string;
  status: "ACTIVE" | "BUILDING" | "WAITING" | "IDLE";
  startedAt?: string;
  progress: number;
};

export default function MarloweBanner({ task, status, startedAt, progress }: MarloweBannerProps) {
  const minutes = startedAt ? minutesSince(startedAt) : 0;

  return (
    <section className="card col-span-full border-l-[3px] border-l-[var(--green)] bg-[linear-gradient(135deg,rgba(74,222,128,0.14),rgba(17,23,20,0.9))]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-full bg-[var(--green)] text-[#0a0d0a] text-[16px] font-bold flex items-center justify-center">M</span>
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">MARLOWE - Director AI</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill-green data text-[10px]">{status}</span>
          <span className="data text-[11px] text-[var(--text-secondary)]">{minutes}m</span>
        </div>
      </div>

      <p className="mt-4 text-[15px] text-[var(--text-primary)]">{task}</p>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-black/30 overflow-hidden">
          <div className="h-full rounded-full bg-[var(--green)] transition-all" style={{ width: `${Math.max(8, Math.min(progress, 96))}%` }} />
        </div>
        <p className="data text-[11px] text-[var(--text-secondary)] mt-2">{Math.max(8, Math.min(progress, 96))}% complete</p>
      </div>
    </section>
  );
}

function minutesSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 60000));
}
