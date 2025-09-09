import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });

  const today = new Date();
  const start7 = new Date(); start7.setDate(today.getDate() - 6); start7.setHours(0,0,0,0);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start7 }, deletedAt: null },
    select: { createdAt: true, totalAmount: true, workerId: true, productId: true, quantity: true, isLoan: true, paymentStatus: true },
  });

  const dayMap = new Map<string, number>();
  const byWorker = new Map<string, number>();
  const byProductAmount = new Map<string, number>();
  const byProductQty = new Map<string, number>();

  let loansCount = 0;
  for (const s of sales) {
    const key = new Date(s.createdAt); key.setHours(0,0,0,0);
    const k = key.toISOString().slice(0,10);
    if (s.isLoan && s.paymentStatus === "PENDING") {
      loansCount++;
      continue;
    }
    dayMap.set(k, (dayMap.get(k) || 0) + s.totalAmount);
    byWorker.set(s.workerId, (byWorker.get(s.workerId) || 0) + s.totalAmount);
    byProductAmount.set(s.productId, (byProductAmount.get(s.productId) || 0) + s.totalAmount);
    byProductQty.set(s.productId, (byProductQty.get(s.productId) || 0) + (s.quantity || 0));
  }

  const workers = await prisma.user.findMany({ where: { id: { in: Array.from(byWorker.keys()) } }, select: { id: true, name: true } });
  const products = await prisma.product.findMany({ where: { id: { in: Array.from(byProductAmount.keys()) } }, select: { id: true, name: true } });

  const seriesDay = Array.from(dayMap.entries()).sort(([a],[b]) => a.localeCompare(b));
  const seriesWorker = workers.map(w => ({ label: w.name, value: byWorker.get(w.id) || 0 }));
  const seriesProduct = products.map(p => ({ label: p.name, value: byProductAmount.get(p.id) || 0, count: byProductQty.get(p.id) || 0 }));

  return new Response(JSON.stringify({ day: seriesDay, byWorker: seriesWorker, byProduct: seriesProduct, loans: loansCount }), { headers: { "Content-Type": "application/json" } });
}


