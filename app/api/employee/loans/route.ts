import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });
  const loans = await prisma.sale.findMany({
    where: { workerId: session.userId, isLoan: true, paymentStatus: "PENDING" },
    select: { id: true, createdAt: true, customerName: true, customerPhone: true, totalAmount: true },
    orderBy: { createdAt: "desc" },
  });
  return new Response(JSON.stringify(loans), { headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });
  const body = await request.json();
  const { saleId, method } = body ?? {};
  if (!saleId) return new Response("saleId required", { status: 400 });
  if (!method || !["CASH","ORANGE_MONEY","BANK"].includes(method)) return new Response("method invalid", { status: 400 });

  const sale = await prisma.sale.findFirst({ where: { id: saleId, ...(session.role === "ADMIN" ? {} : { workerId: session.userId }) } });
  if (!sale) return new Response("Not found", { status: 404 });

  await prisma.sale.update({ where: { id: saleId }, data: { paymentStatus: "PAID", paymentMethod: method } });

  // Optional audit log
  try {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "loan_settle",
        entity: "Sale",
        entityId: saleId,
        meta: { method },
      },
    });
  } catch {}

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
