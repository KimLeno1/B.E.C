import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Product, ViewState, UserPreferences, CategoryInfo, RecommendedProductItem } from '../types';
import { BEC_COLLECTIONS, BEC_CONTACT } from '../constants';
import Hero from './Hero';
import {
  Sparkles,
  Shuffle,
  ArrowRight,
  Package,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react';
import { ProductGridSkeleton } from './Skeleton';
import ProductCard from './ProductCard';
import { StylePassportModal } from './StylePassportModal';
import { matchesCategory } from '../lib/categoryUtils';
import { triggerHaptic } from '../lib/haptics';
import { databaseService } from '../services/databaseService';
import { toast } from 'sonner';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HomeLobbyProps {
  userId: string;
  products: Product[];
  categories: CategoryInfo[];
  userHandle: string;
  socialPosts: any[];
  wishlist: string[];
  onNavigate: (view: ViewState) => void;
  onAddToCart: (product: Product, size?: string, colorVariant?: { main: string; secondary: string }) => void;
  onToggleWishlist: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onCompleteQuest: (questId: string) => void;
  onGainRep: (amount: number) => void;
  limitedOfferEnd?: number | null;
  onResetLimitedOffer?: () => void;
  onToggleCompare?: (product: Product) => void;
  comparisonList?: Product[];
  isInitializing?: boolean;
  isAuthenticated?: boolean;
  tutorialFinished?: boolean;
  userPrefs?: UserPreferences;
  onUserPrefsUpdated?: (prefs: UserPreferences) => void;
  onQuickBuy?: (product: Product) => void;
  productError?: string | null;
  onRetryProducts?: () => void;
}

const HomeLobby: React.FC<HomeLobbyProps> = ({
  userId,
  products = [],
  categories = [],
  onNavigate,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
  onToggleCompare,
  comparisonList = [],
  userPrefs: initialUserPrefs,
  onUserPrefsUpdated,
  onQuickBuy,
  limitedOfferEnd,
  isInitializing = false,
  productError = null,
  onRetryProducts,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSort, setActiveSort] = useState<'random' | 'price_asc' | 'price_desc' | 'newest'>('random');
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [currentUserPrefs, setCurrentUserPrefs] = useState<UserPreferences | undefined>(initialUserPrefs);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [dislikedIds, setDislikedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('closet-kraze-dislikes');
      const local = stored ? JSON.parse(stored) : [];
      return [...new Set([...(initialUserPrefs?.dislikedProductIds || []), ...local])];
    } catch {
      return initialUserPrefs?.dislikedProductIds || [];
    }
  });

  useEffect(() => {
    if (initialUserPrefs) {
      setCurrentUserPrefs(initialUserPrefs);
      if (initialUserPrefs.dislikedProductIds) {
        setDislikedIds(prev => [...new Set([...prev, ...(initialUserPrefs.dislikedProductIds || [])])]);
      }
    }
  }, [initialUserPrefs]);

  useEffect(() => {
    setShuffleSeed(Date.now() + Math.floor(Math.random() * 1000000));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShuffle = useCallback(() => {
    triggerHaptic('selection');
    setShuffleSeed(Date.now() + Math.floor(Math.random() * 10000));
    setActiveSort('random');
    toast.success('Footwear catalog shuffled!');
  }, []);

  const handleDislikeProduct = async (product: Product) => {
    setDislikedIds(prev => [...prev, product.id]);
    toast.info(`Got it. We will avoid recommending "${product.name}".`);
    try {
      await databaseService.dislikeProduct(userId, product.id);
    } catch (e) {
      console.warn('Failed to record dislike:', e);
    }
  };

  const handleTogglePersonalization = async () => {
    const nextState = currentUserPrefs ? currentUserPrefs.personalizationEnabled === false : false;
    const updated: UserPreferences = {
      preferredCategories: [],
      preferredGenders: [],
      ...(currentUserPrefs || {}),
      userId,
      personalizationEnabled: nextState,
    };
    setCurrentUserPrefs(updated);
    if (onUserPrefsUpdated) onUserPrefsUpdated(updated);
    toast.success(nextState ? 'Personalized footwear picks enabled' : 'Personalized shelf hidden');
    try {
      await databaseService.togglePersonalization(userId, nextState);
    } catch (e) {
      console.warn('Failed to update personalization setting:', e);
    }
  };

  const handlePreferencesUpdated = (newPrefs: UserPreferences) => {
    setCurrentUserPrefs(newPrefs);
    if (onUserPrefsUpdated) onUserPrefsUpdated(newPrefs);
  };

  const hasConfiguredPassport = useMemo(() => {
    if (!currentUserPrefs) return false;
    const hasAesthetics = Array.isArray(currentUserPrefs.aesthetics) && currentUserPrefs.aesthetics.length > 0;
    const hasColors = Array.isArray(currentUserPrefs.favoriteColors) && currentUserPrefs.favoriteColors.length > 0;
    const hasCats = Array.isArray(currentUserPrefs.preferredCategories) && currentUserPrefs.preferredCategories.length > 0;
    return hasAesthetics || hasColors || hasCats || !!currentUserPrefs.styleSummary;
  }, [currentUserPrefs]);

  const isPersonalizationActive = currentUserPrefs ? currentUserPrefs.personalizationEnabled !== false : true;

  const activeProducts = useMemo(() => {
    return products.filter(p => !dislikedIds.includes(p.id));
  }, [products, dislikedIds]);

  const curatedPicks = useMemo((): RecommendedProductItem[] => {
    if (!isPersonalizationActive || activeProducts.length === 0) return [];

    const userAesthetics = (currentUserPrefs?.aesthetics || []).map(a => a.toLowerCase());
    const userColors = (currentUserPrefs?.favoriteColors || currentUserPrefs?.colorPreferences || []).map(c => c.toLowerCase());
    const userCategories = (currentUserPrefs?.preferredCategories || []).map(c => c.toLowerCase());

    const scored = activeProducts.map(product => {
      let score = 0;
      let matchedReason = '';

      if (product.category && userCategories.includes(product.category.toLowerCase())) {
        score += 3;
        matchedReason = `${product.category} preference`;
      }

      const prodTags = Array.isArray(product.tags) ? product.tags : [];
      const prodText = `${product.name} ${product.description || ''} ${prodTags.join(' ')}`.toLowerCase();

      for (const aes of userAesthetics) {
        if (prodText.includes(aes)) {
          score += 4;
          matchedReason = `Matches ${aes}`;
          break;
        }
      }

      const prodColors = Array.isArray(product.colors) ? product.colors : [];
      for (const col of userColors) {
        if (prodColors.some(pc => pc.toLowerCase().includes(col)) || prodText.includes(col)) {
          score += 2;
          if (!matchedReason) matchedReason = `${col} tone`;
          break;
        }
      }

      if (score === 0) {
        score = 1;
        matchedReason = 'Everyday B.E.C favorite';
      }

      return { product, reason: matchedReason, matchScore: score, score };
    });

    return scored
      .sort((a, b) => (b.score || b.matchScore) - (a.score || a.matchScore))
      .slice(0, 4);
  }, [activeProducts, currentUserPrefs, isPersonalizationActive]);

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'All'
      ? [...activeProducts]
      : activeProducts.filter(p => matchesCategory(p, activeCategory, categories));

    if (activeSort === 'random') {
      const arr = [...list];
      for (let i = arr.length - 1; i > 0; i--) {
        const pseudoVal = Math.abs(Math.sin(shuffleSeed + i * 997 + (arr[i]?.name?.length || i)));
        const j = Math.floor(pseudoVal * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    } else if (activeSort === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price_desc') {
      return [...list].sort((a, b) => b.price - a.price);
    } else if (activeSort === 'newest') {
      return [...list].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return list;
  }, [activeProducts, activeCategory, categories, activeSort, shuffleSeed]);

  const categoryTabs = useMemo(() => {
    const fromCategories = categories.map(c => c.name).filter(Boolean);
    const merged = Array.from(new Set(['All', ...BEC_COLLECTIONS, ...fromCategories]));
    return merged.slice(0, 7);
  }, [categories]);

  const scrollToProducts = () => {
    triggerHaptic('selection');
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectHeroCategory = (categoryName: string) => {
    triggerHaptic('selection');
    setActiveCategory(categoryName);
    setVisibleCount(12);
    setTimeout(() => {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#261409] font-sans selection:bg-[#4A2B18] selection:text-[#FAF4EC] pb-14 overflow-x-hidden">
      {/* 1. Asymmetric Editorial Hero */}
      <Hero onShopNow={scrollToProducts} onSelectCategory={handleSelectHeroCategory} />

      {/* 2. Featured Footwear Catalog Grid */}
      <section
        ref={productsSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#EAD8C0]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#4A2B18] leading-tight">
              {activeCategory === 'All' ? 'Our Top Collection' : activeCategory}
            </h2>
            <p className="mt-1 text-xs text-[#7C5A43] tabular-nums">
              {filteredProducts.length} pairs available · EU 38–45 · Nationwide delivery
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffle}
              className="min-h-[40px] px-3.5 rounded-lg bg-[#F5EAD8] hover:bg-[#EAD8C0] text-[#4A2B18] text-xs font-semibold flex items-center gap-1.5 border border-[#DFC5A4] transition-colors cursor-pointer"
              title="Shuffle catalog"
            >
              <Shuffle size={14} />
              <span>Shuffle</span>
            </button>

            <div ref={sortDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="min-h-[40px] px-3.5 rounded-lg bg-[#FFFCF7] border border-[#EAD8C0] hover:border-[#4A2B18]/45 text-[#4A2B18] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>Sort</span>
                <ChevronDown size={13} />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-12 z-30 w-44 bg-[#FFFCF7] border border-[#EAD8C0] rounded-xl shadow-lg p-1.5 space-y-1">
                  {[
                    { id: 'random', label: 'Featured Mix' },
                    { id: 'newest', label: 'New Arrivals' },
                    { id: 'price_asc', label: 'Price: Low to High' },
                    { id: 'price_desc', label: 'Price: High to Low' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setActiveSort(option.id as any);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                        activeSort === option.id
                          ? 'bg-[#4A2B18] text-[#FAF4EC]'
                          : 'text-[#5A331C] hover:bg-[#F5EAD8]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Segmented Category Filter Strip */}
        <div className="mt-4 overflow-x-auto scrollbar-hide">
          <div className="inline-flex items-center gap-1 p-1 bg-[#F5EAD8] border border-[#EAD8C0] rounded-xl min-w-max">
            {categoryTabs.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveCategory(cat);
                    setVisibleCount(12);
                  }}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-xs'
                      : 'text-[#5A331C] hover:text-[#261409] hover:bg-[#FAF4EC]/70'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="pt-6">
          {isInitializing ? (
            <ProductGridSkeleton count={8} />
          ) : productError ? (
            <div className="py-12 text-center bg-[#FFFCF7] border border-[#EAD8C0] rounded-2xl p-6 space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="text-sm font-bold text-[#261409]">Couldn&apos;t load footwear catalog</h3>
              <p className="text-xs text-[#7C5A43] max-w-xs mx-auto">{productError}</p>
              {onRetryProducts && (
                <button
                  type="button"
                  onClick={onRetryProducts}
                  className="px-4 py-2 rounded-lg bg-[#4A2B18] text-[#FAF4EC] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-[#FFFCF7] border border-[#EAD8C0] rounded-2xl p-6 space-y-3">
              <Package className="w-10 h-10 text-[#C5A482] mx-auto" />
              <p className="text-sm font-semibold text-[#4A2B18]">No pairs found in {activeCategory}</p>
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="px-4 py-2 rounded-lg bg-[#4A2B18] text-[#FAF4EC] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Show All Collections
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={onProductClick}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                  saleTimerEnd={product.price < product.originalPrice ? limitedOfferEnd : null}
                  onQuickBuy={onQuickBuy}
                  onToggleCompare={onToggleCompare}
                  isComparing={comparisonList.some(item => item.id === product.id)}
                />
              ))}
            </div>
          )}

          {!isInitializing && visibleCount < filteredProducts.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setVisibleCount(prev => Math.min(prev + 12, filteredProducts.length));
                }}
                className="min-h-[44px] px-7 rounded-lg bg-[#FFFCF7] border border-[#EAD8C0] hover:border-[#4A2B18] text-[#4A2B18] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Load More Pairs</span>
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Tailored Rotation & Multi-Pair Value Sets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 pt-10 border-t border-[#EAD8C0] space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personalized Fit Profile Control */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#4A2B18] text-[#FAF4EC] flex flex-col justify-between gap-5">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#E5C9A8]">
                {hasConfiguredPassport ? 'Your Fit Profile' : 'Personalized Footwear Picks'}
              </p>
              <h3 className="text-xl font-serif italic font-bold text-[#FAF4EC]">
                {currentUserPrefs?.styleSummary
                  ? `"${currentUserPrefs.styleSummary}"`
                  : hasConfiguredPassport
                  ? 'Clogs, slides & sandals matched to your rotation.'
                  : 'Tailor Picks to Your EU Size & Taste'}
              </h3>
              <p className="text-xs text-[#E5C9A8]/90 leading-relaxed">
                Save your preferred silhouettes and colors for quicker browsing every visit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsPassportOpen(true);
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[#FAF4EC] hover:bg-white text-[#261409] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-[#8C532B]" />
                <span>{hasConfiguredPassport ? 'Edit Preferences' : 'Set Preferences'}</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePersonalization}
                className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#3B2010] hover:bg-[#261409] text-[#E5C9A8] text-xs font-semibold inline-flex items-center gap-1.5 border border-[#FAF4EC]/15 transition-colors cursor-pointer"
              >
                {isPersonalizationActive ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{isPersonalizationActive ? 'Hide Picks' : 'Show Picks'}</span>
              </button>
            </div>
          </div>

          {/* Multi-Pair Bundles Spotlight */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onNavigate(ViewState.BUNDLES);
            }}
            className="p-6 sm:p-7 rounded-2xl bg-[#FFFCF7] border border-[#EAD8C0] hover:border-[#4A2B18]/45 text-left flex flex-col justify-between gap-5 transition-all hover:shadow-md cursor-pointer group"
          >
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#8C532B] inline-flex items-center gap-1.5">
                <Package size={14} />
                <span>Multi-Pair Savings</span>
              </p>
              <h3 className="text-xl font-serif italic font-bold text-[#4A2B18]">
                Footwear Pairs &amp; Value Sets
              </h3>
              <p className="text-xs text-[#7C5A43] leading-relaxed max-w-md">
                Pair all-terrain clogs with classic or studded slides in curated bundle packs with built-in multi-pair discounts.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A2B18] group-hover:translate-x-1 transition-transform">
              <span>Browse Footwear Sets</span>
              <ArrowRight size={14} />
            </div>
          </button>
        </div>

        {/* Single Streamlined Tailored Shelf */}
        {isPersonalizationActive && !isInitializing && curatedPicks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-[#EAD8C0] pb-2.5">
              <h3 className="text-lg sm:text-xl font-serif italic font-bold text-[#4A2B18]">
                Picked For Your Rotation
              </h3>
              <span className="text-xs text-[#7C5A43]">
                Based on your footwear preferences
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {curatedPicks.map(item => (
                <ProductCard
                  key={`curated-${item.product.id}`}
                  product={item.product}
                  onClick={onProductClick}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(item.product.id)}
                  onQuickBuy={onQuickBuy}
                  onToggleCompare={onToggleCompare}
                  isComparing={comparisonList.some(c => c.id === item.product.id)}
                  recommendationReason={item.reason}
                  onDislike={handleDislikeProduct}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. Direct Order, Nationwide Delivery & Payment Assurance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-14">
        <div className="bg-[#FFFCF7] border border-[#EAD8C0] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#EAD8C0]">
          <div className="space-y-3 md:pr-6">
            <h4 className="text-sm font-serif italic font-bold text-[#4A2B18]">
              Order Direct via Call or WhatsApp
            </h4>
            <p className="text-xs text-[#7C5A43] leading-relaxed">
              Confirm EU sizes, color availability, or arrange urgent nationwide dispatch with our team.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {BEC_CONTACT.phones.map((phone) => (
                <a
                  key={phone.display}
                  href={`https://wa.me/${phone.whatsapp}?text=${encodeURIComponent('Hello B.E.C Footwear, I would like to ask about available pairs.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FAF4EC] hover:bg-[#4A2B18] text-[#4A2B18] hover:text-[#FAF4EC] border border-[#EAD8C0] text-xs font-mono font-bold tabular-nums transition-colors"
                >
                  <WhatsAppIcon size={13} title={`WhatsApp ${phone.display}`} />
                  <span>{phone.display}</span>
                </a>
              ))}
              <a
                href={`tel:${BEC_CONTACT.phones[0].tel}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4A2B18] hover:bg-[#261409] text-[#FAF4EC] text-xs font-semibold transition-colors"
              >
                <Phone size={12} />
                <span>Call Line</span>
              </a>
            </div>
          </div>

          <div className="pt-5 md:pt-0 md:px-6 space-y-2">
            <h4 className="text-sm font-serif italic font-bold text-[#4A2B18]">
              Nationwide Delivery Across Ghana
            </h4>
            <p className="text-xs text-[#7C5A43] leading-relaxed">
              Fast doorstep dispatch to Accra, Kumasi, Takoradi, Tamale, Cape Coast, and all 16 regions with inspected sole cushioning and strap finish on every pair.
            </p>
          </div>

          <div className="pt-5 md:pt-0 md:pl-6 space-y-2">
            <h4 className="text-sm font-serif italic font-bold text-[#4A2B18]">
              Mobile Money &amp; Card Checkout
            </h4>
            <p className="text-xs text-[#7C5A43] leading-relaxed">
              Pay securely online with MTN MoMo, Telecel Cash, Visa/Mastercard, or confirm cash-on-delivery arrangements via WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <StylePassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        userId={userId}
        initialPreferences={currentUserPrefs}
        onPreferencesUpdated={handlePreferencesUpdated}
      />
    </div>
  );
};

export default HomeLobby;
