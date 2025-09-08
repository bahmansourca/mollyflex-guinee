import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const containers = await prisma.container.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      note: true,
      items: { select: { quantity: true } },
      stockMovements: { select: { createdAt: true } },
    },
    take: 20,
  });
  const data = containers.map(c => ({
    id: c.id,
    createdAt: c.createdAt,
    note: c.note,
    totalQty: c.items.reduce((s, i) => s + i.quantity, 0),
    lastEditedAt: c.stockMovements.reduce((m, s) => !m || s.createdAt > m ? s.createdAt : m, c.createdAt),
  }));
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const body = await request.json();
  const { note, items } = body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    return new Response("Items required", { status: 400 });
  }

  // Validate products
  const productIds: string[] = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) return new Response("Invalid product", { status: 400 });

  const created = await prisma.$transaction(async (tx) => {
    const container = await tx.container.create({
      data: { createdById: session.userId!, note: note || null },
    });

    for (const it of items) {
      await tx.containerItem.create({
        data: { containerId: container.id, productId: it.productId, quantity: Number(it.quantity || 0) },
      });
      await tx.stockMovement.create({
        data: {
          type: "IN",
          productId: it.productId,
          quantity: Number(it.quantity || 0),
          createdById: session.userId!,
          containerId: container.id,
          note: "Container intake",
        },
      });
    }

    return container;
  });

  return new Response(JSON.stringify({ ok: true, id: created.id }), { headers: { "Content-Type": "application/json" } });
}
