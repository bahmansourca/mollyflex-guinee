import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

async function searchDirect(q: string) {
  if (!q) return [] as any[];
  return prisma.customer.findMany({
    where: { OR: [{ name: { contains: q } }, { phone: { contains: q } }] },
    take: 20,
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminClientsPage({ searchParams }: { searchParams: { q?: string } | Promise<{ [key: string]: any }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") redirect("/login");

  const sp: any = (searchParams && typeof (searchParams as any).then === "function") ? await (searchParams as any) : (searchParams || {});
  const q = (sp.q as string) || "";
  const results = q ? await searchDirect(q) : [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <form action="/admin/clients" className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Nom ou téléphone" className="border rounded px-3 py-2" />
        <button className="px-3 py-2 rounded bg-black text-white">Rechercher</button>
      </form>

      {q && (
        <div className="text-sm text-gray-600">Résultats pour: <span className="font-medium">{q}</span></div>
      )}

      <ul className="divide-y border rounded">
        {results.map((c: any) => (
          <li key={c.id} className="p-3">
            <div className="font-medium">{c.name} — {c.phone}</div>
            <a className="text-sm underline" href={`/admin/clients/${c.id}`}>Voir l'historique</a>
          </li>
        ))}
      </ul>
    </div>
  );
}


