"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function TopNav() {
  const { data } = useSession();
  const role = (data as any)?.role as string | undefined;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  return (
    <header className="p-4 header-blur backdrop-blur border-b relative z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Mollyflex en Guinée" className="w-9 h-9 object-contain" />
        <div className="font-semibold">Mollyflex en Guinée</div>
      </div>
      <div className="flex items-center gap-3 md:hidden">
        <button aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen((v)=>!v)} className="px-3 py-1 border rounded">☰</button>
      </div>
      <nav
        className={
          `text-sm md:flex md:items-center md:gap-4 ` +
          (open
            ? `hidden md:flex`
            : `hidden md:flex`)
        }
      >
        {role === "ADMIN" && (
          <>
            <Link className="underline" href="/admin" onClick={()=>setOpen(false)}>PDG</Link>
            <Link className="underline" href="/admin/container" onClick={()=>setOpen(false)}>Container</Link>
            <Link className="underline" href="/employee" onClick={()=>setOpen(false)}>Espace employé</Link>
          </>
        )}
        {role && (
          <>
            <Link className="underline" href="/employee/sale" onClick={()=>setOpen(false)}>Vente/Emprunt</Link>
            <Link className="underline" href="/employee/sales" onClick={()=>setOpen(false)}>Mes ventes</Link>
            <Link className="underline" href="/employee/loans" onClick={()=>setOpen(false)}>Mes emprunts</Link>
          </>
        )}
        <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }} className="px-3 py-1 border rounded">Se déconnecter</button>
      </nav>
      </div>
      {open && (
        <div className="md:hidden fixed inset-x-0 top-[64px] z-40 bg-white/95 backdrop-blur border-b shadow-lg">
          <div className="max-w-6xl mx-auto p-4 flex flex-col items-start gap-3 text-sm">
            {role === "ADMIN" && (
              <>
                <Link className="underline" href="/admin" onClick={()=>setOpen(false)}>PDG</Link>
                <Link className="underline" href="/admin/container" onClick={()=>setOpen(false)}>Container</Link>
                <Link className="underline" href="/employee" onClick={()=>setOpen(false)}>Espace employé</Link>
              </>
            )}
            {role && (
              <>
                <Link className="underline" href="/employee/sale" onClick={()=>setOpen(false)}>Vente/Emprunt</Link>
                <Link className="underline" href="/employee/sales" onClick={()=>setOpen(false)}>Mes ventes</Link>
                <Link className="underline" href="/employee/loans" onClick={()=>setOpen(false)}>Mes emprunts</Link>
              </>
            )}
            <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }} className="px-3 py-1 border rounded">Se déconnecter</button>
          </div>
        </div>
      )}
    </header>
  );
}


