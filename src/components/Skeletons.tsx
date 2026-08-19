import React from 'react';

/**
 * Base shimmering Skeleton line or box
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#181818] border border-[#222222]/50 rounded-sm ${className}`} />
);

/**
 * Skeleton for a single Product Card
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm overflow-hidden font-sans">
      {/* Image Aspect Ratio Placeholder */}
      <div className="relative aspect-[3/4] bg-[#141414] border-b border-[#1a1a1a] overflow-hidden p-4 flex flex-col justify-between">
        <Skeleton className="w-16 h-4 bg-[#1f1f1f]" />
        <div className="space-y-2">
          <Skeleton className="w-12 h-3 bg-[#1f1f1f]" />
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 space-y-3">
        {/* Rating & Category Line */}
        <div className="flex justify-between items-center">
          <Skeleton className="w-20 h-3 bg-[#181818]" />
          <Skeleton className="w-12 h-3 bg-[#181818]" />
        </div>

        {/* Product Name */}
        <Skeleton className="w-4/5 h-4 bg-[#1f1f1f]" />

        {/* Price & Colors */}
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="w-16 h-5 bg-[#222222]" />
          <div className="flex gap-1">
            <Skeleton className="w-3 h-3 rounded-full bg-[#222222]" />
            <Skeleton className="w-3 h-3 rounded-full bg-[#222222]" />
            <Skeleton className="w-3 h-3 rounded-full bg-[#222222]" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of Product Card Skeletons
 */
