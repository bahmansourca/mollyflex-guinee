import Hero from "@/app/components/Hero";
import ProductGrid from "@/app/components/ProductGrid";
import FeaturedProducts from "@/app/components/FeaturedProducts";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-violet">
      <Hero />
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        <div className="glass-card hover-lift p-6 fade-in">
          <div className="mb-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-600">
              <path d="M3 10h18M5 10V7l7-4 7 4v3M6 10v9m12-9v9M9 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-xl font-bold mb-1">Mollyflex Guinée</div>
          <div className="text-sm text-slate-600">Conakry</div>
          <div className="mt-4 text-sm">PDG: Thierno Sadou Bah</div>
          <div className="text-sm">Tél: +224 622 53 82 85</div>
        </div>
        <div className="glass-card hover-lift p-6 fade-in">
          <div className="mb-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-600">
              <path d="M12 3l2.4 4.86L20 9.27l-4 3.9.94 5.48L12 16.9l-4.94 1.75L8 13.17l-4-3.9 5.6-1.41L12 3z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
          </div>
          <div className="text-xl font-semibold mb-2">Qualité italienne</div>
          <p className="text-sm text-slate-600">Matelas hypoallergéniques, durables et respirants pour un sommeil parfait.</p>
        </div>
        <div className="glass-card hover-lift p-6 fade-in">
          <div className="mb-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-600">
              <path d="M3 12l4-4 5 5 5-5 4 4-6 6a3 3 0 01-4.24 0L3 12z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-xl font-semibold mb-2">Service professionnel</div>
          <p className="text-sm text-slate-600">Conseil dédié, vente gros/détail et suivi client premium.</p>
        </div>
      </section>
      <FeaturedProducts />
      <ProductGrid />
      <Footer />
    </div>
  );
}
