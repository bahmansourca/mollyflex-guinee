import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.role !== "ADMIN") return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return new Response("id required", { status: 400 });

  const c = await prisma.customer.findUnique({ where: { id } });
  if (!c) return new Response("Not found", { status: 404 });

  const sales = await prisma.sale.findMany({
    where: { customerId: id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const header = ["id","date","amount","type","status"];
  const rows = sales.map((s) => [
    s.id,
    new Date(s.createdAt).toISOString(),
    String(s.totalAmount),
    s.isLoan ? "loan" : "sale",
    s.paymentStatus,
  ]);
  const content = [header, ...rows].map((r) => r.map((v) => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customer_${c.phone || c.name}.csv"`,
    },
  });
}


