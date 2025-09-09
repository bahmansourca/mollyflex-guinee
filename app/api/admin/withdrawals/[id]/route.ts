import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(_request: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const params = (context && typeof context.params?.then === "function") ? await context.params : context.params;
  const id = params?.id as string;
  if (!id) return new Response("Missing id", { status: 400 });
  const existing = await prisma.withdrawal.findUnique({ where: { id } });
  if (!existing) return new Response("Not found", { status: 404 });
  await prisma.withdrawal.delete({ where: { id } });
  return new Response(null, { status: 204 });
}


