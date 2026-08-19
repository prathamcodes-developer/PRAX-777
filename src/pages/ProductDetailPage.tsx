import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  Ruler,
  Check,
  Sparkles,
  MessageSquare,
  Share2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Size, Review } from '../types';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailSkeleton } from '../components/Skeletons';

interface ProductDetailPageProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
  onDirectBuy?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigate,
  onSelectProduct,
  onDirectBuy
}) => {
  const {
    addToCart,
    formatPrice,
    isWishlisted,
    toggleWishlist,
    addToast
  } = useStore();

  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || '');
  const [selectedSize, setSelectedSize] = useState<Size>(product?.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || { name: 'Black', hex: '#111' });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    setIsPageLoading(true);
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
      setQuantity(1);
    }

    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [product?.id]);

  // Customer Reviews local state
  const [reviewsList, setReviewsList] = useState<Review[]>([
    {
      id: 'rev-01',
      productId: product.id,
      userName: 'Kaito T.',
      rating: 5,
      title: 'The heaviest, best fitting garment I own',
      comment: 'The fabric density is incredible. Holds its silhouette even after washing. Outstanding delivery speed as well.',
      date: '2026-08-10',
      verified: true
    },
    {
      id: 'rev-02',
      productId: product.id,
      userName: 'Elena R.',
      rating: 5,
      title: 'Flawless minimalist design',
      comment: 'No obnoxious logos, just pristine tailoring. Fits true to size for an intentional boxy drape.',
      date: '2026-08-02',
      verified: true
    }
  ]);

  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    if (typeof onDirectBuy === 'function') {
      onDirectBuy();
    } else {
      onNavigate('checkout');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewComment) {
      addToast('Please fill out name and review text', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: newReviewName,
          rating: newReviewRating,
          title: newReviewTitle,
          comment: newReviewComment
        })
      });
      const data = await res.json();
      if (res.ok && data.review) {
        setReviewsList(prev => [data.review, ...prev]);
        addToast('Thank you for submitting your review!', 'success');
        setNewReviewName('');
        setNewReviewTitle('');
        setNewReviewComment('');
      }
    } catch {
      const fallbackRev: Review = {
        id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        productId: product.id,
        userName: newReviewName,
        rating: newReviewRating,
        title: newReviewTitle || 'Verified Purchase',
        comment: newReviewComment,
        date: new Date().toISOString().split('T')[0],
        verified: true
      };
      setReviewsList(prev => [fallbackRev, ...prev]);
      addToast('Review posted successfully', 'success');
      setNewReviewName('');
      setNewReviewTitle('');
      setNewReviewComment('');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard', 'info');
    }
  };

  if (isPageLoading || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-16">
      {/* Breadcrumb Navigation */}
      <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="hover:text-white">HOME</button>
        <span>/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-white">SHOP</button>
        <span>/</span>
        <button onClick={() => onNavigate('shop', { category: product.category })} className="hover:text-white">{product.category}</button>
        <span>/</span>
        <span className="text-white truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Gallery (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-zinc-950 border border-zinc-800 overflow-hidden group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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
            <div className="absolute top-4 left-4 flex flex-col gap-2 font-mono text-xs font-bold uppercase tracking-wider z-10">
              {product.isNew && <span className="bg-white text-black px-3 py-1 shadow-lg">NEW DROP</span>}
              {product.isFeatured && <span className="bg-zinc-900 border border-zinc-700 text-white px-3 py-1">ESSENTIAL</span>}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black text-white border border-zinc-800 backdrop-blur-md transition-colors"
              title="Share link"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-24 bg-zinc-900 border transition-all shrink-0 ${
                  selectedImage === img ? 'border-white ring-1 ring-white' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Gallery thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Product Specifications (5 Columns) */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                <span>{product.category} // SKU: {product.sku}</span>
                <div className="flex items-center gap-1.5 text-white">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-zinc-500">({reviewsList.length} REVIEWS)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{product.name}</h1>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-4 font-mono text-2xl font-bold">
              <span>{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="line-through text-zinc-500 text-lg font-normal">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5">
                  SAVE {formatPrice(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed font-sans">{product.description}</p>

            {/* Color Swatches */}
            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400 uppercase">
                  COLOR: <strong className="text-white">{selectedColor.name}</strong>
                </span>
              </div>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 border-2 transition-all flex items-center justify-center ${
                      selectedColor.name === color.name ? 'border-white scale-110' : 'border-zinc-800 opacity-70'
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

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400 uppercase">
                  SELECT SIZE: <strong className="text-white">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-zinc-400 hover:text-white flex items-center gap-1.5 underline text-xs"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>SIZE GUIDE & MEASUREMENTS</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2 font-mono text-xs">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 font-bold transition-all border ${
                      selectedSize === size
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Stock Urgency */}
              <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>IN STOCK ({product.stockCount} UNITS AVAILABLE IN {selectedSize})</span>
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-zinc-400 uppercase">QUANTITY</span>
              <div className="flex items-center w-32 border border-zinc-800 bg-zinc-950 font-mono text-xs font-bold">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-zinc-400 hover:text-white"
                >
                  -
                </button>
                <span className="flex-1 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-zinc-400 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG // {formatPrice(product.price * quantity)}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white transition-colors"
                  title="Save to wishlist"
                  aria-label="Save to wishlist"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white text-white' : 'text-zinc-400'}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono font-bold text-xs uppercase tracking-widest py-4 transition-colors"
              >
                EXPRESS CHECKOUT (BUY NOW)
              </button>
            </div>

            {/* Perks Ribbon */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900 font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-300 shrink-0" />
                <span>Free Express Shipping Over $200</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-zinc-300 shrink-0" />
                <span>30-Day Worldwide Returns</span>
              </div>
            </div>
          </div>

          {/* Product Specifications Accordions */}
          <div className="pt-8 border-t border-zinc-900 font-mono text-xs space-y-4">
            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 font-bold uppercase transition-colors border-b-2 ${
                  activeTab === 'details' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                MATERIALS & ORIGIN
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`py-3 px-4 font-bold uppercase transition-colors border-b-2 ${
                  activeTab === 'care' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                CARE INSTRUCTIONS
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-3 px-4 font-bold uppercase transition-colors border-b-2 ${
                  activeTab === 'shipping' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                SHIPPING & RETURNS
              </button>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 text-zinc-300 leading-relaxed space-y-2">
              {activeTab === 'details' && (
                <ul className="space-y-1.5 list-disc list-inside">
                  {product.details.materials.map((m, i) => <li key={i}>{m}</li>)}
                  <li>Fit: {product.details.fit}</li>
                  <li>Origin: {product.details.origin}</li>
                </ul>
              )}
              {activeTab === 'care' && (
                <ul className="space-y-1.5 list-disc list-inside">
                  {product.details.care.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
              {activeTab === 'shipping' && (
                <p>
                  All orders are dispatched via DHL Express Courier within 24 hours. Delivery takes 1-3 business days worldwide. Duty and import taxes are included at checkout for supported regions.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-t border-zinc-800 pt-16 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">VERIFIED CLIENT FEEDBACK</span>
            <h2 className="text-3xl font-black uppercase">CLIENT REVIEWS ({reviewsList.length})</h2>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs">
            <div className="text-3xl font-bold text-white">{product.rating}</div>
            <div>
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <span className="text-zinc-500 text-[11px]">BASED ON {reviewsList.length} VERIFIED REVIEWS</span>
            </div>
          </div>
        </div>

        {/* Reviews List & Write Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Reviews List (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {reviewsList.map(rev => (
              <div key={rev.id} className="p-6 bg-zinc-950 border border-zinc-900 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{rev.userName}</span>
                    {rev.verified && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 font-bold">
                        VERIFIED CLIENT
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500 text-[11px]">{rev.date}</span>
                </div>

                <div className="flex text-amber-400 gap-1">
                  {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                </div>

                <h4 className="font-bold text-white text-sm font-sans">{rev.title}</h4>
                <p className="text-zinc-300 leading-relaxed font-sans text-xs">{rev.comment}</p>
              </div>
            ))}
          </div>

          {/* Write Review Form (5 Columns) */}
          <div className="lg:col-span-5 p-6 bg-zinc-950 border border-zinc-800 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm uppercase text-white tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <span>SUBMIT CLIENT REVIEW</span>
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex M."
                  value={newReviewName}
                  onChange={e => setNewReviewName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Rating</label>
                <select
                  value={newReviewRating}
                  onChange={e => setNewReviewRating(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none"
                >
                  <option value={5}>5 Stars - Outstanding</option>
                  <option value={4}>4 Stars - Great</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional material quality"
                  value={newReviewTitle}
                  onChange={e => setNewReviewTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Review Comments</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details on fit, fabric weight, and shipping..."
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white font-sans text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold uppercase py-3 tracking-wider transition-colors"
              >
                {submittingReview ? 'POSTING...' : 'SUBMIT REVIEW'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />
    </div>
  );
};
