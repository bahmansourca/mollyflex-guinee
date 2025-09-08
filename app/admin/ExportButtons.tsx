"use client";

export default function ExportButtons() {
  function exportRange(range: string) {
    window.location.href = `/api/admin/export?range=${range}`;
  }
  return (
    <div className="flex gap-2">
      <button onClick={() => exportRange("day")} className="px-3 py-1 border rounded">Exporter Jour</button>
      <button onClick={() => exportRange("week")} className="px-3 py-1 border rounded">Exporter Semaine</button>
      <button onClick={() => exportRange("month")} className="px-3 py-1 border rounded">Exporter Mois</button>
      <button onClick={() => exportRange("all")} className="px-3 py-1 border rounded">Exporter Tout</button>
      <a href="/admin/audit" className="px-3 py-1 border rounded">Journal</a>
    </div>
  );
}


