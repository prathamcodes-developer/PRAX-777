import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, Star, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

interface SearchModalProps {
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectProduct }) => {
  const { isSearchOpen, setIsSearchOpen, products, formatPrice } = useStore();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const popularTags = ['Heavyweight Hoodie', 'Oversized Tee', 'Wide-Leg Trousers', 'Puffer Jacket', 'Leather Cardholder'];

  const filteredProducts = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl overflow-hidden z-10 font-sans"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search PRAX products, categories, or materials..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-mono text-white placeholder-zinc-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-0.5 bg-zinc-800"
              >
                CLEAR
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 text-zinc-400 hover:text-white"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            {!query ? (
              <div className="space-y-4 font-mono">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">POPULAR SEARCHES</p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs px-3 py-1.5 border border-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 font-mono space-y-2">
                <p className="text-sm text-zinc-400">NO RESULTS FOUND FOR "{query.toUpperCase()}"</p>
                <p className="text-xs text-zinc-600">Try searching for "Hoodie", "Pants", "Leather", or "Wool"</p>
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  FOUND {filteredProducts.length} MATCHING ITEMS
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        onSelectProduct(product);
                      }}
                      className="flex items-center gap-4 p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-14 h-16 object-cover bg-zinc-800 shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('prax_hero_banner.jpg')) {
                            target.src = '/images/prax_hero_banner.jpg';
                          }
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                          {product.category}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate font-sans">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-white">{formatPrice(product.price)}</span>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.rating}</span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
