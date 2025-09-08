import { prisma } from "@/app/lib/prisma";
import { logAudit } from "@/app/lib/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (!session.role || (session.role !== "WORKER" && session.role !== "ADMIN"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await request.json();
  const { productId, quantity, customerName, customerPhone, paymentMethod, priceMode, unitPrice, isLoan } = body ?? {};

  if (!productId || !quantity || !customerName || !customerPhone || !priceMode) {
    return new Response("Missing fields", { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return new Response("Product not found", { status: 404 });

  const finalUnitPrice = priceMode === "WHOLESALE_FIXED" ? product.defaultWholesalePrice : Number(unitPrice || 0);
  if (!finalUnitPrice || finalUnitPrice <= 0) return new Response("Invalid price", { status: 400 });

  const totalAmount = finalUnitPrice * Number(quantity);

  try {
  const sale = await prisma.$transaction(async (tx) => {
    // Compute available stock: IN - OUT for this product
    const grouped = await tx.stockMovement.groupBy({ by: ["type"], where: { productId }, _sum: { quantity: true } });
    const inQty = grouped.find(g => g.type === "IN")?._sum.quantity || 0;
    const outQty = grouped.find(g => g.type === "OUT")?._sum.quantity || 0;
    const available = inQty - outQty;
    if (Number(quantity) > available) {
      throw new Error(`Stock insuffisant. Disponible: ${available}`);
    }
    // Attach or create customer by phone
    let customerId: string | undefined = undefined;
    try {
      const existing = await tx.customer.findUnique({ where: { phone: customerPhone } });
      if (existing) customerId = existing.id;
      else {
        const created = await tx.customer.create({ data: { name: customerName, phone: customerPhone } });
        customerId = created.id;
      }
    } catch {}
    const createdSale = await tx.sale.create({
      data: {
        productId,
        quantity: Number(quantity),
        unitPrice: finalUnitPrice,
        totalAmount,
        priceMode,
        paymentMethod: isLoan ? null : paymentMethod,
        paymentStatus: isLoan ? "PENDING" : "PAID",
        isLoan: Boolean(isLoan),
        workerId: session.userId!,
        customerName,
        customerPhone,
        customerId,
      },
    });

    await tx.stockMovement.create({
      data: {
        type: "OUT",
        productId,
        quantity: Number(quantity),
        createdById: session.userId!,
        saleId: createdSale.id,
        note: isLoan ? "Loan (pending)" : "Sale",
      },
    });

    return createdSale;
  });

  await logAudit({ actorId: session.userId!, action: "sale_create", entity: "Sale", entityId: sale.id, meta: { amount: sale.totalAmount, isLoan } });
  return new Response(JSON.stringify({ ok: true, id: sale.id }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : 'Error';
    return new Response(msg, { status: 400 });
  }
}
