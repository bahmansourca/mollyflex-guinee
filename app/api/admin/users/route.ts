import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const users = await prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return new Response(JSON.stringify(users), { headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const { name, username, password, role } = await request.json();
  if (!name || !username || !password) return new Response("Missing fields", { status: 400 });
  const bcrypt = await import("bcrypt");
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { name, username, passwordHash, role: role === 'ADMIN' ? 'ADMIN' : 'WORKER' } });
    return new Response(JSON.stringify({ id: user.id }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(e?.message || "Error", { status: 400 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const { userId, newPassword, newRole } = await request.json();
  if (!userId) return new Response("userId required", { status: 400 });
  const data: any = {};
  if (newPassword) {
    const bcrypt = await import("bcrypt");
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }
  if (newRole) data.role = newRole;
  await prisma.user.update({ where: { id: userId }, data });
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}


