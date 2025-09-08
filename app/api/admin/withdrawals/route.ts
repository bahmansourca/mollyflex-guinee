import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  // If balances=true, return available funds per method
  const url = new URL(request.url);
  if (url.searchParams.get("balances") === "true") {
    const [cashPaid, omPaid, bankPaid, withdrawals] = await Promise.all([
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "CASH", deletedAt: null } }),
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "ORANGE_MONEY", deletedAt: null } }),
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "BANK", deletedAt: null } }),
      prisma.withdrawal.groupBy({ by: ["method"], _sum: { amount: true } }),
    ]);
    const wMap = new Map<string, number>();
    for (const w of withdrawals) wMap.set(w.method as string, (w._sum.amount || 0));
    const balances = {
      CASH: (cashPaid._sum.totalAmount || 0) - (wMap.get("CASH") || 0),
      ORANGE_MONEY: (omPaid._sum.totalAmount || 0) - (wMap.get("ORANGE_MONEY") || 0),
      BANK: (bankPaid._sum.totalAmount || 0) - (wMap.get("BANK") || 0),
    };
    return new Response(JSON.stringify(balances), { headers: { "Content-Type": "application/json" } });
  }

  const list = await prisma.withdrawal.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, createdAt: true, method: true, amount: true, note: true, createdBy: { select: { name: true } } } });
  return new Response(JSON.stringify(list), { headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });
  const { method, amount, note } = await request.json();
  if (!method || !["CASH","ORANGE_MONEY","BANK"].includes(method)) return new Response("Invalid method", { status: 400 });
  if (!amount || amount <= 0) return new Response("Invalid amount", { status: 400 });
  // Compute available funds for the chosen method: paid sales minus withdrawals
  const paid = await prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: method, deletedAt: null } });
  const withdrawn = await prisma.withdrawal.aggregate({ _sum: { amount: true }, where: { method } });
  const available = (paid._sum.totalAmount || 0) - (withdrawn._sum.amount || 0);
  if (available <= 0) return new Response("Insufficient funds", { status: 400 });
  if (Number(amount) > available) return new Response(`Amount exceeds available funds (${available})`, { status: 400 });

  const w = await prisma.withdrawal.create({ data: { method, amount: Number(amount), note: note || null, createdById: session.userId! } });
  return new Response(JSON.stringify({ id: w.id }), { headers: { "Content-Type": "application/json" } });
}


