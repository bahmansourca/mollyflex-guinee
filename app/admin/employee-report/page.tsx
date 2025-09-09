"use client";
import { useEffect, useState } from "react";

export default function EmployeeReportPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/admin/users").then(async (r) => setUsers(await r.json())).catch(() => {});
  }, []);

  async function load() {
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (userId) sp.set("userId", userId);
    const r = await fetch(`/api/admin/employee-report?${sp.toString()}`);
    setData(await r.json());
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Rapport employé</h1>
      <div className="grid md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs mb-1">Depuis</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Jusqu'au</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Employé</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="border rounded px-3 py-2 w-full">
            <option value="">Tous</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex items-end"><button onClick={load} className="px-4 py-2 rounded bg-black text-white w-full">Générer</button></div>
      </div>

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 border rounded">Total: {data.total.toLocaleString()} GNF</div>
            <div className="p-3 border rounded">Nombre de ventes: {data.count}</div>
            <div className="p-3 border rounded">Suppressions: {data.deletions}</div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Top produits</h2>
            <ul className="text-sm space-y-1">
              {data.topProducts.map((t: any) => (
                <li key={t.name} className="flex justify-between"><span>{t.name} {t.count ? `(x ${t.count})` : ''}</span><span>{t.amount.toLocaleString()} GNF</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="text-sm"><a href="/admin" className="underline">Retour</a></div>
    </div>
  );
}


