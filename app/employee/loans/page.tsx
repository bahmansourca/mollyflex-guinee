"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function EmployeeLoansPage() {
  const { data: session } = useSession();
  const bg = session?.role === "ADMIN" ? "/banners/employee-pdg.jpg" : "/banners/employee.jpg";
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/employee/loans");
    setLoans(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function settle(id: string) {
    const method = window.prompt("Régler par: CASH | ORANGE_MONEY | BANK", "CASH");
    if (!method) return;
    setLoading(true);
    try {
      const r = await fetch("/api/employee/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ saleId: id, method }) });
      if (!r.ok) return alert(await r.text());
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function settleWith(id: string, method: 'CASH' | 'ORANGE_MONEY' | 'BANK') {
    setLoading(true);
    try {
      const r = await fetch("/api/employee/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ saleId: id, method }) });
      if (!r.ok) return alert(await r.text());
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative p-6" style={{ backgroundImage: `url('${bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-3xl mx-auto space-y-6">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow p-6">
      <h1 className="text-2xl font-semibold">Mes emprunts (en attente)</h1>
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
              <div className="mt-2 flex gap-2 justify-end">
                <button disabled={loading} onClick={() => settle(l.id)} className="px-3 py-1 rounded bg-black text-white disabled:opacity-50 hidden">Régler</button>
                <button disabled={loading} onClick={() => settle(l.id)} className="px-3 py-1 rounded bg-gray-200 text-gray-900 disabled:opacity-50 hidden">Choisir</button>
                <button disabled={loading} onClick={() => settleWith(l.id, 'CASH')} className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50">Cash</button>
                <button disabled={loading} onClick={() => settleWith(l.id, 'ORANGE_MONEY')} className="px-3 py-1 rounded bg-orange-500 text-white disabled:opacity-50">Orange Money</button>
                <button disabled={loading} onClick={() => settleWith(l.id, 'BANK')} className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50">Banque</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      </div>
      </div>
    </div>
  );
}
