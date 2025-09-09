"use client";
import Image from "next/image";

const ITEMS = [
  { src: "/products/matelas1.JPG", title: "Matelas Premium", desc: "Soutien ferme, accueil moelleux." },
  { src: "/products/matelas2.JPG", title: "Matelas Confort", desc: "Respirant, anti-allergies." },
  { src: "/products/oreiller1.JPG", title: "Oreiller Mémoire", desc: "Ergonomique, nuque détendue." },
];

export default function FeaturedProducts() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-12 grid md:grid-cols-3 gap-6">
      {ITEMS.map((it) => (
        <div key={it.title} className="glass-card hover-lift overflow-hidden">
          <div className="relative w-full h-48">
            <Image src={it.src} alt={it.title} fill className="object-cover" unoptimized />
          </div>
          <div className="p-4">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-80">{it.desc}</div>
          </div>
        </div>
      ))}
    </section>
  );
}