export const ProductGridSkeleton: React.FC<{
  count?: number;
  gridCols?: 2 | 3 | 4;
}> = ({ count = 8, gridCols = 4 }) => {
  const items = Array.from({ length: count });

  const gridClass =
    gridCols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : gridCols === 3
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {items.map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Full Skeleton Screen for Shop Page
 */
export const ShopPageSkeleton: React.FC<{ gridCols?: 2 | 3 | 4 }> = ({ gridCols = 4 }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="space-y-2">
          <Skeleton className="w-36 h-3 bg-[#181818]" />
          <Skeleton className="w-64 sm:w-80 h-10 bg-[#222222]" />
        </div>
        <Skeleton className="w-40 h-8 bg-[#181818]" />
      </div>

      {/* Control Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a0a0a] border border-[#1a1a1a] p-4">
        <Skeleton className="w-40 h-5 bg-[#181818]" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-32 h-8 bg-[#181818]" />
          <Skeleton className="w-48 h-8 bg-[#181818]" />
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar Skeleton */}
        <div className="hidden lg:block space-y-8 pr-4 border-r border-[#1a1a1a]">
          {/* Categories */}
          <div className="space-y-3">
            <Skeleton className="w-28 h-4 bg-[#1f1f1f]" />
            <div className="space-y-2">
              <Skeleton className="w-full h-7 bg-[#141414]" />
              <Skeleton className="w-full h-7 bg-[#141414]" />
              <Skeleton className="w-full h-7 bg-[#141414]" />
              <Skeleton className="w-full h-7 bg-[#141414]" />
              <Skeleton className="w-full h-7 bg-[#141414]" />
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <Skeleton className="w-20 h-4 bg-[#1f1f1f]" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-9 bg-[#141414]" />
              <Skeleton className="h-9 bg-[#141414]" />
              <Skeleton className="h-9 bg-[#141414]" />
              <Skeleton className="h-9 bg-[#141414]" />
              <Skeleton className="h-9 bg-[#141414]" />
              <Skeleton className="h-9 bg-[#141414]" />
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <Skeleton className="w-24 h-4 bg-[#1f1f1f]" />
            <div className="space-y-2">
              <Skeleton className="w-full h-7 bg-[#141414]" />
              <Skeleton className="w-full h-7 bg-[#141414]" />
              <Skeleton className="w-full h-7 bg-[#141414]" />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Skeleton className="w-full h-4 bg-[#1f1f1f]" />
            <Skeleton className="w-full h-2 bg-[#181818]" />
          </div>
        </div>

        {/* Catalog Grid Skeleton */}
        <div className="lg:col-span-3">
          <ProductGridSkeleton count={8} gridCols={gridCols} />
        </div>
      </div>
    </div>
  );
};

/**
 * Full Skeleton Screen for Product Detail Page
 */
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-16">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-16 h-3 bg-[#181818]" />
        <Skeleton className="w-4 h-3 bg-[#181818]" />
        <Skeleton className="w-20 h-3 bg-[#181818]" />
        <Skeleton className="w-4 h-3 bg-[#181818]" />
        <Skeleton className="w-32 h-3 bg-[#222222]" />
      </div>

      {/* Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery Left Skeleton */}
        <div className="space-y-4">
          <Skeleton className="w-full aspect-[3/4] bg-[#121212] border border-[#1a1a1a] rounded-sm" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="aspect-square bg-[#141414] border border-[#1a1a1a]" />
            <Skeleton className="aspect-square bg-[#141414] border border-[#1a1a1a]" />
            <Skeleton className="aspect-square bg-[#141414] border border-[#1a1a1a]" />
            <Skeleton className="aspect-square bg-[#141414] border border-[#1a1a1a]" />
          </div>
        </div>

        {/* Info Right Skeleton */}
        <div className="space-y-8">
          {/* Header Lines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-4 bg-[#181818]" />
              <Skeleton className="w-20 h-4 bg-[#181818]" />
            </div>
            <Skeleton className="w-5/6 h-9 bg-[#222222]" />
            <Skeleton className="w-1/2 h-9 bg-[#222222]" />

            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="w-28 h-4 bg-[#181818]" />
              <Skeleton className="w-24 h-4 bg-[#181818]" />
            </div>
          </div>

          {/* Price Box Skeleton */}
          <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-between">
            <Skeleton className="w-28 h-7 bg-[#222222]" />
            <Skeleton className="w-24 h-4 bg-[#181818]" />
          </div>

          {/* Color Selector Skeleton */}
          <div className="space-y-3">
            <Skeleton className="w-28 h-4 bg-[#181818]" />
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-[#181818]" />
              <Skeleton className="w-10 h-10 rounded-full bg-[#181818]" />
              <Skeleton className="w-10 h-10 rounded-full bg-[#181818]" />
            </div>
          </div>

          {/* Size Selector Skeleton */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="w-24 h-4 bg-[#181818]" />
              <Skeleton className="w-20 h-3 bg-[#181818]" />
            </div>
            <div className="grid grid-cols-6 gap-2">
              <Skeleton className="h-11 bg-[#141414]" />
              <Skeleton className="h-11 bg-[#141414]" />
              <Skeleton className="h-11 bg-[#141414]" />
              <Skeleton className="h-11 bg-[#141414]" />
              <Skeleton className="h-11 bg-[#141414]" />
              <Skeleton className="h-11 bg-[#141414]" />
            </div>
          </div>

          {/* Quantity & CTA Buttons Skeleton */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-4">
              <Skeleton className="w-28 h-12 bg-[#181818]" />
              <Skeleton className="flex-1 h-12 bg-[#252525]" />
              <Skeleton className="w-12 h-12 bg-[#181818]" />
            </div>
            <Skeleton className="w-full h-12 bg-[#ffffff]/90" />
          </div>

          {/* Guarantees Box */}
          <div className="p-4 bg-[#080808] border border-[#1a1a1a] grid grid-cols-3 gap-4">
            <Skeleton className="h-10 bg-[#121212]" />
            <Skeleton className="h-10 bg-[#121212]" />
            <Skeleton className="h-10 bg-[#121212]" />
          </div>

          {/* Tabs Content Skeleton */}
          <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
            <div className="flex gap-6 border-b border-[#1a1a1a] pb-3">
              <Skeleton className="w-24 h-5 bg-[#202020]" />
              <Skeleton className="w-24 h-5 bg-[#141414]" />
              <Skeleton className="w-24 h-5 bg-[#141414]" />
            </div>
            <Skeleton className="w-full h-4 bg-[#141414]" />
            <Skeleton className="w-5/6 h-4 bg-[#141414]" />
            <Skeleton className="w-4/6 h-4 bg-[#141414]" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton Section */}
      <div className="space-y-6 pt-10 border-t border-[#1a1a1a]">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <Skeleton className="w-32 h-3 bg-[#181818]" />
            <Skeleton className="w-56 h-7 bg-[#222222]" />
          </div>
        </div>
        <ProductGridSkeleton count={4} gridCols={4} />
      </div>
    </div>
  );
};

/**
 * Skeleton for Profile / Client Dashboard
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-white space-y-10">
      <div className="p-8 bg-[#0a0a0a] border border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Skeleton className="w-16 h-16 rounded-full bg-[#1f1f1f]" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6 bg-[#222222]" />
            <Skeleton className="w-36 h-3 bg-[#181818]" />
          </div>
        </div>
        <Skeleton className="w-28 h-9 bg-[#181818]" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 border-b border-[#1a1a1a] pb-3">
          <Skeleton className="w-28 h-8 bg-[#202020]" />
          <Skeleton className="w-28 h-8 bg-[#141414]" />
          <Skeleton className="w-28 h-8 bg-[#141414]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="w-full h-24 bg-[#0a0a0a] border border-[#1a1a1a]" />
          <Skeleton className="w-full h-24 bg-[#0a0a0a] border border-[#1a1a1a]" />
        </div>
      </div>
    </div>
  );
};
