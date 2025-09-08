import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import PrintButton from "@/app/admin/print/PrintButton";

export default async function AdminPrintPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.role !== "ADMIN") redirect("/login");

  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const [day, perMethod] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: startOfDay }, deletedAt: null } }),
    Promise.all([
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "CASH", createdAt: { gte: startOfDay }, deletedAt: null } }),
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "ORANGE_MONEY", createdAt: { gte: startOfDay }, deletedAt: null } }),
      prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", paymentMethod: "BANK", createdAt: { gte: startOfDay }, deletedAt: null } }),
    ]),
  ]);

  const cash = perMethod[0]._sum.totalAmount || 0;
  const om = perMethod[1]._sum.totalAmount || 0;
  const bank = perMethod[2]._sum.totalAmount || 0;

  return (
    <div className="p-6 print:p-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h1 className="text-2xl font-semibold">Résumé du jour</h1>
          <PrintButton />
        </div>
        <div className="border rounded p-4">
          <div className="text-lg font-medium mb-2">Total journée: {Number(day._sum.totalAmount || 0).toLocaleString()} GNF</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-2 border rounded">Cash: {cash.toLocaleString()} GNF</div>
            <div className="p-2 border rounded">Orange Money: {om.toLocaleString()} GNF</div>
            <div className="p-2 border rounded">Banque: {bank.toLocaleString()} GNF</div>
          </div>
        </div>
        <div className="mt-3 text-sm print:hidden"><a className="underline" href="/admin">Retour</a></div>
      </div>
    </div>
  );
}


