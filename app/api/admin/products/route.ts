import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { logAudit } from "@/app/lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { id: true, name: true, defaultWholesalePrice: true, isActive: true }, orderBy: { name: "asc" } });
  return new Response(JSON.stringify(products), { headers: { "Content-Type": "application/json" } });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const { id, defaultWholesalePrice } = await request.json();
  if (!id || typeof defaultWholesalePrice !== "number" || defaultWholesalePrice <= 0) return new Response("Invalid payload", { status: 400 });
  const existing = await prisma.product.findUnique({ where: { id } });
  const updated = await prisma.product.update({ where: { id }, data: { defaultWholesalePrice } });
  await logAudit({
    actorId: session.userId!,
    action: "product_price_update",
    entity: "Product",
    entityId: id,
    meta: { oldPrice: existing?.defaultWholesalePrice, newPrice: defaultWholesalePrice },
  });
  return new Response(JSON.stringify(updated), { headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const { name, sku, defaultWholesalePrice } = await request.json();
  if (!name || typeof name !== "string" || name.trim().length < 2) return new Response("Invalid name", { status: 400 });
  if (!sku || typeof sku !== "string" || sku.trim().length < 2) return new Response("Invalid sku", { status: 400 });
  if (typeof defaultWholesalePrice !== "number" || defaultWholesalePrice <= 0) return new Response("Invalid price", { status: 400 });
  const created = await prisma.product.create({ data: { name: name.trim(), sku: sku.trim(), defaultWholesalePrice, isActive: true } });
  await logAudit({
    actorId: session.userId!,
    action: "product_create",
    entity: "Product",
    entityId: created.id,
    meta: { name: created.name, sku: created.sku, defaultWholesalePrice: created.defaultWholesalePrice },
  });
  return new Response(JSON.stringify(created), { headers: { "Content-Type": "application/json" } });
}


