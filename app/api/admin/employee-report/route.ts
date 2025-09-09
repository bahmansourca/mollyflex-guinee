import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userId = searchParams.get("userId");
  const where: any = { deletedAt: null };
  if (from) where.createdAt = { ...(where.createdAt || {}), gte: new Date(from + "T00:00:00") };
  if (to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(to + "T23:59:59") };
  if (userId) where.workerId = userId;

  const [summary, topProducts, deletions] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true }, _count: { _all: true }, where }),
    prisma.sale.groupBy({ by: ["productId"], _sum: { totalAmount: true, quantity: true }, where, orderBy: { _sum: { totalAmount: "desc" } }, take: 5 }),
    prisma.sale.count({ where: { ...where, deletedAt: { not: null } } as any }),
  ]);

  const productIds = topProducts.map((t) => t.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } });
  const top = topProducts.map((t) => ({ name: products.find((p) => p.id === t.productId)?.name || t.productId, amount: t._sum.totalAmount || 0, count: t._sum.quantity || 0 }));

  return new Response(JSON.stringify({
    total: summary._sum.totalAmount || 0,
    count: summary._count._all || 0,
    topProducts: top,
    deletions,
  }), { headers: { "Content-Type": "application/json" } });
}


