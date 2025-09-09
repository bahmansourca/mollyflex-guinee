import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

async function loadDirect(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id }, select: { id: true, name: true, phone: true } });
  if (!customer) return { customer: { name: "Inconnu", phone: "" }, sales: [] as any[] };
  const sales = await prisma.sale.findMany({
    where: { customerId: id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, totalAmount: true, isLoan: true, paymentStatus: true },
  });
  return { customer, sales };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const data = await loadDirect(id);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{data.customer.name} — {data.customer.phone}</h1>
      <div>
        <a className="text-sm underline" href={`/api/admin/export-customer?id=${id}`}>Exporter CSV</a>
      </div>
      <h2 className="font-semibold">Historique</h2>
      <ul className="divide-y border rounded">
        {data.sales.map((s: any) => (
          <li key={s.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">{new Date(s.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{(s.totalAmount).toLocaleString()} GNF</div>
              <div className="text-xs text-gray-500">{s.isLoan ? `Emprunt (${s.paymentStatus})` : "Payé"}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-sm"><a href="/admin/clients" className="underline">Retour</a></div>
    </div>
  );
}


