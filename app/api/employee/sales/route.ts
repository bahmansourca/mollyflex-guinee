import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const where: any = { workerId: session.userId, deletedAt: null };
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    const d = new Date(from + "T00:00:00");
    if (!Number.isNaN(d.getTime())) {
      where.createdAt = { gte: d };
    }
  }

  const sales = await prisma.sale.findMany({
    where,
    select: { id: true, createdAt: true, customerName: true, totalAmount: true, isLoan: true, paymentStatus: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return new Response(JSON.stringify(sales), { headers: { "Content-Type": "application/json" } });
}
