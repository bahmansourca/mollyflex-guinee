import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });
  const c = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!c) return new Response("Not found", { status: 404 });
  const sales = await prisma.sale.findMany({
    where: { customerId: c.id, deletedAt: null },
    select: { id: true, createdAt: true, totalAmount: true, isLoan: true, paymentStatus: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return new Response(JSON.stringify({ customer: c, sales }), { headers: { "Content-Type": "application/json" } });
}


