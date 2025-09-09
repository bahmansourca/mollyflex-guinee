import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import AdminLoansClient from "@/app/admin/AdminLoansClient";
import ExportButtons from "@/app/admin/ExportButtons";
import Link from "next/link";
import AdminCharts from "@/app/admin/AdminCharts";
import AdminUsersPanel from "@/app/admin/AdminUsersPanel";
import AdminWithdrawalsPanel from "@/app/admin/AdminWithdrawalsPanel";

async function getData() {
  // Stock per product = IN - OUT
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { id: true, name: true } });
  const movements = await prisma.stockMovement.groupBy({ by: ["productId", "type"], _sum: { quantity: true } });
  const stockMap = new Map<string, number>();
  for (const p of products) stockMap.set(p.id, 0);
  for (const m of movements) {
    const sign = m.type === "IN" ? 1 : -1;
    stockMap.set(m.productId, (stockMap.get(m.productId) || 0) + sign * (m._sum.quantity || 0));
  }

  // Sales summaries
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); startOfWeek.setHours(0,0,0,0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

  const [day, week, month] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfDay }, paymentStatus: "PAID", deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfWeek }, paymentStatus: "PAID", deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfMonth }, paymentStatus: "PAID", deletedAt: null } }),
  ]);

  const loans = await prisma.sale.findMany({ where: { isLoan: true, paymentStatus: "PENDING", deletedAt: null }, select: { id: true, customerName: true, customerPhone: true, totalAmount: true, createdAt: true } });
  const [cashPaid, omPaid, bankPaid, withdrawals] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "CASH", deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "ORANGE_MONEY", deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "BANK", deletedAt: null } }),
    prisma.withdrawal.groupBy({ by: ["method"], _sum: { amount: true } }),
  ]);
  const todayByMethod = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "CASH", createdAt: { gte: startOfDay }, deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "ORANGE_MONEY", createdAt: { gte: startOfDay }, deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "BANK", createdAt: { gte: startOfDay }, deletedAt: null } }),
  ]);

  const perWorker = await prisma.sale.groupBy({ by: ["workerId"], where: { paymentStatus: "PAID", deletedAt: null }, _sum: { totalAmount: true }, _count: { _all: true } });
  const loansByWorker = await prisma.sale.groupBy({ by: ["workerId"], where: { isLoan: true, paymentStatus: "PENDING", deletedAt: null }, _count: { _all: true } });
  const workers = await prisma.user.findMany({ where: { id: { in: perWorker.map((w) => w.workerId) } }, select: { id: true, name: true } });

  const recent = await prisma.sale.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    where: { deletedAt: null },
    select: { id: true, createdAt: true, totalAmount: true, quantity: true, customerName: true, isLoan: true, paymentStatus: true, paymentMethod: true, product: { select: { name: true } }, worker: { select: { name: true } } },
  });

  // Low stock alert threshold
  const LOW_STOCK_THRESHOLD = 5;

  const wMap = new Map<string, number>();
  for (const w of withdrawals) wMap.set(w.method as string, (w._sum.amount || 0));

  return {
    stock: products.map((p) => ({ name: p.name, quantity: stockMap.get(p.id) || 0 })),
    lowStock: products
      .map((p) => ({ name: p.name, quantity: stockMap.get(p.id) || 0 }))
      .filter((s) => s.quantity <= LOW_STOCK_THRESHOLD),
    sales: {
      day: day._sum.totalAmount || 0,
      week: week._sum.totalAmount || 0,
      month: month._sum.totalAmount || 0,
    },
    loans,
    cashTotal: (cashPaid._sum.totalAmount || 0) - (wMap.get('CASH') || 0),
    paymentBreakdown: {
      cash: (cashPaid._sum.totalAmount || 0) - (wMap.get('CASH') || 0),
      orangeMoney: (omPaid._sum.totalAmount || 0) - (wMap.get('ORANGE_MONEY') || 0),
      bank: (bankPaid._sum.totalAmount || 0) - (wMap.get('BANK') || 0)
    },
    todayByMethod: { cash: todayByMethod[0]._sum.totalAmount || 0, orangeMoney: todayByMethod[1]._sum.totalAmount || 0, bank: todayByMethod[2]._sum.totalAmount || 0 },
    perWorker: perWorker.map((w) => ({
      workerName: workers.find((u) => u.id === w.workerId)?.name || "",
      amount: w._sum.totalAmount || 0,
      count: w._count._all || 0,
      loans: loansByWorker.find((l) => l.workerId === w.workerId)?._count._all || 0,
    })),
    recent,
  };
}

