"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", { username, password, callbackUrl, redirect: false });
      if (!res || res.error || res.ok === false) {
        setError("Identifiants invalides");
        return;
      }
      // Redirige même si res.url est vide
      const target = res.url || callbackUrl || "/";
      window.location.href = target;
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6" style={{ backgroundImage: "url('/banners/login.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/40" />
      <form onSubmit={onSubmit} className="relative z-10 w-full max-w-sm bg-white/85 backdrop-blur p-6 rounded-2xl shadow-lg space-y-4 border">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-xl font-semibold text-center">Mollyflex en Guinée</h1>
        </div>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <div>
          <label className="block text-sm mb-1">Identifiant</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-black text-white rounded-md py-2 hover:bg-slate-900 disabled:opacity-60">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <div className="text-xs text-gray-500 text-center">
          <a href="/login/password" className="underline">Changer mon mot de passe</a>
        </div>
        <div className="text-xs text-gray-500 text-center">
          <a href="/" className="underline">Retour à l’accueil</a>
        </div>
        
      </form>
    </div>
  );
}


