"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function EmployeeSalesPage() {
  const { data: session } = useSession();
  const bg = session?.role === "ADMIN" ? "/banners/employee-pdg.jpg" : "/banners/employee.jpg";
  const [metrics, setMetrics] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [from, setFrom] = useState<string>("");

  useEffect(() => {
    fetch("/api/employee/metrics").then(async (r) => setMetrics(await r.json()));
  }, []);

  async function loadSales() {
    const url = new URL(window.location.origin + "/api/employee/sales");
    if (from) url.searchParams.set("from", from);
    const r = await fetch(url);
    setSales(await r.json());
  }

  useEffect(() => {
    loadSales();
  }, []);

  async function removeSale(id: string) {
    if (!confirm("Supprimer cette vente ? Le stock sera réajusté.")) return;
    const r = await fetch(`/api/sales/${id}`, { method: "DELETE" });
    if (r.ok) {
      setSales((s) => s.filter((x) => x.id !== id));
    } else {
      alert(await r.text());
    }
  }

  return (
    <div className="min-h-screen relative p-6" style={{ backgroundImage: `url('${bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-3xl mx-auto space-y-6">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow p-6">
      <h1 className="text-2xl font-semibold">Mes ventes</h1>

      {metrics && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 border rounded">Jour: {(metrics.day.amount).toLocaleString()} GNF ({metrics.day.count}) · Emprunts: {metrics.day.loans || 0}</div>
          <div className="p-3 border rounded">Semaine: {(metrics.week.amount).toLocaleString()} GNF ({metrics.week.count}) · Emprunts: {metrics.week.loans || 0}</div>
          <div className="p-3 border rounded">Mois: {(metrics.month.amount).toLocaleString()} GNF ({metrics.month.count}) · Emprunts: {metrics.month.loans || 0}</div>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm mb-1">Depuis</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <button onClick={loadSales} className="h-[38px] px-4 rounded bg-black text-white">Rechercher</button>
      </div>

      <ul className="divide-y border rounded">
        {sales.map((s) => (
          <li key={s.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">{new Date(s.createdAt).toLocaleString()}</div>
              <div className="font-medium">{s.customerName}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{(s.totalAmount).toLocaleString()} GNF</div>
              <div className="text-xs text-gray-500">{s.isLoan ? `Emprunt (${s.paymentStatus})` : "Payé"}</div>
              <button onClick={() => removeSale(s.id)} className="mt-2 text-xs text-red-600 underline">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
      </div>
      </div>
    </div>
  );
}
