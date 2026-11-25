import React, { useState } from 'react';
import { Bundle, Product, ViewState } from '../types';
import { Skeleton } from './Skeleton';
import { MessageSquare, Sparkles, Eye, Layers, ArrowUpRight, CheckCircle2, ShieldCheck, Compass, Loader2 } from 'lucide-react';
import { getImageUrl } from '../lib/imageUtils';

interface BundlesProps {
  bundles: Bundle[];
  onAddBundle: (bundle: Bundle) => void;
  loading?: boolean;
  onProductClick?: (product: Product) => void;
  onNavigate?: (view: ViewState) => void;
}

export const Bundles: React.FC<BundlesProps> = ({ 
  bundles, 
  onAddBundle, 
  loading = false,
  onProductClick,
  onNavigate
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addingBundleId, setAddingBundleId] = useState<string | null>(null);

  const getWhatsAppUrl = (bundle: Bundle, originalTotal: number) => {
    const savings = originalTotal - bundle.bundlePrice;
    const text = `✨ *B.E.C FOOTWEAR PACK: ${bundle.name}* ✨\n\n${bundle.description}\n\n🏷️ *Price:* GH₵${bundle.bundlePrice} *(Save GH₵${savings})*\n📦 Nationwide Delivery Across Ghana\n📞 Call/WhatsApp: 0244122075 / 0260584440`;
    return `https://wa.me/233244122075?text=${encodeURIComponent(text)}`;
  };

  const handleProductCardClick = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (!onProductClick) return;

    // Normalize product object to ensure all required fields for ProductDetail
    const normalizedProduct: Product = {
      id: product.id || `prod_${Date.now()}`,
      name: product.name || 'B.E.C Footwear Pair',
      price: product.price || 280,
      originalPrice: product.originalPrice || product.price || 340,
      image: product.image || (product.images && product.images[0]) || '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
      images: product.images && product.images.length > 0 
        ? product.images 
        : [product.image || '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg'],
      category: product.category || 'All-terrain clogs',
      description: product.description || 'Crafted footwear curated by B.E.C Footwear with nationwide delivery across Ghana.',
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['39', '40', '41', '42', '43', '44'],
      inStock: product.inStock !== false,
      stock: product.stock ?? 10,
      isGrail: Boolean(product.isGrail),
      isFamous: Boolean(product.isFamous),
      isNewDrop: Boolean(product.isNewDrop),
      tags: product.tags || ['B.E.C Footwear', 'Nationwide'],
      views: product.views || 0,
      purchases: product.purchases || 0,
      rating: product.rating || 4.9,
      reviewCount: product.reviewCount || 12,
      supplierId: product.supplierId || 'bec_internal',
      ...product
    };

    onProductClick(normalizedProduct);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 space-y-12 pb-32 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-20">
          <div className="space-y-4 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 md:h-32 w-64" />
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
          <Skeleton className="h-4 w-48 hidden md:block" />
        </header>

        <div className="space-y-24">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="py-24 space-y-12">
              <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16" />
                    <Skeleton className="h-12 w-64" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-lg" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-8 w-48 ml-auto" />
                  <Skeleton className="h-4 w-32 ml-auto" />
                </div>
              </div>
              <div className="flex gap-8 overflow-hidden">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="min-w-[280px] md:min-w-[320px] aspect-[3/4]" />
                ))}
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-16 w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 space-y-8 animate-in fade-in duration-500 pb-32 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EAD8C0] pb-8 sm:pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#4A2B18] animate-pulse"></div>
             <span className="text-[10px] font-black text-[#8C532B] uppercase tracking-[0.4em]">B.E.C Footwear • Multi-Pair Packs</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif italic text-[#3B2010] tracking-tighter leading-none">Pairs &amp; Packs</h1>
          <p className="text-[#5A331C] text-xs sm:text-sm max-w-xl leading-relaxed">
            Curated B.E.C Footwear bundles combining clogs, slides, and sandals at special multi-pair pricing with nationwide delivery.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <span className="text-[10px] font-black text-[#8C532B] uppercase tracking-[0.35em]">NATIONWIDE DELIVERY</span>
        </div>
      </header>

      {/* Group Order Banner */}
      <div className="p-6 bg-[#4A2B18] text-[#FAF4EC] border border-[#5A331C] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAF4EC]/15 flex items-center justify-center text-[#E5C9A8] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[#FAF4EC] text-xs font-black uppercase tracking-widest">Multi-Pair Savings Active</h3>
            <p className="text-[#E5C9A8] text-[11px] mt-0.5">Save instantly on curated B.E.C clogs, slides &amp; sandals packs—plus automatic 10% group savings on 3+ packs.</p>
          </div>
        </div>
        <div className="text-[10px] font-black text-[#3B2010] uppercase tracking-[0.25em] bg-[#FAF4EC] px-4 py-2 rounded-lg whitespace-nowrap">
          0244122075 / 0260584440
        </div>
      </div>

      {bundles.length === 0 ? (
        <div className="py-20 px-6 rounded-3xl border border-[#EAD8C0] bg-white text-center space-y-6 max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF4EC] border border-[#EAD8C0] text-[#4A2B18] mx-auto flex items-center justify-center">
            <Layers className="w-8 h-8 text-[#4A2B18]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif italic text-[#3B2010]">No Pair Packs Currently Active</h3>
            <p className="text-xs sm:text-sm text-[#5A331C] max-w-md mx-auto leading-relaxed font-sans">
              All individual clogs, slides, sandals, and slippers remain available in our collection.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate(ViewState.CATEGORIES)}
                className="px-6 py-3 rounded-xl bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Collections</span>
              </button>
            )}
            <a
              href="https://wa.me/233244122075?text=Hello%20B.E.C%20Footwear%2C%20I%20would%20like%20to%20order%20a%20custom%20multi-pair%20footwear%20pack!"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-[#FAF4EC] hover:bg-[#F5EAD8] text-[#3B2010] border border-[#EAD8C0] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Order Custom Pack on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {bundles.map((bundle, idx) => {
          const originalTotal = bundle.products && bundle.products.length > 0 
            ? bundle.products.reduce((acc: number, p: any) => acc + (p.originalPrice || p.price || 100), 0)
            : bundle.originalPrice || bundle.bundlePrice * 1.2;
          const savings = originalTotal - bundle.bundlePrice;
          const discountPercent = Math.round((savings / originalTotal) * 100);
          const hasProducts = bundle.products && bundle.products.length > 0;

          return (
            <div key={bundle.id} className="group py-14 md:py-20 space-y-10 bg-white border border-[#EAD8C0] my-6 px-5 sm:px-8 rounded-3xl shadow-sm">
              {/* Bundle Header & Pricing */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-[#EAD8C0] group-hover:text-[#8C532B] transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-[#3B2010]">{bundle.name}</h2>
                  </div>
                  <p className="text-[#5A331C] text-xs uppercase tracking-[0.18em] max-w-xl leading-relaxed">
                    {bundle.description}
                  </p>
                </div>
                
                <div className="text-left md:text-right space-y-2 shrink-0 bg-[#FAF4EC] md:bg-transparent p-4 md:p-0 rounded-2xl border border-[#EAD8C0] md:border-0 w-full md:w-auto">
                  <div className="flex items-center md:justify-end gap-4">
                    <span className="text-[#8C532B]/70 line-through font-mono text-lg md:text-xl tabular-nums">GH₵{originalTotal}</span>
                    <span className="text-3xl md:text-4xl font-mono font-black text-[#3B2010] tabular-nums">GH₵{bundle.bundlePrice}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#4A2B18] uppercase tracking-[0.25em] bg-[#F5EAD8] px-3 py-1 rounded-full border border-[#EAD8C0] tabular-nums">
                    <Sparkles size={11} />
                    Save GH₵{savings} (-{discountPercent}%)
                  </div>
                </div>
              </div>

              {/* INDIVIDUAL PRODUCTS BREAKDOWN IN BUNDLE */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAD8C0] pb-3">
                  <div className="flex items-center gap-2.5">
                    <Layers className="text-[#4A2B18]" size={16} />
                    <h3 className="text-xs sm:text-sm font-mono font-black text-[#3B2010] uppercase tracking-[0.2em]">
                      Included Pairs ({bundle.products?.length || 0} pairs)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#8C532B] flex items-center gap-1.5">
                    <Eye size={13} className="text-[#4A2B18]" />
                    <span>Tap any pair to view EU sizes &amp; details</span>
                  </span>
                </div>

                {hasProducts ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-2">
                    {bundle.products.map((product: any, pIdx: number) => {
                      const itemImg = getImageUrl(product.image || (product.images && product.images[0]));
                      return (
                        <div
                          key={product.id || pIdx}
                          onClick={(e) => handleProductCardClick(e, product)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleProductCardClick(e as any, product);
                            }
                          }}
                          className="group/card relative bg-[#FAF4EC] border border-[#EAD8C0] hover:border-[#4A2B18] hover:shadow-lg rounded-2xl p-3 sm:p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                        >
                          <div className="aspect-[3/4] w-full bg-[#F5EAD8] rounded-xl overflow-hidden relative border border-[#EAD8C0] mb-3">
                            <img 
                              src={itemImg} 
                              alt={product.name || 'B.E.C Footwear pair'}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" 
                              loading="lazy"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#4A2B18]/90 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold text-[#FAF4EC]">
                              <span>Pair {String(pIdx + 1).padStart(2, '0')}</span>
                            </div>
                            <div className="absolute top-2 right-2 bg-[#FAF4EC] text-[#3B2010] px-2 py-1 rounded-md text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity shadow-lg">
                              <Eye size={11} />
                              <span>Inspect</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] font-mono font-bold text-[#8C532B] uppercase tracking-widest truncate">
                                {product.category || 'B.E.C Footwear'}
                              </span>
                              {product.sizes && product.sizes.length > 0 && (
                                <span className="text-[8px] font-mono text-[#4A2B18] bg-white px-1.5 py-0.5 rounded border border-[#EAD8C0] tabular-nums">
                                  EU {product.sizes.slice(0, 3).join('/')}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-[#3B2010] group-hover/card:text-[#8C532B] transition-colors line-clamp-1">
                              {product.name || 'B.E.C Footwear Pair'}
                            </h4>

                            <div className="flex items-center justify-between pt-1 border-t border-[#EAD8C0]">
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-mono text-[#8C532B] uppercase block">Single Price</span>
                                <span className="text-xs font-mono font-bold text-[#3B2010] tabular-nums">
                                  GH₵{product.price || 280}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => handleProductCardClick(e, product)}
                                className="px-2.5 py-1 bg-white hover:bg-[#4A2B18] hover:text-[#FAF4EC] text-[#4A2B18] text-[9px] font-mono font-bold uppercase rounded-lg border border-[#EAD8C0] transition-all flex items-center gap-1 shadow-sm"
                              >
                                <Eye size={10} />
                                <span>View</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FAF4EC] border border-[#EAD8C0] text-center space-y-2">
                    <p className="text-xs font-mono text-[#5A331C]">Curated pairs are synchronized into this bundle.</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#EAD8C0]">
                <a
                  href={getWhatsAppUrl(bundle, originalTotal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setCopiedId(bundle.id);
                    setTimeout(() => setCopiedId(null), 3000);
                  }}
                  className="h-14 px-6 sm:px-8 bg-[#25D366]/15 border border-[#25D366]/40 text-[#128C7E] text-[10px] font-mono font-black uppercase tracking-[0.25em] hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-3 rounded-2xl shadow-sm active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  {copiedId === bundle.id ? 'Opening WhatsApp...' : 'Order Pack on WhatsApp'}
                </a>

                <button 
                  type="button"
                  disabled={addingBundleId === bundle.id}
                  onClick={() => {
                    if (addingBundleId) return;
                    setAddingBundleId(bundle.id);
                    setTimeout(() => {
                      onAddBundle(bundle);
                      setAddingBundleId(null);
                    }, 400);
                  }}
                  className={`h-14 sm:h-16 px-8 sm:px-14 text-[11px] font-mono font-black uppercase tracking-[0.25em] transition-all active:scale-95 rounded-2xl flex items-center justify-center gap-3 cursor-pointer ${
                    addingBundleId === bundle.id
                      ? 'bg-[#3B2010] text-[#E5C9A8] border border-[#E5C9A8] shadow-xl'
                      : 'bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] shadow-lg'
                  }`}
                >
                  {addingBundleId === bundle.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E5C9A8]" />
                      <span>Adding Pack...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Add Pack to Bag (GH₵{bundle.bundlePrice})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default Bundles;
