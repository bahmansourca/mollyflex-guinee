"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Product = { id: string; name: string; defaultWholesalePrice: number };

export default function SalePage() {
  const { data: session } = useSession();
  const bg = session?.role === "ADMIN" ? "/banners/employee-pdg.jpg" : "/banners/employee.jpg";
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [priceMode, setPriceMode] = useState("WHOLESALE_FIXED");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [isLoan, setIsLoan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    }
    load();
    const id = setInterval(load, 10000); // auto-refresh prices every 10s
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const q = customerPhone.trim() || customerName.trim();
    if (!q) { setCustomerSuggestions([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const r = await fetch(`/api/customers?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
      if (r.ok) setCustomerSuggestions(await r.json());
    }, 250);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [customerPhone, customerName]);

  useEffect(() => {
    if (priceMode === "WHOLESALE_FIXED") {
      const p = products.find((p) => p.id === productId);
      setUnitPrice(p ? p.defaultWholesalePrice : "");
    }
  }, [productId, priceMode, products]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, customerName, customerPhone, paymentMethod, priceMode, unitPrice: unitPrice === "" ? null : Number(unitPrice), isLoan }),
    });
    if (!res.ok) {
      const t = await res.text();
      setError(t || "Erreur");
      return;
    }
    setSuccess("Enregistré");
    setProductId("");
    setQuantity(1);
    setCustomerName("");
    setCustomerPhone("");
    setPriceMode("WHOLESALE_FIXED");
    setUnitPrice("");
    setIsLoan(false);
  }

  return (
    <div className="min-h-screen relative p-6" style={{ backgroundImage: `url('${bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-2xl mx-auto">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow p-6">
      <h1 className="text-2xl font-semibold mb-4">Ajouter une vente / emprunt</h1>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-700 text-sm">{success}</div>}
        <div>
          <label className="block text-sm mb-1">Produit</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Choisir…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Quantité</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Mode de paiement</label>
            <select
              value={isLoan ? "EMPRUNT" : paymentMethod}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "EMPRUNT") {
                  setIsLoan(true);
                } else {
                  setIsLoan(false);
                  setPaymentMethod(v);
                }
              }}
              className="w-full border rounded px-3 py-2"
            >
              <option value="CASH">Cash</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="BANK">Compte bancaire PDG</option>
              <option value="EMPRUNT">Emprunt (payer plus tard)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Prix</label>
            <select value={priceMode} onChange={(e) => setPriceMode(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="WHOLESALE_FIXED">Prix fixe (gros)</option>
              <option value="RETAIL_CUSTOM">Prix libre (détail)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Prix unitaire</label>
            <input type="number" value={unitPrice as any} onChange={(e) => setUnitPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-full border rounded px-3 py-2" disabled={priceMode === "WHOLESALE_FIXED"} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Client</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border rounded px-3 py-2" />
            {customerSuggestions.length > 0 && (
              <ul className="border rounded mt-1 max-h-40 overflow-auto text-sm bg-white">
                {customerSuggestions.map((c) => (
                  <li key={c.id} className="px-3 py-1 hover:bg-gray-50 cursor-pointer" onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone); setCustomerSuggestions([]); }}>
                    {c.name} — {c.phone}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Téléphone</label>
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="loan"
            type="checkbox"
            checked={isLoan}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsLoan(checked);
              if (!checked && paymentMethod === "EMPRUNT") {
                setPaymentMethod("CASH");
              }
            }}
          />
          <label htmlFor="loan">Produit emprunté (paiement plus tard)</label>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded">Enregistrer</button>
      </form>
      </div>
      </div>
    </div>
  );
}
