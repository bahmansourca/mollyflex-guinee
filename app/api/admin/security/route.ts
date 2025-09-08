import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true, username: true } });
  return new Response(JSON.stringify({ admin }), { headers: { "Content-Type": "application/json" } });
}


