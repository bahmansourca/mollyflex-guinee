import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, defaultWholesalePrice: true },
    orderBy: { name: "asc" },
  });
  return new Response(JSON.stringify(products), { headers: { "Content-Type": "application/json" } });
}
