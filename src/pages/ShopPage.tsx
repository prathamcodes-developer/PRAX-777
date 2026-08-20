import React, { useState } from 'react';
import { Filter, SlidersHorizontal, X, Grid2X2, Grid3X3, LayoutGrid, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';
import { Category, Product, Size } from '../types';

interface ShopPageProps {
  onSelectProduct: (product: Product) => void;
  initialCategory?: Category | 'All';
}

export const ShopPage: React.FC<ShopPageProps> = ({ onSelectProduct, initialCategory }) => {
  const {
    products,
    loadingProducts,
    filters,
    setFilters,
    resetFilters,
    formatPrice
  } = useStore();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);

  const categoriesList: (Category | 'All')[] = ['All', 'Hoodies', 'T-Shirts', 'Pants', 'Jackets', 'Accessories'];
  const sizesList: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorsList = [
    { name: 'Black', hex: '#111' },
    { name: 'White', hex: '#f8f8f8' },
    { name: 'Gray', hex: '#666' },
    { name: 'Olive', hex: '#3f4239' },
    { name: 'Tan', hex: '#7a421c' }
  ];

  const toggleSizeFilter = (size: Size) => {
    setFilters(prev => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
      };
    });
  };

  const toggleColorFilter = (colorName: string) => {
    setFilters(prev => {
      const exists = prev.colors.includes(colorName);
      return {
        ...prev,
        colors: exists ? prev.colors.filter(c => c !== colorName) : [...prev.colors, colorName]
      };
    });
  };

  const activeFilterCount =
    (filters.category !== 'All' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 10000 ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    (filters.inStockOnly ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">PRAX STUDIO CATALOG</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
            {filters.category === 'All' ? 'ALL ESSENTIALS' : filters.category.toUpperCase()}
          </h1>
        </div>

        {/* Search Query Indicator */}
        {filters.searchQuery && (
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 flex items-center gap-2">
            <span>FILTERING BY: "{filters.searchQuery}"</span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Control Bar: Mobile Filter Trigger, Grid Toggle & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-900 p-4 font-mono text-xs">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Drawer Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase py-2 px-4 border border-zinc-800 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>FILTERS ({activeFilterCount})</span>
          </button>

          <span className="text-zinc-400">
            SHOWING <strong className="text-white">{products.length}</strong> PRODUCTS
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6">
          {/* Grid Layout Toggle (Desktop) */}
          <div className="hidden md:flex items-center gap-1 border-r border-zinc-800 pr-6">
            <button
              onClick={() => setGridCols(2)}
              className={`p-1.5 transition-colors ${gridCols === 2 ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              title="2 Columns"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 transition-colors ${gridCols === 3 ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              title="3 Columns"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 transition-colors ${gridCols === 4 ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              title="4 Columns"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase">SORT BY:</span>
            <select
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-zinc-900 border border-zinc-800 text-white font-bold px-3 py-1.5 text-xs focus:outline-none focus:border-white uppercase"
            >
              <option value="featured">FEATURED</option>
              <option value="newest">NEWEST DROPS</option>
              <option value="price_low">PRICE: LOW TO HIGH</option>
              <option value="price_high">PRICE: HIGH TO LOW</option>
              <option value="rating">HIGHEST RATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs pt-1">
          <span className="text-zinc-500 font-bold uppercase">ACTIVE FILTERS:</span>

          {filters.category !== 'All' && (
            <span className="bg-zinc-900 border border-zinc-700 text-white px-2.5 py-1 flex items-center gap-1.5">
              CATEGORY: {filters.category}
              <button onClick={() => setFilters(p => ({ ...p, category: 'All' }))}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            </span>
          )}

          {filters.sizes.map(s => (
            <span key={s} className="bg-zinc-900 border border-zinc-700 text-white px-2.5 py-1 flex items-center gap-1.5">
              SIZE: {s}
              <button onClick={() => toggleSizeFilter(s)}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            </span>
          ))}

          {filters.colors.map(c => (
            <span key={c} className="bg-zinc-900 border border-zinc-700 text-white px-2.5 py-1 flex items-center gap-1.5">
              COLOR: {c}
              <button onClick={() => toggleColorFilter(c)}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
            </span>
          ))}

          <button
            onClick={resetFilters}
            className="text-rose-400 hover:text-rose-300 underline font-bold flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET ALL</span>
          </button>
        </div>
      )}

      {/* Main Content Layout (Left Sidebar + Right Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Left Filter Sidebar */}
        <div className="hidden lg:block space-y-8 font-mono text-xs pr-4 border-r border-zinc-900">
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">CATEGORIES</h3>
            <div className="space-y-1.5">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                  className={`w-full text-left py-1 px-2 transition-colors flex justify-between items-center ${
                    filters.category === cat ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-60">
                    {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">SIZES</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizesList.map(size => (
                <button
                  key={size}
                  onClick={() => toggleSizeFilter(size)}
                  className={`py-2 text-center border font-bold transition-colors ${
                    filters.sizes.includes(size)
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">COLORS</h3>
            <div className="space-y-2">
              {colorsList.map(c => (
                <button
                  key={c.name}
                  onClick={() => toggleColorFilter(c.name)}
                  className={`w-full text-left py-1 px-2 border transition-colors flex items-center justify-between ${
                    filters.colors.includes(c.name)
                      ? 'bg-zinc-800 border-white text-white font-bold'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-zinc-700" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </div>
                  {filters.colors.includes(c.name) && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex justify-between font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
              <span>MAX PRICE</span>
              <span className="text-zinc-300">{formatPrice(filters.maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={filters.maxPrice}
              onChange={e => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full accent-white bg-zinc-800 h-1.5 rounded-none cursor-pointer"
            />
          </div>

          {/* In-Stock Only */}
          <div className="pt-2 border-t border-zinc-900">
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={e => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                className="w-4 h-4 accent-white bg-zinc-900 border-zinc-800 rounded-none cursor-pointer"
              />
              <span className="uppercase text-xs font-bold">IN-STOCK ITEMS ONLY</span>
            </label>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3">
          {loadingProducts ? (
            <ProductGridSkeleton count={8} gridCols={gridCols} />
          ) : products.length === 0 ? (
            <div className="py-20 text-center space-y-4 font-mono">
              <p className="text-sm text-zinc-400">NO PRODUCTS MATCH YOUR SELECTED FILTERS.</p>
              <button
                onClick={resetFilters}
                className="bg-white text-black font-bold uppercase py-3 px-6 text-xs transition-colors"
              >
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-3 sm:gap-6 ${
                gridCols === 2
                  ? 'grid-cols-2'
                  : gridCols === 3
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {products.map(product => (
                <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div className="fixed inset-0 bg-black/80" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative w-full max-w-xs bg-zinc-950 border-l border-zinc-800 text-white p-6 h-full overflow-y-auto space-y-6 z-10 font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="font-bold text-sm uppercase">CATALOG FILTERS</h2>
              <button onClick={() => setMobileFilterOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <h3 className="font-bold text-zinc-400 uppercase">Category</h3>
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                  className={`w-full text-left py-1.5 px-2 border ${
                    filters.category === cat ? 'bg-white text-black font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-white text-black font-bold uppercase py-3 text-center"
            >
              APPLY FILTERS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
