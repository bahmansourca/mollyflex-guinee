"use client";
import { useEffect, useState } from "react";

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WORKER");
  const [resetId, setResetId] = useState<string>("");
  const [resetPass, setResetPass] = useState<string>("");

  async function load() {
    const r = await fetch("/api/admin/users");
    if (r.ok) setUsers(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, username, password, role }) });
    if (!r.ok) return alert(await r.text());
    setName(""); setUsername(""); setPassword(""); setRole("WORKER");
    await load();
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetId || !resetPass) return;
    const r = await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: resetId, newPassword: resetPass }) });
    if (!r.ok) return alert(await r.text());
    setResetId(""); setResetPass("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Ajouter un utilisateur</h3>
        <form onSubmit={addUser} className="grid md:grid-cols-4 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom" className="border rounded px-3 py-2" />
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Identifiant" className="border rounded px-3 py-2" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" className="border rounded px-3 py-2" />
          <select value={role} onChange={e=>setRole(e.target.value)} className="border rounded px-3 py-2">
            <option value="WORKER">Employé</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="bg-black text-white px-4 py-2 rounded md:col-span-4">Créer</button>
        </form>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Réinitialiser mot de passe</h3>
        <form onSubmit={resetPassword} className="grid md:grid-cols-3 gap-3">
          <select value={resetId} onChange={e=>setResetId(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Choisir un utilisateur…</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input value={resetPass} onChange={e=>setResetPass(e.target.value)} placeholder="Nouveau mot de passe" className="border rounded px-3 py-2" />
          <button className="bg-black text-white px-4 py-2 rounded">Mettre à jour</button>
        </form>
      </div>
    </div>
  );
}


