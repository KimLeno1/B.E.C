import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CategoryInfo, ViewState } from '../types';
import { getImageUrl } from '../lib/imageUtils';
import { ArrowLeft, SlidersHorizontal, Sparkles, ShoppingBag, Heart, Search } from 'lucide-react';
import { matchesCategory } from '../lib/categoryUtils';

interface CategoryPageProps {
  categoryIdentifier: string; // can be slug, UUID, or name
  categories: CategoryInfo[];
  products: Product[];
  wishlist: string[];
  onSelectCategory: (category: string) => void;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product, size?: string) => void;
  onToggleWishlist: (p: Product) => void;
  onNavigate: (view: ViewState) => void;
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'all-terrain clogs': '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
  'studded slides': '/uploads/bec/bec_studded_slides_1795581066443.jpg',
  'classic slides': '/uploads/bec/bec_classic_slides_1795581065464.jpg',
  'double-strap sandals': '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg',
  'designer clogs': '/uploads/bec/bec_designer_clogs_1795581067141.jpg',
  'double-band slippers': '/uploads/bec/bec_double_band_slippers_1795581068033.jpg',
  footwear: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
  clogs: '/uploads/bec/bec_designer_clogs_1795581067141.jpg',
  slides: '/uploads/bec/bec_classic_slides_1795581065464.jpg',
  sandals: '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg',
  slippers: '/uploads/bec/bec_double_band_slippers_1795581068033.jpg'
};

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryIdentifier,
  categories,
  products,
  wishlist,
  onSelectCategory,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'DISCOUNT'>('POPULAR');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Identify current category info
  const categoryInfo = useMemo(() => {
    if (!categoryIdentifier || categoryIdentifier === 'All') return null;
    const lower = categoryIdentifier.toLowerCase();
    return categories.find(c => 
      c.id === categoryIdentifier || 
      (c.slug && c.slug.toLowerCase() === lower) || 
      c.name.toLowerCase() === lower
    ) || {
      id: categoryIdentifier,
      name: categoryIdentifier.charAt(0).toUpperCase() + categoryIdentifier.slice(1),
      slug: categoryIdentifier.toLowerCase(),
      heroImage: CATEGORY_FALLBACK_IMAGES[categoryIdentifier.toLowerCase()] || CATEGORY_FALLBACK_IMAGES.footwear,
      inspiration: 'B.E.C FOOTWEAR COLLECTION'
    };
  }, [categoryIdentifier, categories]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!matchesCategory(p, categoryIdentifier, categories)) return false;
      if (onlyInStock && !p.inStock) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName夺 = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesBrand = p.brand?.toLowerCase().includes(q);
        if (!matchesName夺 && !matchesDesc && !matchesBrand) return false;
      }
      return true;
    });
  }, [products, categoryIdentifier, categories, onlyInStock, searchQuery]);

  // Sort products
  const sortedProducts清洗 = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'PRICE_LOW') {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_HIGH') {
      return list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'DISCOUNT') {
      return list.sort((a, b) => (b.offeredDiscount || 0) - (a.offeredDiscount || 0));
    }
    return list.sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
  }, [filteredProducts, sortBy]);

  const heroImageUrl = categoryInfo?.heroImage || 
    (categoryInfo?.slug ? CATEGORY_FALLBACK_IMAGES[categoryInfo.slug] : null) || 
    CATEGORY_FALLBACK_IMAGES.footwear;

  const categoryName = categoryInfo?.name || categoryIdentifier;
  const inspirationCode = categoryInfo?.inspiration || `B.E.C FOOTWEAR • NATIONWIDE DELIVERY`;

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#3B2010] pb-32">
      {/* Category Hero Banner */}
      <section className="relative h-[42vh] sm:h-[48vh] md:h-[55vh] w-full overflow-hidden border-b border-white/10">
        <img
          src={heroImageUrl}
          alt={categoryName}
          className="w-full h-full object-cover opacity-30 object-center scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-between py-8 sm:py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-zinc-400">
            <button
              onClick={() => onNavigate(ViewState.LOBBY)}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span className="text-zinc-600">/</span>
            <button
              onClick={() => onNavigate(ViewState.CATEGORIES)}
              className="hover:text-white transition-colors"
            >
              Categories
            </button>
            <span className="text-zinc-600">/</span>
            <span className="text-[#C5A880] font-black">{categoryName}</span>
          </nav>

          {/* Title and Manifest Info */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#4A2B18] border border-[#E5C9A8]/30 text-[#FAF4EC] text-[9px] font-black uppercase tracking-[0.25em]">
                B.E.C Footwear
              </span>
              <span className="text-[10px] text-[#E5C9A8] font-mono tracking-wider">
                {inspirationCode}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic tracking-tight text-white">
              {categoryName}
            </h1>

            <p className="text-xs sm:text-sm text-[#F5EAD8] max-w-lg leading-relaxed">
              Curated pairs from our {categoryName.toLowerCase()} lineup. 
              Showing {filteredProducts.length} pairs ready for nationwide delivery.
            </p>
          </div>

          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => {
              const isActive = (cat.slug && cat.slug.toLowerCase() === categoryIdentifier.toLowerCase()) || 
                               cat.id === categoryIdentifier || 
                               cat.name.toLowerCase() === categoryIdentifier.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug || cat.name)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FAF4EC] text-[#4A2B18] shadow-lg'
                      : 'bg-[#261409]/80 hover:bg-[#4A2B18] text-[#F5EAD8] hover:text-white border border-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section className="sticky top-16 z-30 bg-[#FAF4EC]/95 backdrop-blur-md border-b border-[#EAD8C0] py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C532B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search in ${categoryName}...`}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAD8C0] rounded-xl text-xs text-[#3B2010] placeholder:text-[#8C532B]/60 focus:outline-none focus:border-[#4A2B18] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 text-xs text-[#5A331C] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="rounded border-[#EAD8C0] text-[#4A2B18] focus:ring-0 focus:ring-offset-0 bg-white"
              />
              <span>In Stock Only</span>
            </label>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-[#EAD8C0] rounded-xl px-3 py-2 text-xs text-[#3B2010] focus:outline-none focus:border-[#4A2B18]"
            >
              <option value="POPULAR">Most Popular</option>
              <option value="PRICE_LOW">Price: Low to High</option>
              <option value="PRICE_HIGH">Price: High to Low</option>
              <option value="DISCOUNT">Highest Discount</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 pt-10">
        {sortedProducts清洗.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <p className="text-zinc-500 text-sm uppercase tracking-widest">
              No products found in this sector matching your filters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setOnlyInStock(false); }}
              className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-full text-xs font-black uppercase tracking-wider text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sortedProducts清洗.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-white border border-[#EAD8C0] hover:border-[#4A2B18] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
                >
                  {/* Image container */}
                  <div
                    onClick={() => onProductClick(product)}
                    className="relative aspect-[3/4] w-full overflow-hidden cursor-pointer bg-[#F5EAD8]"
                  >
                    <img
                      src={getImageUrl(product.image || product.images?.[0])}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Discount badge */}
                    {product.offeredDiscount && product.offeredDiscount > 0 ? (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-lg">
                        -{product.offeredDiscount}%
                      </span>
                    ) : null}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-[#4A2B18] hover:bg-[#4A2B18] hover:text-white transition-all"
                      aria-label="Toggle Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div onClick={() => onProductClick(product)} className="cursor-pointer space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#8C532B] truncate">
                        {product.brand || categoryName}
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-[#3B2010] line-clamp-2 leading-snug group-hover:text-[#8C532B] transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#EAD8C0]/70">
                      <div className="space-y-0.5">
                        <div className="text-sm font-black text-[#3B2010] font-mono tabular-nums">
                          GH₵{product.price}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-[10px] text-[#8C532B]/70 line-through font-mono tabular-nums">
                            GH₵{product.originalPrice}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onAddToCart(product)}
                        className="p-2.5 rounded-xl bg-[#4A2B18] text-[#FAF4EC] hover:bg-[#3B2010] transition-all flex items-center justify-center shadow-md active:scale-95"
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
