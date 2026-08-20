import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Star, ShoppingBag, ArrowRight, Heart, Check, Ruler } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Size } from '../types';
import { SizeGuideModal } from './SizeGuideModal';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    formatPrice,
    isWishlisted,
    toggleWishlist
  } = useStore();

  if (!quickViewProduct) return null;

  const [selectedImage, setSelectedImage] = useState(quickViewProduct.images[0]);
  const [selectedSize, setSelectedSize] = useState<Size>(quickViewProduct.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(quickViewProduct.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const wishlisted = isWishlisted(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, selectedSize, selectedColor, quantity);
    setQuickViewProduct(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl overflow-hidden z-10 font-sans max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 p-2 bg-black/80 text-zinc-400 hover:text-white border border-zinc-800 z-20"
            aria-label="Close quick view"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Left */}
            <div className="p-6 bg-zinc-900 space-y-4 flex flex-col justify-between">
              <div className="relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden border border-zinc-800">
                <img
                  src={selectedImage}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('prax_hero_banner.jpg')) {
                      target.src = '/images/prax_hero_banner.jpg';
                    }
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 bg-zinc-950 border transition-all shrink-0 ${
                      selectedImage === img ? 'border-white ring-1 ring-white' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('prax_hero_banner.jpg')) {
                          target.src = '/images/prax_hero_banner.jpg';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Right */}
            <div className="p-6 md:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-widest">
                  <span>{quickViewProduct.category} // SKU: {quickViewProduct.sku}</span>
                  <div className="flex items-center gap-1 text-white">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{quickViewProduct.rating}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-white">{quickViewProduct.name}</h2>

                <div className="text-xl font-mono font-bold text-white flex items-center gap-3">
                  <span>{formatPrice(quickViewProduct.price)}</span>
                  {quickViewProduct.originalPrice && (
                    <span className="line-through text-zinc-500 text-sm font-normal">
                      {formatPrice(quickViewProduct.originalPrice)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{quickViewProduct.description}</p>

                {/* Color Selection */}
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    COLOR: <strong className="text-white">{selectedColor.name}</strong>
                  </span>
                  <div className="flex gap-2">
                    {quickViewProduct.colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-none border-2 flex items-center justify-center transition-all ${
                          selectedColor.name === color.name ? 'border-white scale-105' : 'border-zinc-800 opacity-80'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor.name === color.name && (
                          <Check className={`w-4 h-4 ${color.hex === '#f8f8f8' || color.hex === '# Pure White' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400 uppercase">
                      SIZE: <strong className="text-white">{selectedSize}</strong>
                    </span>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 underline text-[11px]"
                    >
                      <Ruler className="w-3 h-3" />
                      <span>SIZE GUIDE</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2 font-mono text-xs">
                    {quickViewProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2.5 font-bold transition-all border ${
                          selectedSize === size
                            ? 'bg-white text-black border-white'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-zinc-900 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO BAG // {formatPrice(quickViewProduct.price * quantity)}</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                    className="p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white text-white' : 'text-zinc-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={quickViewProduct.category}
      />
    </AnimatePresence>
  );
};
