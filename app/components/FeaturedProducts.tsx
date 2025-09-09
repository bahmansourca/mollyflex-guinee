"use client";
import Image from "next/image";

const ITEMS = [
  { src: "/pdg.jpg", title: "Thierno Sadou Bah (PDG)", desc: "Direction générale et développement." },
  { src: "/staff/employeeibrahim.jpg", title: "Ibrahim Diallo", desc: "Conseil et service client." },
  { src: "/staff/employeealiou.jpg", title: "Aliou Bah", desc: "Support ventes et logistique." },
];

export default function FeaturedProducts() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-12 grid md:grid-cols-3 gap-6">
      {ITEMS.map((it) => (
        <div key={it.title} className="glass-card hover-lift overflow-hidden">
          <div className="relative w-full h-72 bg-white">
            <Image src={it.src} alt={it.title} fill className="object-contain object-top p-2" unoptimized />
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


