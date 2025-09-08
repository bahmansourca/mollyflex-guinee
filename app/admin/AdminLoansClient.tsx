"use client";
import { useEffect, useState } from "react";

export default function AdminLoansClient() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/loans");
    setLoans(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function settle(id: string) {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ saleId: id }) });
      if (!r.ok) return alert(await r.text());
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <ul className="divide-y border rounded">
        {loans.length === 0 && <li className="p-3 text-gray-600">Aucun</li>}
        {loans.map((l) => (
          <li key={l.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">{new Date(l.createdAt).toLocaleString()}</div>
              <div className="font-medium">{l.customerName} ({l.customerPhone})</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{(l.totalAmount).toLocaleString()} GNF</div>
              <button disabled={loading} onClick={() => settle(l.id)} className="ml-3 px-3 py-1 rounded bg-black text-white disabled:opacity-50">Régler</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
