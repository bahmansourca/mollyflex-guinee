"use client";
import { useEffect, useState } from "react";

type ChartsData = {
  day: [string, number][];
  byWorker: { label: string; value: number }[];
  byProduct: { label: string; value: number; count?: number }[];
  loans: number;
};

export default function AdminCharts() {
  const [data, setData] = useState<ChartsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/charts").then(async (r) => setData(await r.json()));
  }, []);

  if (!data) return null;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="border rounded p-3">
        <h3 className="font-semibold mb-2">Ventes 7 jours</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {data.day.map(([d, v]) => (
            <li key={d} className="flex justify-between"><span>{d}</span><span>{v.toLocaleString()} GNF</span></li>
          ))}
        </ul>
        <div className="mt-3 text-sm text-gray-700">Emprunts (période): <span className="font-semibold">{data.loans}</span></div>
      </div>
      <div className="border rounded p-3">
        <h3 className="font-semibold mb-2">Par employé</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {data.byWorker.map((w) => (
            <li key={w.label} className="flex justify-between"><span>{w.label}</span><span>{w.value.toLocaleString()} GNF</span></li>
          ))}
        </ul>
      </div>
      <div className="border rounded p-3">
        <h3 className="font-semibold mb-2">Par produit</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {data.byProduct.map((p) => {
            const label = p.count && p.count > 0 ? `${p.label} (x ${p.count})` : p.label;
            return (
              <li key={p.label} className="flex justify-between"><span>{label}</span><span>{p.value.toLocaleString()} GNF</span></li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}


