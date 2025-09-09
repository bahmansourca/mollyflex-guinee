import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(_request: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const params = (context && typeof context.params?.then === "function") ? await context.params : context.params;
  const id = params.id;
  const container = await prisma.container.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      note: true,
      items: { select: { id: true, productId: true, quantity: true, product: { select: { name: true } } } },
    },
  });
  if (!container) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(container), { headers: { "Content-Type": "application/json" } });
}

export async function PUT(request: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const params = (context && typeof context.params?.then === "function") ? await context.params : context.params;
  const id = params.id;
  const body = await request.json();
  const items: Array<{ id?: string; productId: string; quantity: number }> = body?.items;
  if (!Array.isArray(items)) return new Response("Invalid items", { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.container.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new Error("NOT_FOUND");

    // Index existing items by productId
    const byProduct = new Map(existing.items.map((i) => [i.productId, i] as const));

    // For each incoming item, compute diff vs existing quantity
    for (const incoming of items) {
      const old = byProduct.get(incoming.productId);
      const oldQty = old ? old.quantity : 0;
      const newQty = Number(incoming.quantity || 0);
      const delta = newQty - oldQty; // positive = add stock, negative = remove stock

      if (old) {
        await tx.containerItem.update({ where: { id: old.id }, data: { quantity: newQty } });
      } else {
        await tx.containerItem.create({ data: { containerId: id, productId: incoming.productId, quantity: newQty } });
      }

      if (delta !== 0) {
        await tx.stockMovement.create({
          data: {
            type: delta > 0 ? "IN" : "OUT",
            productId: incoming.productId,
            quantity: Math.abs(delta),
            createdById: session.userId!,
            containerId: id,
            note: "Container edit",
          },
        });
      }
      byProduct.delete(incoming.productId);
    }

    // For any remaining existing items not present anymore, treat as quantity 0 (remove all)
    for (const leftover of byProduct.values()) {
      if (leftover.quantity > 0) {
        await tx.containerItem.update({ where: { id: leftover.id }, data: { quantity: 0 } });
        await tx.stockMovement.create({
          data: {
            type: "OUT",
            productId: leftover.productId,
            quantity: leftover.quantity,
            createdById: session.userId!,
            containerId: id,
            note: "Container edit (remove)",
          },
        });
      }
    }

    return { ok: true };
  });

  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
}


