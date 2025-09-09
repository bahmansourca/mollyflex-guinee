import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ [key: string]: any }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") redirect("/login");

  const sp: any = await searchParams;

  const where: any = {};
  if (sp.action) where.action = { contains: String(sp.action) };
  if (sp.user) where.actor = { OR: [{ name: { contains: String(sp.user) } }, { username: { contains: String(sp.user) } }] };
  if (sp.from && /^\d{4}-\d{2}-\d{2}$/.test(String(sp.from))) {
    where.createdAt = { ...(where.createdAt || {}), gte: new Date(String(sp.from) + "T00:00:00") };
  }
  if (sp.to && /^\d{4}-\d{2}-\d{2}$/.test(String(sp.to))) {
    where.createdAt = { ...(where.createdAt || {}), lte: new Date(String(sp.to) + "T23:59:59") };
  }

  const pageSize = 200;
  const page = Math.max(1, Number(sp.page || 1));
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, username: true } } },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const makeUrl = (params: Record<string, string>) => {
    const qs = new URLSearchParams();
    ["action","user","from","to","page"].forEach((k) => {
      const val = sp[k];
      if (typeof val === "string" && val) qs.set(k, val);
    });
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v); else qs.delete(k);
    });
    return `?${qs.toString()}`;
  };

  const todayISO = new Date().toISOString().slice(0, 10);
  const day7 = new Date(); day7.setDate(day7.getDate() - 6); const day7ISO = day7.toISOString().slice(0, 10);
  const day30 = new Date(); day30.setDate(day30.getDate() - 29); const day30ISO = day30.toISOString().slice(0, 10);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Journal d'activité</h1>
      <form action="/admin/audit" className="grid md:grid-cols-6 gap-2 text-sm items-end">
        <input name="action" defaultValue={sp.action as string | undefined} placeholder="Action" className="border rounded px-3 py-1" />
        <input name="user" defaultValue={sp.user as string | undefined} placeholder="Utilisateur" className="border rounded px-3 py-1" />
        <div>
          <label className="block text-xs mb-1">Depuis</label>
          <input type="date" name="from" defaultValue={sp.from as string | undefined} className="border rounded px-3 py-1 w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Jusqu'au</label>
          <input type="date" name="to" defaultValue={sp.to as string | undefined} className="border rounded px-3 py-1 w-full" />
        </div>
        <input type="hidden" name="page" value="1" />
        <button className="px-3 py-2 rounded bg-black text-white">Filtrer</button>
      </form>
      <div className="flex gap-2 text-xs">
        <a className="px-2 py-1 border rounded" href={makeUrl({ from: todayISO, to: todayISO, page: "1" })}>Aujourd'hui</a>
        <a className="px-2 py-1 border rounded" href={makeUrl({ from: day7ISO, to: todayISO, page: "1" })}>7 jours</a>
        <a className="px-2 py-1 border rounded" href={makeUrl({ from: day30ISO, to: todayISO, page: "1" })}>30 jours</a>
        <a className="px-2 py-1 border rounded" href={makeUrl({ from: "", to: "", page: "1" })}>Tout</a>
      </div>
      <div className="text-xs text-gray-600">{total.toLocaleString()} événements • Page {page} / {totalPages}</div>
      <ul className="divide-y border rounded">
        {logs.map((l) => (
          <li key={l.id} className="p-3 flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-600">{new Date(l.createdAt).toLocaleString()}</div>
              <div className="text-sm">{l.actor?.name || l.actor?.username} — {l.action} — {l.entity} #{l.entityId}</div>
              {l.meta && <pre className="text-xs text-gray-500 whitespace-pre-wrap">{JSON.stringify(l.meta)}</pre>}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 text-sm">
        <a className={`px-3 py-1 border rounded ${page <= 1 ? "opacity-50 pointer-events-none" : ""}`} href={makeUrl({ page: String(page - 1) })}>Précédent</a>
        <a className={`px-3 py-1 border rounded ${page >= totalPages ? "opacity-50 pointer-events-none" : ""}`} href={makeUrl({ page: String(page + 1) })}>Suivant</a>
      </div>
    </div>
  );
}


