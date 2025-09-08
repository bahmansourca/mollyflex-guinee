"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 to-white" />
      {/* Full-width top banner card */}
      <div className="w-full px-0">
        <div className="relative overflow-hidden min-h-[280px] md:min-h-[380px] slide-up">
          <img src="/banners/store.jpg" alt="Vitrine Mollyflex" className="absolute inset-0 w-full h-full object-cover kenburns" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="relative max-w-6xl mx-auto px-6 py-10 flex flex-col justify-end h-full">
            <div className="text-[13px] tracking-widest text-amber-300 font-semibold mb-2">Mollyflex</div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-2 text-white">MOLLYFLEX EN GUINÉE</h1>
            <p className="text-white/90 mb-4 text-lg">Confort haut de gamme</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary">Espace entreprise</Link>
              <Link href="/gallery" className="btn-ghost">Voir la galerie</Link>
            </div>
          </div>
        </div>
      </div>
      {/* Below: PDG block aligned right */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/pdg.jpg"
              alt="PDG Mollyflex Guinée"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="self-center">
            <div className="text-2xl md:text-3xl font-bold">Thierno Sadou Bah</div>
            <div className="text-amber-600 font-semibold mb-3">PDG</div>
            <p className="text-slate-600">Direction et stratégie — Mollyflex Guinée.</p>
            <p className="text-slate-600">Tél: +224 622 53 82 85</p>
          </div>
        </div>
      </div>
    </section>
  );
}


