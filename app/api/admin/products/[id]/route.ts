import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { logAudit } from "@/app/lib/audit";

export async function DELETE(_request: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const params = (context && typeof context.params?.then === "function") ? await context.params : context.params;
  const id = params?.id as string;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return new Response("Not found", { status: 404 });
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  await logAudit({ actorId: session.userId!, action: "product_deactivate", entity: "Product", entityId: id, meta: { name: existing.name } });
  return new Response(null, { status: 204 });
}


