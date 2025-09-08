"use client";
import { useEffect, useState } from "react";

export default function AdminWithdrawalsPanel() {
  const [method, setMethod] = useState("CASH");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [balances, setBalances] = useState<{CASH:number;ORANGE_MONEY:number;BANK:number}>({CASH:0,ORANGE_MONEY:0,BANK:0});
  const available = balances[method as keyof typeof balances] || 0;

  async function load() {
    const [h, b] = await Promise.all([
      fetch("/api/admin/withdrawals"),
      fetch("/api/admin/withdrawals?balances=true"),
    ]);
    if (h.ok) setHistory(await h.json());
    if (b.ok) setBalances(await b.json());
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method, amount, note }) });
    if (!r.ok) return alert(await r.text());
    setAmount(0); setNote("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce retrait ?")) return;
    const r = await fetch(`/api/admin/withdrawals/${id}`, { method: "DELETE" });
    if (!r.ok && r.status !== 204) return alert(await r.text());
    await load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="grid md:grid-cols-4 gap-3">
        <select value={method} onChange={(e)=>setMethod(e.target.value)} className="border rounded px-3 py-2">
          <option value="CASH">Cash</option>
          <option value="ORANGE_MONEY">Orange Money</option>
          <option value="BANK">Banque</option>
        </select>
        <input type="number" min={1} max={available} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} placeholder="Montant" className="border rounded px-3 py-2" />
        <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Note (raison)" className="border rounded px-3 py-2" />
        <button className="bg-black text-white px-4 py-2 rounded" disabled={available <= 0 || amount <= 0 || amount > available}>
          {available <= 0 ? "Indisponible" : "Retirer"}
        </button>
      </form>

      <div className="text-sm opacity-80">Disponible — Cash: {balances.CASH.toLocaleString()} · OM: {balances.ORANGE_MONEY.toLocaleString()} · Banque: {balances.BANK.toLocaleString()} GNF</div>

      <div>
        <h3 className="font-semibold mb-2">Historique des retraits</h3>
        <ul className="divide-y border rounded">
          {history.length === 0 && <li className="p-3 text-gray-600">Aucun</li>}
          {history.map((w:any) => (
            <li key={w.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">{new Date(w.createdAt).toLocaleString()} — {w.createdBy?.name}</div>
                {w.note && <div className="text-xs opacity-70">{w.note}</div>}
              </div>
              <div className="text-right">
                <div className="font-semibold">{w.amount.toLocaleString()} GNF</div>
                <div className="text-xs opacity-70">{w.method}</div>
                <button onClick={()=>remove(w.id)} className="text-red-600 text-xs underline mt-1">Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


