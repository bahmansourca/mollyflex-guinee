"use client";
import { useEffect, useState } from "react";

type Product = { id: string; name: string; defaultWholesalePrice: number; isActive: boolean };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number>(0);

  async function load() {
    const r = await fetch("/api/admin/products");
    setProducts(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function updatePrice(id: string, price: number, oldPrice: number) {
    setMsg(null);
    if (!confirm(`Confirmer la modification du prix:\nAncien: ${oldPrice.toLocaleString()} GNF -> Nouveau: ${price.toLocaleString()} GNF`)) return;
    const r = await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, defaultWholesalePrice: price }) });
    if (!r.ok) {
      alert(await r.text());
      return;
    }
    setMsg("Prix mis à jour");
    await load();
  }

  return (
    <div className="min-h-screen bg-gradient-violet p-6">
      <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Produits — Prix de gros</h1>
      {msg && <div className="text-green-700 text-sm">{msg}</div>}
      <div className="glass-card p-4 space-y-3">
        <div className="font-semibold">Créer un produit</div>
        <div className="grid grid-cols-3 gap-3">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nom" className="border rounded px-3 py-2" />
          <input value={sku} onChange={(e)=>setSku(e.target.value)} placeholder="SKU" className="border rounded px-3 py-2" />
          <input type="number" min={1} value={price} onChange={(e)=>setPrice(Number(e.target.value))} placeholder="Prix de gros" className="border rounded px-3 py-2" />
        </div>
        <div>
          <button
            onClick={async () => {
              setMsg(null);
              if (!name || !sku || !price) return alert("Champs requis");
              const r = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, sku, defaultWholesalePrice: Number(price) }) });
              if (!r.ok) return alert(await r.text());
              setName(""); setSku(""); setPrice(0);
              setMsg("Produit créé");
              await load();
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >Créer</button>
        </div>
      </div>
      <ul className="divide-y border rounded">
        {products.map((p) => (
          <li key={p.id} className="p-3 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="font-medium">{p.name}</div>
            <div>
              <input type="number" defaultValue={p.defaultWholesalePrice} onBlur={(e) => updatePrice(p.id, Number(e.target.value), p.defaultWholesalePrice)} className="border rounded px-3 py-2 w-40" />
            </div>
            <div className="text-sm text-gray-600">GNF</div>
            <div className="text-right">
              <button onClick={async ()=>{
                if (!confirm(`Supprimer ${p.name} ?`)) return;
                // Optimistic update: remove from UI immediately
                setProducts(prev => prev.filter(x => x.id !== p.id));
                const r = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
                if (r.status !== 204) {
                  alert(await r.text());
                  // Reload to restore state if failed
                  await load();
                  return;
                }
                setMsg("Produit supprimé");
              }} className="text-red-600 underline text-sm">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-sm"><a href="/admin" className="underline">Retour</a></div>
      </div>
    </div>
  );
}


