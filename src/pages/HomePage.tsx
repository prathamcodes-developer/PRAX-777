import React from 'react';
import { ArrowRight, Sparkles, Shield, Award, ChevronRight, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { products, loadingProducts } = useStore();

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  const categories = [
    {
      name: 'Hoodies',
      count: '2 Drops',
      image: '/images/shadow_faith_hoodie_cover.jpg',
      description: '520 GSM Heavyweight & Holographic Leather'
    },
    {
      name: 'T-Shirts',
      count: '1 Drop',
      image: '/images/prax_boxy_tee_cover.jpg',
      description: '340 GSM Luxury Heavy Cotton'
    },
    {
      name: 'Pants',
      count: '1 Drop',
      image: '/images/shadow_faith_sweatpants_cover.jpg',
      description: 'Gothic Cross Applique Embroidery'
    },
    {
      name: 'Jackets',
      count: '1 Drop',
      image: '/images/shadow_faith_varsity_cover.jpg',
      description: 'Heavy Wool Body & Genuine Leather Sleeves'
    }
  ];

  return (
    <div className="space-y-20 pb-20 bg-black text-white font-sans">
      {/* Editorial Hero Banner */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#1a1a1a] bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/prax_hero_banner.jpg"
            alt="PRAX Hero Banner"
            className="w-full h-full object-cover object-center opacity-50 scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6 pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111]/90 border border-[#222222] text-xs font-mono tracking-[0.25em] text-zinc-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PRAX STUDIO // SS26 CAPSULE 04</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.05em] uppercase font-display leading-none text-white drop-shadow-2xl">
            MINIMALIST<br />PRECISION.
          </h1>

          <p className="text-sm sm:text-lg text-zinc-400 font-mono max-w-2xl mx-auto leading-relaxed tracking-wide">
            Architectural silhouettes crafted from custom-milled 500 GSM Portuguese cotton and Italian virgin wool.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-mono">
            <button
              onClick={() => onNavigate('shop')}
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-[0.2em] text-xs px-8 py-4 flex items-center justify-center gap-2 transition-colors shadow-2xl"
            >
              <span>EXPLORE SS26 CAPSULE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('lookbook')}
              className="w-full sm:w-auto bg-[#111111]/90 hover:bg-[#1a1a1a] border border-[#222222] text-white font-bold uppercase tracking-[0.2em] text-xs px-8 py-4 transition-colors"
            >
              VIEW EDITORIAL LOOKBOOK
            </button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-4">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.25em]">CURATED CATEGORIES</span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">CATEGORIES</h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onNavigate('shop', { category: cat.name })}
              className="group cursor-pointer relative aspect-[3/4] bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333333] transition-all duration-300 overflow-hidden flex flex-col justify-end p-5 rounded-sm"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-50 group-hover:opacity-75"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest bg-black/80 px-2 py-0.5 border border-[#222222]">
                  {cat.count}
                </span>
                <h3 className="text-xl font-bold uppercase tracking-wide text-white">{cat.name}</h3>
                <p className="text-[11px] font-mono text-zinc-400 line-clamp-1">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-4">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.25em]">STUDIO SELECTIONS</span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">FEATURED ESSENTIALS</h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
          >
            <span>SHOP ALL ESSENTIALS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loadingProducts ? (
          <ProductGridSkeleton count={4} gridCols={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
            ))}
          </div>
        )}
      </section>

      {/* Editorial Lookbook Banner Section */}
      <section className="relative bg-[#080808] border-y border-[#1a1a1a] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.25em] bg-[#111111] border border-[#222222] px-3 py-1">
              CAMPAIGN EDITORIAL // SS26
            </span>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight font-display">
              FORM FOLLOWS<br />FABRICATION.
            </h2>

            <p className="text-sm text-zinc-400 font-mono leading-relaxed max-w-lg">
              We eliminate superfluous logos and extraneous trims. Every garment is defined purely by its structural weight, shoulder slope, and raw tactile depth.
            </p>

            <ul className="space-y-3 font-mono text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white" />
                <span>CUSTOM MILLED 500 GSM PORTUGUESE FLEECE</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white" />
                <span>JAPANESE WATER-REPELLENT RECYCLED NYLON</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white" />
                <span>ITALIAN VIRGIN WOOL & CASHMERE DRAPING</span>
              </li>
            </ul>

            <div className="pt-4">
              <button
                onClick={() => onNavigate('lookbook')}
                className="bg-white hover:bg-zinc-200 text-black font-bold font-mono text-xs uppercase tracking-[0.2em] px-8 py-4 flex items-center gap-2 transition-colors"
              >
                <span>EXPLORE EDITORIAL LOOKBOOK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative aspect-[16/10] bg-[#111111] border border-[#222222] overflow-hidden rounded-sm">
            <img
              src="/src/assets/images/prax_lookbook_1786874850668.jpg"
              alt="PRAX Lookbook Campaign"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-4">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.25em]">JUST DROPPED</span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">NEW ARRIVALS</h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
          >
            <span>EXPLORE ALL DROPS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loadingProducts ? (
          <ProductGridSkeleton count={4} gridCols={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
            ))}
          </div>
        )}
      </section>

      {/* Customer Testimonials Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1a1a1a] pt-16">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.25em]">VERIFIED CLIENT FEEDBACK</span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase font-display">THE PRAX EXPERIENCE</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] space-y-4 rounded-sm">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-zinc-300 leading-relaxed italic">
              "The 500 GSM weight is unreal. It holds its silhouette perfectly even after weeks of wear. Best hoodie in my collection."
            </p>
            <div className="border-t border-[#1a1a1a] pt-3 text-zinc-500 flex justify-between">
              <span className="font-bold text-white">Kaito T. — Tokyo</span>
              <span>Heavyweight Hoodie</span>
            </div>
          </div>

          <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] space-y-4 rounded-sm">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-zinc-300 leading-relaxed italic">
              "Express shipping from Lisbon to NYC took less than 48 hours. Packaging was pristine with dust bag included."
            </p>
            <div className="border-t border-[#1a1a1a] pt-3 text-zinc-500 flex justify-between">
              <span className="font-bold text-white">Elena R. — New York</span>
              <span>Wide-Leg Trousers</span>
            </div>
          </div>

          <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] space-y-4 rounded-sm">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-zinc-300 leading-relaxed italic">
              "Zero obnoxious branding, pure craftsmanship. Fits exactly as described on the size guide."
            </p>
            <div className="border-t border-[#1a1a1a] pt-3 text-zinc-500 flex justify-between">
              <span className="font-bold text-white">Marcus V. — London</span>
              <span>Puffer Jacket</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