export default async function AdminHome() {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") redirect("/login");

  const data = await getData();

  return (
    <div className="min-h-screen bg-gradient-violet relative p-8">
      <div className="relative space-y-8">
      <h1 className="title-hero">Tableau de bord (PDG)</h1>

      <section>
        <h2 className="font-semibold mb-2">Indicateurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="glass-card hover-lift p-6 flex items-center gap-4 slide-up">
            <div className="text-2xl">📦</div>
            <div>
              <div className="kpi-label">Produits suivis</div>
              <div className="kpi-value">{data.stock.length}</div>
            </div>
          </div>
          <div className="glass-card hover-lift p-6 flex items-center gap-4 slide-up">
            <div className="text-2xl">💰</div>
            <div>
              <div className="kpi-label">Ventes du jour</div>
              <div className="kpi-value">{data.sales.day.toLocaleString()} GNF</div>
            </div>
          </div>
          <div className="glass-card hover-lift p-6 flex items-center gap-4 slide-up">
            <div className="text-2xl">🧾</div>
            <div>
              <div className="kpi-label">Montant en caisse (cash)</div>
              <div className="kpi-value">{data.cashTotal.toLocaleString()} GNF</div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-2">Stock restant</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.stock.map((s) => (
              <li key={s.name} className="flex justify-between"><span>{s.name}</span><span className="font-medium">{s.quantity}</span></li>
            ))}
          </ul>
        </div>
        {data.lowStock.length > 0 && (
          <div className="mt-3 glass-card p-4">
            <div className="font-semibold mb-1">Alertes stock faible</div>
            <ul className="list-disc pl-5 opacity-90">
              {data.lowStock.map((s) => (
                <li key={s.name}>{s.name}: {s.quantity}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Ventes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div className="glass-card p-4">Jour: <span className="font-medium">{data.sales.day.toLocaleString()} GNF</span></div>
          <div className="glass-card p-4">Semaine: <span className="font-medium">{data.sales.week.toLocaleString()} GNF</span></div>
          <div className="glass-card p-4">Mois: <span className="font-medium">{data.sales.month.toLocaleString()} GNF</span></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
          <div className="glass-card p-3">Aujourd'hui — Cash: {data.todayByMethod.cash.toLocaleString()} GNF</div>
          <div className="glass-card p-3">Aujourd'hui — OM: {data.todayByMethod.orangeMoney.toLocaleString()} GNF</div>
          <div className="glass-card p-3">Aujourd'hui — Banque: {data.todayByMethod.bank.toLocaleString()} GNF</div>
        </div>
        <ExportButtons />
        <div className="mt-3 text-sm space-x-3">
          <Link href="/admin/audit" className="underline">Voir le journal d'activité</Link>
          <Link href="/admin/print" className="underline">Imprimer le résumé</Link>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Utilisateurs</h2>
        <div className="glass-card p-4">
          <AdminUsersPanel />
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Graphiques</h2>
        <div className="glass-card p-4">
          <AdminCharts />
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Ventes par employé</h2>
        <ul className="space-y-1">
          {data.perWorker.map((w) => (
            <li key={w.workerName}>{w.workerName}: {w.count} ventes — {w.amount.toLocaleString()} GNF · {w.loans} emprunt(s)</li>
          ))}
        </ul>
        <div className="mt-2 text-sm space-x-3">
          <a href="/admin/clients" className="underline">Gestion des clients</a>
          <a href="/admin/products" className="underline">Prix de gros</a>
          <a href="/admin/employee-report" className="underline">Rapport employé</a>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Ventes récentes</h2>
        <ul className="divide-y soft-divider glass-card">
          {data.recent.map((s) => (
            <li key={s.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">{new Date(s.createdAt).toLocaleString()}</div>
                <div className="font-medium">{s.customerName}</div>
                <div className="text-xs opacity-70">{s.product?.name || ''} {s.quantity ? `(${s.quantity})` : ''}</div>
                <div className="text-xs opacity-70">Vendu par: {s.worker?.name || "-"}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{s.totalAmount.toLocaleString()} GNF</div>
                <div className="text-xs opacity-70">{s.isLoan ? `Emprunt (${s.paymentStatus})` : `Payé (${s.paymentMethod || '-'})`}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Emprunts en cours</h2>
        <div className="glass-card p-4">
          <AdminLoansClient />
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Montant total en caisse</h2>
        <div className="glass-card p-4 text-lg">{data.cashTotal.toLocaleString()} GNF</div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
          <div className="glass-card p-3">Cash: {data.paymentBreakdown.cash.toLocaleString()} GNF</div>
          <div className="glass-card p-3">Orange Money: {data.paymentBreakdown.orangeMoney.toLocaleString()} GNF</div>
          <div className="glass-card p-3">Banque: {data.paymentBreakdown.bank.toLocaleString()} GNF</div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Retraits</h2>
        <div className="glass-card p-4">
          <AdminWithdrawalsPanel />
        </div>
      </section>
      </div>
    </div>
  );
}


