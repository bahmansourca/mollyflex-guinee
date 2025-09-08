import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { logAudit } from "@/app/lib/audit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return new Response("Invalid payload", { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return new Response("Not found", { status: 404 });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return new Response("Invalid current password", { status: 400 });

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
  await logAudit({ actorId: user.id, action: "change_password", entity: "User", entityId: user.id });
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}


