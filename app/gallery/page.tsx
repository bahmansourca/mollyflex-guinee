import Image from "next/image";

const images = [
  "https://images.unsplash.com/photo-1582582494700-17a1a1fbb68e?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2c5cb?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1600&auto=format&fit=crop",
];

export default function GalleryPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Galerie Mollyflex</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((src) => (
          <div key={src} className="relative w-full aspect-square overflow-hidden rounded-lg">
            <Image src={src} alt="Mollyflex" fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
          </div>
        ))}
      </div>
    </div>
  );
}


