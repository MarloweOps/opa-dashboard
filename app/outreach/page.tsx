"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ExternalLink, Users } from "@/components/icons";

type ContactStatus = "not_started" | "messaged" | "responded" | "call_booked" | "converted" | "passed";

type Contact = {
  id: string;
  name: string;
  company: string | null;
  platform: string | null;
  status: ContactStatus;
  last_contact: string | null;
  notes: string | null;
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  not_started: "Not Started",
  messaged: "Messaged",
  responded: "Responded",
  call_booked: "Call Booked",
  converted: "Converted",
  passed: "Passed",
};

const STATUS_CLASSES: Record<ContactStatus, string> = {
  not_started: "pill-gray",
  messaged: "pill-amber",
  responded: "pill-green",
  call_booked: "pill-gray",
  converted: "pill-green",
  passed: "pill-red",
};

export default function OutreachPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<"all" | ContactStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", platform: "LinkedIn", notes: "" });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/outreach", { cache: "no-store" });
        const json = await res.json();
        if (active) setContacts(json.contacts || []);
      } catch {
        if (active) setContacts([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => (filter === "all" ? contacts : contacts.filter((contact) => contact.status === filter)), [contacts, filter]);

  const addContact = async () => {
    if (!form.name.trim()) return;
    const res = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        company: form.company || null,
        platform: form.platform,
        notes: form.notes || null,
      }),
    });
    const json = await res.json();
    if (json.contact) {
      setContacts((prev) => [json.contact, ...prev]);
      setForm({ name: "", company: "", platform: "LinkedIn", notes: "" });
      setShowModal(false);
    }
  };

  return (
    <div className="p-6 space-y-4 pb-24">
      <header className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setFilter("all")} className={filter === "all" ? "pill-green" : "pill-gray"}>All</button>
        {(["not_started", "messaged", "responded", "converted"] as ContactStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={filter === status ? "pill-green" : "pill-gray"}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </header>

      <section className="space-y-3">
        {visible.length === 0 && (
          <div className="empty-state">
            <Users size={48} className="text-[var(--text-dim)]" />
            <p className="text-[15px] text-[var(--text-primary)]">No contacts</p>
            <p className="text-[13px] text-[var(--text-secondary)]">Try another status filter.</p>
          </div>
        )}

        {visible.map((contact) => (
          <article key={contact.id} className="card !p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="h-10 w-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-[13px] font-semibold flex items-center justify-center">
                  {contact.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div>
                  <h3 className="text-[15px] text-[var(--text-primary)]">{contact.name}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)]">Coordinator · {contact.company || "Unknown studio"}</p>
                  <p className="data text-[11px] text-[var(--text-dim)] mt-1">
                    Last contact: {contact.last_contact ? timeAgo(contact.last_contact) : "-"}
                  </p>
                </div>
              </div>

              <span className={STATUS_CLASSES[contact.status]}>{STATUS_LABELS[contact.status]}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a href="#" className="btn !py-1.5 !px-2.5 inline-flex items-center gap-1 text-[12px]">
                LinkedIn <ExternalLink size={12} />
              </a>

              <details className="group">
                <summary className="btn !py-1.5 !px-2.5 text-[12px] list-none inline-flex items-center gap-1 cursor-pointer">
                  Notes <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[13px] text-[var(--text-secondary)]">{contact.notes || "No notes yet."}</p>
              </details>

              <select
                value={contact.status}
                onChange={async (e) => {
                  const nextStatus = e.target.value as ContactStatus;
                  await fetch(`/api/outreach/${contact.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: nextStatus, last_contact: new Date().toISOString() }),
                  });
                  setContacts((prev) =>
                    prev.map((item) =>
                      item.id === contact.id ? { ...item, status: nextStatus, last_contact: new Date().toISOString() } : item
                    )
                  );
                }}
                className="select !w-auto !py-1.5 !text-[12px]"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </section>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed right-6 bottom-6 btn btn-green shadow-lg text-[13px]"
      >
        + Add Contact
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px]">Add Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="input" />
              <input value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} placeholder="Company" className="input" />
              <select value={form.platform} onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))} className="select">
                <option>LinkedIn</option>
                <option>Instagram</option>
                <option>Email</option>
                <option>Direct</option>
              </select>
              <input value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes" className="input" />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn">Cancel</button>
              <button type="button" onClick={addContact} className="btn btn-green">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
