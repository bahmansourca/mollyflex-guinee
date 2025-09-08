import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "day"; // day|week|month|all

  const now = new Date();
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const startOfWeek = new Date(); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

  let from: Date | undefined = undefined;
  if (range === "day") from = startOfDay;
  else if (range === "week") from = startOfWeek;
  else if (range === "month") from = startOfMonth;

  const where: any = { deletedAt: null };
  if (from) where.createdAt = { gte: from };

  const sales = await prisma.sale.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      customerName: true,
      customerPhone: true,
      totalAmount: true,
      isLoan: true,
      paymentStatus: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const header = ["id","date","customer","phone","amount","type","status"];
  const rows = sales.map((s) => [
    s.id,
    new Date(s.createdAt).toISOString(),
    s.customerName,
    s.customerPhone,
    String(s.totalAmount),
    s.isLoan ? "loan" : "sale",
    s.paymentStatus,
  ]);

  const content = [header, ...rows].map((r) => r.map((v) => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales_${range}.csv"`,
    },
  });
}


