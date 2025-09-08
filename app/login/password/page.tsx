"use client";
import React, { useState } from "react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!r.ok) {
      const t = await r.text();
      setMsg(t || "Erreur");
      return;
    }
    setMsg("Mot de passe modifié");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
        <h1 className="text-xl font-semibold text-center">Changer le mot de passe</h1>
        {msg && <p className="text-center text-sm">{msg}</p>}
        <div>
          <label className="block text-sm mb-1">Mot de passe actuel</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nouveau mot de passe</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="w-full bg-black text-white rounded py-2">Enregistrer</button>
        <div className="text-center text-sm"><a href="/login" className="underline">Retour</a></div>
      </form>
    </div>
  );
}
