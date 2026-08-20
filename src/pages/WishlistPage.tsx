import React from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductGridSkeleton } from '../components/Skeletons';
import { Product } from '../types';

interface WishlistPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onSelectProduct }) => {
  const { wishlist, products, loadingProducts, toggleWishlist, addToCart, formatPrice } = useStore();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-white space-y-8">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">SAVED ESSENTIALS</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">MY WISHLIST ({wishlist.length})</h1>
        </div>
      </div>

      {loadingProducts ? (
        <ProductGridSkeleton count={wishlist.length || 4} gridCols={4} />
      ) : wishlistedProducts.length === 0 ? (
        <div className="text-center py-20 font-mono space-y-4">
          <Heart className="w-12 h-12 text-zinc-700 mx-auto stroke-1" />
          <p className="text-sm text-zinc-400">YOUR WISHLIST IS CURRENTLY EMPTY</p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-white text-black font-bold uppercase py-3.5 px-8 text-xs tracking-wider transition-colors"
          >
            EXPLORE COLLECTIONS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map(product => (
            <div
              key={product.id}
              className="bg-zinc-950 border border-zinc-900 group flex flex-col justify-between font-mono text-xs"
            >
              <div
                onClick={() => onSelectProduct(product)}
                className="relative aspect-[3/4] bg-zinc-900 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('prax_hero_banner.jpg')) {
                      target.src = '/images/prax_hero_banner.jpg';
                    }
                  }}
                />

                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/80 text-rose-400 border border-zinc-800"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <h3
                  onClick={() => onSelectProduct(product)}
                  className="font-bold font-sans text-sm text-white line-clamp-1 cursor-pointer hover:underline"
                >
                  {product.name}
                </h3>

                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>{formatPrice(product.price)}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">{product.category}</span>
                </div>

                <button
                  onClick={() => addToCart(product, product.sizes[0], product.colors[0], 1)}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-bold uppercase py-2.5 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>MOVE TO BAG</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
