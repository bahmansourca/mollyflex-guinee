import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const loans = await prisma.sale.findMany({
    where: { isLoan: true, paymentStatus: "PENDING" },
    select: { id: true, createdAt: true, totalAmount: true, customerName: true, customerPhone: true, workerId: true },
    orderBy: { createdAt: "desc" },
  });
  return new Response(JSON.stringify(loans), { headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const { saleId } = await request.json();
  if (!saleId) return new Response("saleId required", { status: 400 });
  await prisma.sale.update({ where: { id: saleId }, data: { paymentStatus: "PAID" } });
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
