import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
  const list = await prisma.customer.findMany({
    where: { OR: [{ name: { contains: q } }, { phone: { contains: q } }] },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  return new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });
  const { name, phone } = await request.json();
  if (!name || !phone) return new Response("Missing fields", { status: 400 });
  const c = await prisma.customer.upsert({
    where: { phone },
    update: { name },
    create: { name, phone },
  });
  return new Response(JSON.stringify(c), { headers: { "Content-Type": "application/json" } });
}


