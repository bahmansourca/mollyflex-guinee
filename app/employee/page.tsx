import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EmployeeHome() {
  const session = await getServerSession(authOptions);
  if (!session || (session.role !== "WORKER" && session.role !== "ADMIN")) redirect("/login");
  const bg = session.role === "ADMIN" ? "/banners/employee-pdg.jpg" : "/banners/employee.jpg";
  return (
    <div className="min-h-screen relative p-6" style={{ backgroundImage: `url('${bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Espace employé</h1>
        <p className="text-gray-600">Actions rapides</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/employee/sale" className="card p-6 flex items-center gap-4 hover:shadow slide-up">
          <div className="text-3xl">🛒</div>
          <div>
            <div className="font-semibold">Nouvelle vente / emprunt</div>
            <div className="text-sm text-slate-600">Enregistrer une opération</div>
          </div>
        </Link>
        <Link href="/employee/sales" className="card p-6 flex items-center gap-4 hover:shadow slide-up">
          <div className="text-3xl">🕒</div>
          <div>
            <div className="font-semibold">Historique</div>
            <div className="text-sm text-slate-600">Mes ventes récentes</div>
          </div>
        </Link>
        <Link href="/employee/loans" className="card p-6 flex items-center gap-4 hover:shadow slide-up">
          <div className="text-3xl">📥</div>
          <div>
            <div className="font-semibold">Emprunts</div>
            <div className="text-sm text-slate-600">En attente de règlement</div>
          </div>
        </Link>
      </div>
      </div>
    </div>
  );
}


