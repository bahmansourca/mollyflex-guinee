"use client";
import { useEffect, useState } from "react";

type Product = { id: string; name: string };

type Item = { productId: string; quantity: number };
type EditItem = { productId: string; productName: string; quantity: number };

export default function ContainerIntakePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<Item[]>([{ productId: "", quantity: 0 }]);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products").then(async (res) => setProducts(await res.json()));
  }, []);

  function addRow() {
    setRows((r) => [...r, { productId: "", quantity: 0 }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    const items = rows.filter((r) => r.productId && r.quantity > 0);
    if (items.length === 0) {
      setError("Veuillez ajouter au moins un article valide");
      return;
    }
    const res = await fetch("/api/containers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, items }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setMsg("Container enregistré");
    setRows([{ productId: "", quantity: 0 }]);
    setNote("");
  }

  return (
    <div className="min-h-screen relative p-6" style={{ backgroundImage: "url('/banners/container.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative max-w-3xl mx-auto">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow p-6">
      <h1 className="text-2xl font-semibold mb-4">Nouveau container</h1>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        <div>
          <label className="block text-sm mb-1">Note</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={row.productId} onChange={(e) => setRows((rs) => rs.map((r, i) => i === idx ? { ...r, productId: e.target.value } : r))} className="border rounded px-3 py-2">
                <option value="">Produit…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min={1} value={row.quantity} onChange={(e) => setRows((rs) => rs.map((r, i) => i === idx ? { ...r, quantity: Number(e.target.value) } : r))} className="border rounded px-3 py-2" />
              <div className="flex items-center"><button type="button" onClick={() => setRows((rs) => rs.filter((_, i) => i !== idx))} className="text-sm underline">Retirer</button></div>
            </div>
          ))}
          <button type="button" onClick={addRow} className="text-sm underline">+ Ajouter une ligne</button>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded">Enregistrer</button>
      </form>
      </div>
      <div className="relative text-sm mt-6">
        <a href="/admin" className="underline">Retour au tableau de bord</a> · <a href="/admin/audit" className="underline">Journal d'activité</a>
      </div>
      <div className="mt-8 bg-white/95 backdrop-blur rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Historique récent</h2>
        <ContainerHistory />
      </div>
      </div>
    </div>
  );
}

function ContainerHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [editing, setEditing] = useState<{id: string; items: EditItem[]} | null>(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newPrice, setNewPrice] = useState<number>(0);

  useEffect(() => {
    fetch('/api/containers').then(async r => setHistory(await r.json()));
    fetch('/api/products').then(async r => setProducts(await r.json()));
  }, []);

  async function openEdit(id: string) {
    const r = await fetch(`/api/containers/${id}`);
    if (!r.ok) return;
    const data = await r.json();
    setEditing({ id, items: data.items.map((it: any) => ({ productId: it.productId, productName: it.product?.name || it.productId, quantity: it.quantity })) });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const payload = { items: editing.items.map(i => ({ productId: i.productId, quantity: i.quantity })) };
    const r = await fetch(`/api/containers/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!r.ok) return alert(await r.text());
    setEditing(null);
    const rr = await fetch('/api/containers');
    if (rr.ok) setHistory(await rr.json());
  }

  async function createProduct() {
    if (!newName || !newSku || !newPrice) return;
    const r = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, sku: newSku, defaultWholesalePrice: Number(newPrice) }) });
    if (!r.ok) return alert(await r.text());
    const created = await r.json();
    // refresh product list
    const pr = await fetch('/api/products');
    if (pr.ok) setProducts(await pr.json());
    // assign to the first row without product or append
    if (editing) {
      setEditing({
        ...editing,
        items: [...editing.items, { productId: created.id, productName: created.name, quantity: 0 }]
      });
    }
    setCreating(false);
    setNewName(""); setNewSku(""); setNewPrice(0);
  }

  return (
    <>
      <ul className="divide-y">
        {history.length === 0 && <li className="py-2 text-gray-600">Aucun</li>}
        {history.map((h) => (
          <li key={h.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="text-sm">Créé le {new Date(h.createdAt).toLocaleString()}</div>
              <div className="text-xs text-gray-600">Dernière modif: {new Date(h.lastEditedAt).toLocaleString()}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">Qté totale: {h.totalQty}</div>
              {h.note && <div className="text-gray-600">{h.note}</div>}
              <button onClick={() => openEdit(h.id)} className="underline text-blue-600 mt-1">Modifier</button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-2xl">
            <h3 className="font-semibold mb-3">Modifier les articles</h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {editing.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <select value={it.productId} onChange={(e)=>{
                    const pid = e.target.value;
                    const pname = products.find(p => p.id === pid)?.name || pid;
                    setEditing(prev => prev ? { ...prev, items: prev.items.map((x,i)=> i===idx ? { ...x, productId: pid, productName: pname } : x) } : prev);
                  }} className="border rounded px-2 py-1 md:col-span-4">
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min={0} value={it.quantity} onChange={(e)=>{
                    const q = Number(e.target.value);
                    setEditing(prev => prev ? { ...prev, items: prev.items.map((x,i)=> i===idx ? { ...x, quantity: q } : x) } : prev);
                  }} className="border rounded px-2 py-1 md:col-span-2" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <button onClick={()=>setCreating(x=>!x)} className="underline">{creating ? 'Annuler' : '+ Nouveau produit'}</button>
            </div>
            {creating && (
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="Nom (ex: Matelas épaisseur 20 180x190)" className="border rounded px-2 py-1" />
                <input value={newSku} onChange={(e)=>setNewSku(e.target.value)} placeholder="SKU" className="border rounded px-2 py-1" />
                <input type="number" min={1} value={newPrice} onChange={(e)=>setNewPrice(Number(e.target.value))} placeholder="Prix de gros" className="border rounded px-2 py-1" />
                <div className="col-span-3 text-right">
                  <button onClick={createProduct} className="px-3 py-2 bg-black text-white rounded">Créer et ajouter</button>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-2 border rounded">Annuler</button>
              <button disabled={saving} onClick={saveEdit} className="px-3 py-2 bg-black text-white rounded">{saving ? 'Sauvegarde…' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
