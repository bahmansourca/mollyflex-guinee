import Image from "next/image";

type CardProps = { title: string; price: string; img: string; features?: string[] };

function ProductCard({ title, price, img, features = [] }: CardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="relative w-full aspect-[4/3]">
        <Image src={img} alt={title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" unoptimized />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sky-600 font-bold text-xl">{price}</div>
        {features.length > 0 && (
          <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
            {features.map((f) => (<li key={f}>{f}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ProductGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 space-y-6">
      <h2 className="text-2xl font-bold">Nos produits et tarifs</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <ProductCard title="Matelas Mollyflex (23 cm)" price="1.700.000 GNF" img="/products/matelas1.jpg" features={["Fermeté équilibrée", "Mousse haute densité"]} />
        <ProductCard title="Matelas Mollyflex (25 cm)" price="1.800.000 GNF" img="/products/matelas2.jpg" features={["Soutien renforcé", "Ventilation optimisée"]} />
        <ProductCard title="Oreiller Mollyflex" price="140.000 GNF" img="/products/oreiller1.jpg" features={["Confort cervical", "Respirant"]} />
      </div>
    </section>
  );
}


