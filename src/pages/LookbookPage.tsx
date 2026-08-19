import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface LookbookPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const LookbookPage: React.FC<LookbookPageProps> = ({ onNavigate, onSelectProduct }) => {
  const editorialImages = [
    {
      title: 'LOOK 01 // SHADOW FAITH DROP 008',
      image: '/images/shadow_faith_hoodie_cover.jpg',
      item: 'SHADOW FAITH Oversized Eye & Bandana Zip Hoodie',
      price: '$195',
      sku: 'SF-HDY-008'
    },
    {
      title: 'LOOK 02 // PRAX ESSENTIALS',
      image: '/images/prax_boxy_tee_cover.jpg',
      item: 'PRAX "Define Your Edge" Heavyweight Boxy Tee',
      price: '$80',
      sku: 'PRX-TEE-004'
    },
    {
      title: 'LOOK 03 // HIP HOP CULTURE DROP 001',
      image: '/images/hiphop_leather_hoodie_cover.jpg',
      item: 'HIP HOP "Legends Never Die" Holographic Leather Hoodie',
      price: '$245',
      sku: 'HH-HDY-001'
    },
    {
      title: 'LOOK 04 // VARSITY STATEMENT',
      image: '/images/shadow_faith_varsity_cover.jpg',
      item: 'SHADOW FAITH "Faith in the Shadows" Graphic Varsity Jacket',
      price: '$280',
      sku: 'SF-JCK-001'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-white space-y-16">
      {/* Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto border-b border-zinc-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs font-mono tracking-widest text-zinc-400 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>EDITORIAL COLLECTION</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">PRAX STUDIO // CAPSULE 04</h1>

        <p className="text-xs font-mono text-zinc-400 leading-relaxed">
          Shot on location in Tokyo and Lisbon. Minimalist volume, architectural drapes, and high-density natural fabrications.
        </p>
      </div>

      {/* Lookbook Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {editorialImages.map((look, idx) => (
          <div key={idx} className="group space-y-4 bg-zinc-950 border border-zinc-900 p-4">
            <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden border border-zinc-800">
              <img
                src={look.image}
                alt={look.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex justify-between items-end font-mono text-xs pt-2">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">{look.title}</span>
                <h3 className="font-bold text-white text-sm font-sans">{look.item}</h3>
              </div>

              <button
                onClick={() => onNavigate('shop')}
                className="bg-white hover:bg-zinc-200 text-black font-bold uppercase px-4 py-2 flex items-center gap-1 transition-colors"
              >
                <span>SHOP LOOK</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
