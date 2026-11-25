import React, { useMemo } from 'react';
import { Product, Category, CategoryInfo } from '../types';
import { CATEGORY_GROUPS } from '../constants';
import { getImageUrl } from '../lib/imageUtils';
import LazyImage from './LazyImage';
import { matchesCategory } from '../lib/categoryUtils';

interface CategoryProductsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  products: Product[];
  categories: CategoryInfo[];
  onProductSelect: (p: Product) => void;
  limitedOfferEnd?: number | null;
}

const CategoryProductsPanel: React.FC<CategoryProductsPanelProps> = ({ 
  isOpen, 
  onClose, 
  category, 
  products, 
  categories,
  onProductSelect,
  limitedOfferEnd
}) => {
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    if (!limitedOfferEnd) return;
    const timer = setInterval(() => {
      const seconds = Math.max(0, Math.floor((limitedOfferEnd - Date.now()) / 1000));
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [limitedOfferEnd]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => matchesCategory(p, category, categories));
  }, [category, products, categories]);

  // Find category info for hero/inspiration
  const categoryInfo = React.useMemo(() => {
    if (category === 'All') return null;
    const lower = category.toLowerCase();
    return categories.find(c => 
      c.id === category || 
      c.name.toLowerCase() === lower || 
      (c.slug && c.slug.toLowerCase() === lower)
    );
  }, [category, categories]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#261409] z-[310] shadow-2xl transition-transform duration-500 ease-out border-l border-[#5A331C]/40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <header className="relative h-64 sm:h-80 shrink-0 overflow-hidden">
            <div className="absolute inset-0">
              {categoryInfo?.heroImage ? (
                <LazyImage src={categoryInfo.heroImage} className="w-full h-full object-cover" alt={category} />
              ) : (
                <div className="w-full h-full bg-[#3B2010]"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#261409] via-[#261409]/50 to-transparent"></div>
            </div>

            <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-4">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#FAF4EC] hover:bg-[#FAF4EC] hover:text-[#3B2010] transition-all rounded-full z-10"
              >
                <span className="text-lg">✕</span>
              </button>

              <div className="space-y-2">
                <div className="text-[8px] font-black text-[#E5C9A8] uppercase tracking-[0.5em]">B.E.C Footwear Collection</div>
                <h2 className="text-3xl sm:text-4xl font-serif italic text-[#FAF4EC] tracking-tighter">
                  {category === 'All' ? 'Full Collection' : category}
                </h2>
                {categoryInfo?.inspiration && (
                  <p className="text-[9px] text-[#E5C9A8]/80 uppercase tracking-widest italic leading-relaxed max-w-[80%]">
                    "{categoryInfo.inspiration}"
                  </p>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 sm:p-8">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex justify-between items-center">
                <div className="text-[9px] sm:text-[10px] font-black text-[#E5C9A8]/70 uppercase tracking-widest">Available Pairs</div>
                <div className="text-[9px] sm:text-[10px] font-mono text-[#E5C9A8] tabular-nums">{filteredProducts.length} Pairs</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onProductSelect(product);
                      onClose();
                    }}
                    className="group space-y-3 text-left"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-[#3B2010] border border-[#5A331C]/40 rounded-2xl relative">
                      <LazyImage src={getImageUrl(product.image)} className="w-full h-full object-cover transition-all duration-700" alt={product.name} />
                      {!!product.isNew && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#4A2B18] text-[8px] font-black text-[#FAF4EC] uppercase tracking-widest rounded">
                          New
                        </div>
                      )}
                      {product.price < product.originalPrice && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1 rounded">
                          <span>Sale</span>
                          {limitedOfferEnd && timeLeft && (
                            <span className="font-mono border-l border-white/20 pl-1">{timeLeft}</span>
                          )}
                        </div>
                      )}
                      {product.appeal && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/75 backdrop-blur-md border border-white/10 text-[8px] font-black text-[#FAF4EC] uppercase tracking-widest rounded">
                          {product.appeal}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-[#FAF4EC] uppercase tracking-widest truncate">{product.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-mono font-bold text-[#E5C9A8] tabular-nums">GH₵{product.price}</div>
                        {product.price < product.originalPrice && (
                          <div className="text-[8px] font-mono text-[#E5C9A8]/50 line-through tabular-nums">GH₵{product.originalPrice}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <footer className="p-8 bg-[#1E0F06] border-t border-[#5A331C]/40">
            <div className="flex items-center justify-between text-[8px] font-black text-[#E5C9A8]/70 uppercase tracking-[0.3em]">
              <span>Nationwide Delivery</span>
              <span>0244122075</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default CategoryProductsPanel;
