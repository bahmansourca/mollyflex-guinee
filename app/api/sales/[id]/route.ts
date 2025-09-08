import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { logAudit } from "@/app/lib/audit";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) return new Response("Not found", { status: 404 });

  // Allow workers and admins. Workers can only delete their own sales.
  if (session.role !== "ADMIN" && sale.workerId !== session.userId) {
    return new Response("Forbidden", { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    // Soft delete sale
    await tx.sale.update({ where: { id: sale.id }, data: { deletedAt: new Date(), deletedById: session.userId! } });
    // Reverse stock movement
    await tx.stockMovement.create({
      data: {
        type: "IN",
        productId: sale.productId,
        quantity: sale.quantity,
        createdById: session.userId!,
        saleId: sale.id,
        note: "Reversal after delete",
      },
    });
  });

  await logAudit({ actorId: session.userId!, action: "sale_delete", entity: "Sale", entityId: sale.id, meta: { quantity: sale.quantity, productId: sale.productId } });
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}


