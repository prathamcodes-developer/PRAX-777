import React, { useState } from 'react';
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Size } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const {
    formatPrice,
    isWishlisted,
    toggleWishlist,
    addToCart,
    setQuickViewProduct
  } = useStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isHovered, setIsHovered] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, selectedColor, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => onSelect(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
      className="group cursor-pointer flex flex-col bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333333] hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 relative font-sans text-white overflow-hidden rounded-sm"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] bg-[#151515] border-b border-[#1a1a1a] overflow-hidden w-full">
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.dataset.failed) {
              target.dataset.failed = 'true';
              if (product.images[1]) {
                target.src = product.images[1];
              } else {
                target.src = '/images/prax_hero_banner.jpg';
              }
            }
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 font-mono text-[10px] uppercase font-bold tracking-wider">
          {product.isNew && (
            <span className="bg-white text-black px-2 py-0.5 shadow-md">NEW</span>
          )}
          {product.isFeatured && (
            <span className="bg-zinc-900 text-white border border-zinc-700 px-2 py-0.5">ESSENTIAL</span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-rose-600 text-white px-2 py-0.5">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md text-white hover:bg-black transition-colors rounded-none z-10 border border-zinc-800"
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-white text-white' : 'text-zinc-300'}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-10">
          <button
            onClick={handleQuickView}
            className="flex-1 bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase py-2 border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>QUICK VIEW</span>
          </button>

          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase py-2 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ ADD</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            <div className="flex items-center gap-1 text-zinc-300">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 className="font-bold text-sm tracking-wide text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Colors Swatch */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900">
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            {product.colors.map(color => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                title={color.name}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  selectedColor.name === color.name ? 'scale-125 border-white ring-1 ring-white/50' : 'border-zinc-700 hover:scale-110'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select color ${color.name}`}
              />
            ))}
          </div>

          {/* Prices */}
          <div className="text-right font-mono text-sm font-bold flex items-center gap-2">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="line-through text-zinc-500 text-xs font-normal">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-white">{formatPrice(product.price)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
