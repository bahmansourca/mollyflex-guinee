import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });

  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); startOfWeek.setHours(0,0,0,0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

  const [daySales, weekSales, monthSales, dayLoans, weekLoans, monthLoans] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true }, _count: { _all: true }, where: { workerId: session.userId, createdAt: { gte: startOfDay }, paymentStatus: "PAID", deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, _count: { _all: true }, where: { workerId: session.userId, createdAt: { gte: startOfWeek }, paymentStatus: "PAID", deletedAt: null } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, _count: { _all: true }, where: { workerId: session.userId, createdAt: { gte: startOfMonth }, paymentStatus: "PAID", deletedAt: null } }),
    prisma.sale.aggregate({ _count: { _all: true }, where: { workerId: session.userId, createdAt: { gte: startOfDay }, isLoan: true, paymentStatus: "PENDING", deletedAt: null } }),
    prisma.sale.aggregate({ _count: { _all: true }, where: { workerId: session.userId, createdAt: { gte: startOfWeek }, isLoan: true, paymentStatus: "PENDING", deletedAt: null } }),
    prisma.sale.aggregate({ _count: { _all: true }, where: { workerId: session.userId, createdAt: { gte: startOfMonth }, isLoan: true, paymentStatus: "PENDING", deletedAt: null } }),
  ]);

  return new Response(JSON.stringify({
    day: { amount: daySales._sum.totalAmount || 0, count: daySales._count._all || 0, loans: dayLoans._count._all || 0 },
    week: { amount: weekSales._sum.totalAmount || 0, count: weekSales._count._all || 0, loans: weekLoans._count._all || 0 },
    month: { amount: monthSales._sum.totalAmount || 0, count: monthSales._count._all || 0, loans: monthLoans._count._all || 0 },
  }), { headers: { "Content-Type": "application/json" } });
}
