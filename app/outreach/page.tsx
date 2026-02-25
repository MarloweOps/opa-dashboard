"use client";

import { useEffect, useMemo, useState } from "react";

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
  not_started: "NOT STARTED",
  messaged: "MESSAGED",
  responded: "RESPONDED",
  call_booked: "CALL BOOKED",
  converted: "CONVERTED",
  passed: "PASSED",
};

const STATUS_COLORS: Record<ContactStatus, string> = {
  not_started: "text-sage border-sage/30 bg-sage/10",
  messaged: "text-honey border-honey/30 bg-honey/10",
  responded: "text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10",
  call_booked: "text-porcelain border-porcelain/30 bg-porcelain/10",
  converted: "text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/20",
  passed: "text-terracotta border-terracotta/30 bg-terracotta/10",
};

export default function OutreachPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<"all" | ContactStatus>("all");
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

  const visible = useMemo(
    () => (filter === "all" ? contacts : contacts.filter((contact) => contact.status === filter)),
    [contacts, filter]
  );

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
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="panel p-4">
        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="mono text-[10px] text-sage tracking-wider block mb-1">NAME</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-black/20 border border-sage/20 px-2 py-1.5 mono text-[12px] text-porcelain"
            />
          </div>
          <div>
            <label className="mono text-[10px] text-sage tracking-wider block mb-1">COMPANY</label>
            <input
              value={form.company}
              onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
              className="bg-black/20 border border-sage/20 px-2 py-1.5 mono text-[12px] text-porcelain"
            />
          </div>
          <div>
            <label className="mono text-[10px] text-sage tracking-wider block mb-1">PLATFORM</label>
            <select
              value={form.platform}
              onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
              className="bg-black/20 border border-sage/20 px-2 py-1.5 mono text-[12px] text-sage"
            >
              <option>LinkedIn</option>
              <option>Instagram</option>
              <option>Email</option>
              <option>Direct</option>
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="mono text-[10px] text-sage tracking-wider block mb-1">NOTES</label>
            <input
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-black/20 border border-sage/20 px-2 py-1.5 mono text-[12px] text-porcelain"
            />
          </div>
          <button type="button" onClick={addContact} className="mono text-[10px] px-3 py-2 border border-forest text-[#4ade80] bg-forest/10">
            ADD CONTACT
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="mono text-[10px] text-sage tracking-wider">FILTER</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | ContactStatus)}
          className="bg-black/20 border border-sage/20 px-2 py-1 mono text-[11px] text-sage"
        >
          <option value="all">ALL</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="mono text-[10px] text-sage border-b border-sage/20">
              <th className="p-3">NAME</th>
              <th className="p-3">COMPANY</th>
              <th className="p-3">PLATFORM</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">LAST CONTACT</th>
              <th className="p-3">NOTES</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((contact) => (
              <tr key={contact.id} className="border-b border-sage/10 align-top">
                <td className="p-3 text-[12px] text-porcelain">{contact.name}</td>
                <td className="p-3 text-[12px] text-sage-light">{contact.company || "-"}</td>
                <td className="p-3 text-[12px] text-sage-light">{contact.platform || "-"}</td>
                <td className="p-3">
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
                          item.id === contact.id
                            ? { ...item, status: nextStatus, last_contact: new Date().toISOString() }
                            : item
                        )
                      );
                    }}
                    className={`mono text-[10px] px-2 py-1 border rounded ${STATUS_COLORS[contact.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 mono text-[10px] text-sage">
                  {contact.last_contact
                    ? new Date(contact.last_contact).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "-"}
                </td>
                <td className="p-3 text-[12px] text-sage-light">{contact.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
