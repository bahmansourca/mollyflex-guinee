"use client";
import { useEffect, useState } from "react";

const IMAGES = [
  "/banners/store.jpg",
];

export default function BannerCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % IMAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-[38vh] md:h-[52vh] overflow-hidden rounded-b-2xl">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === idx ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute bottom-6 left-6 text-white">
        <div className="text-sm tracking-widest text-amber-300">MOLLYFLEX EN GUINÉE</div>
        <h2 className="text-2xl md:text-4xl font-extrabold">Confort haut de gamme</h2>
      </div>
    </div>
  );
}


