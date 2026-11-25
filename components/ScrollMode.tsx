import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Info } from 'lucide-react';
import { Product, UserPreferences } from '../types';
import { toast } from 'sonner';
import { sortProductsByProtocol } from '../lib/styleProtocol';

interface ScrollModeProps {
  products: Product[];
  onAddToCart: (product: Product, size?: string, colorVariant?: { main: string; secondary: string }) => void;
  onToggleWishlist: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  wishlist: string[];
  userPrefs: UserPreferences | null;
  cartCount: number;
}

const ScrollMode: React.FC<ScrollModeProps> = ({
  products,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
  wishlist,
  userPrefs,
  cartCount
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSubIndices, setActiveSubIndices] = useState<Record<number, number>>({});
  const [showInstruction, setShowInstruction] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [haulTarget, setHaulTarget] = useState<number>(() => Number(localStorage.getItem('cc-haul-target') || '0'));
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetInput, setTargetInput] = useState<string>(() => localStorage.getItem('cc-haul-target') || '0');
  const [filter, setFilter] = useState<string | null>(null);

  const hasProtocol = useMemo(() => {
    if (!userPrefs) return false;
    return !!(
      userPrefs.styleProtocolCompleted || 
      (userPrefs.preferredCategories && userPrefs.preferredCategories.length > 0) ||
      (userPrefs.preferredGenders && userPrefs.preferredGenders.length > 0) ||
      (userPrefs.styleArchetype && userPrefs.styleArchetype.trim() !== '')
    );
  }, [userPrefs]);

  const processedProducts = useMemo(() => {
    if (hasProtocol) {
      return sortProductsByProtocol(products, userPrefs);
    } else {
      const arr = [...products];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
  }, [products, userPrefs, hasProtocol]);

  const filteredProducts = useMemo(() => {
    if (!filter) return processedProducts;
    return processedProducts.filter(p => p.category === filter);
  }, [processedProducts, filter]);

  const categories = useMemo(() => Array.from(new Set(processedProducts.map(p => p.category))), [processedProducts]);

  const handleFilterToggle = () => {
    if (!filter) setFilter(categories[0]);
    else {
      const idx = categories.indexOf(filter);
      if (idx === categories.length - 1) setFilter(null);
      else setFilter(categories[idx + 1]);
    }
  };

  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent, productIndex: number, product: Product) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) {
        handlePrevSubImage(productIndex, product);
      } else {
        handleNextSubImage(productIndex, product);
      }
    }
    touchStartRef.current = null;
  };

  const handleNextSubImage = (productIndex: number, product: Product) => {
    const images = product.images || [product.image];
    const currentIndex = activeSubIndices[productIndex] || 0;
    setActiveSubIndices(prev => ({
      ...prev,
      [productIndex]: (currentIndex + 1) % images.length
    }));
  };

  const handlePrevSubImage = (productIndex: number, product: Product) => {
    const images = product.images || [product.image];
    const currentIndex = activeSubIndices[productIndex] || 0;
    setActiveSubIndices(prev => ({
      ...prev,
      [productIndex]: currentIndex === 0 ? images.length - 1 : currentIndex - 1
    }));
  };

  const handleEditTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetInput(haulTarget.toString());
    setShowTargetModal(true);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(targetInput, 10);
    if (!isNaN(num) && num >= 0) {
      setHaulTarget(num);
      localStorage.setItem('cc-haul-target', num.toString());
      toast.success(`Bag target updated: ${num} pairs`);
    }
    setShowTargetModal(false);
  };

  const clickTimerRef = useRef<any>(null);
  const lastTapRef = useRef<number>(0);
  const consecutiveTapsRef = useRef<number>(0);

  const handleTap = (product: Product) => {
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      consecutiveTapsRef.current += 1;
    } else {
      consecutiveTapsRef.current = 1;
    }
    lastTapRef.current = now;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      if (consecutiveTapsRef.current === 2) {
        onToggleWishlist(product);
        toast.success(`Saved: ${product.name} added to wishlist`);
      } else if (consecutiveTapsRef.current === 3) {
        onAddToCart(product);
        toast.success(`Added: ${product.name} added to bag`);
      }
      consecutiveTapsRef.current = 0;
    }, 400);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPos = containerRef.current.scrollTop;
    const itemHeight = containerRef.current.clientHeight;
    const index = Math.round(scrollPos / itemHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="fixed inset-0 z-[115] bg-[#1E0F06] overflow-y-scroll snap-y snap-mandatory scrollbar-hide select-none touch-pan-y"
    >
      {/* Feed Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] flex gap-1 px-2 py-1">
        {filteredProducts.map((_, i) => (
          <div 
            key={i} 
            className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= activeIndex ? 'bg-[#E5C9A8]' : 'bg-white/10'}`} 
          />
        ))}
      </div>

      {filteredProducts.map((product, idx) => {
        const isNear = Math.abs(idx - activeIndex) <= 1;
        return (
          <div 
            key={product.id} 
            className="relative h-full w-full snap-start flex flex-col items-center justify-center overflow-hidden"
            onClick={() => handleTap(product)}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, idx, product)}
          >
            {isNear ? (
              <>
                {/* Product Image/Video Background */}
                <div className="absolute inset-0 z-0">
                  {product.video && activeIndex === idx ? (
                    <div className="w-full h-full relative">
                      <video
                        src={product.video}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                      />
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                        }}
                        className="absolute bottom-36 left-6 z-20 w-10 h-10 rounded-full bg-[#261409]/70 hover:bg-[#3B2010] flex items-center justify-center transition-all text-[#FAF4EC] border border-[#E5C9A8]/20 pointer-events-auto active:scale-95"
                        title={isMuted ? "Unmute Video" : "Mute Video"}
                      >
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.img 
                          key={`${product.id}-${activeSubIndices[idx] || 0}`}
                          src={product.images && product.images.length > 0 ? product.images[activeSubIndices[idx] || 0] : product.image} 
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: activeIndex === idx ? 1 : 0.5, scale: activeIndex === idx ? 1 : 1.1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1 }}
                          className="w-full h-full object-cover"
                          alt={product.name}
                        />
                      </AnimatePresence>

                      {/* Sub-image Navigation Controls */}
                      {product.images && product.images.length > 1 && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-between px-4 z-20 pointer-events-none">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handlePrevSubImage(idx, product); }}
                              className="w-10 h-10 rounded-full bg-[#261409]/70 border border-[#E5C9A8]/30 flex items-center justify-center text-[#FAF4EC] hover:bg-[#3B2010] transition-all pointer-events-auto active:scale-90 shadow-md"
                            >
                              ←
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleNextSubImage(idx, product); }}
                              className="w-10 h-10 rounded-full bg-[#261409]/70 border border-[#E5C9A8]/30 flex items-center justify-center text-[#FAF4EC] hover:bg-[#3B2010] transition-all pointer-events-auto active:scale-90 shadow-md"
                            >
                              →
                            </button>
                          </div>

                          {/* Sub-images indicator dots */}
                          <div className="absolute top-1/2 right-16 -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-none">
                            {product.images.map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 h-3 rounded-full transition-all duration-300 ${ (activeSubIndices[idx] || 0) === i ? 'bg-[#E5C9A8] h-6 shadow-[0_0_8px_rgba(229,201,168,0.6)]' : 'bg-white/20'}`} 
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1E0F06]/60 via-transparent to-[#1E0F06]/90 pointer-events-none" />
                </div>

                {/* Product Data Layer */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Action Panel (Right Side) */}
                  <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 pointer-events-auto">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={activeIndex === idx ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <motion.button 
                          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                          whileTap={{ scale: 0.8 }}
                          animate={{ scale: wishlist.includes(product.id) ? [1, 1.4, 0.9, 1.1, 1] : 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            wishlist.includes(product.id) ? 'bg-[#E5C9A8] border-[#E5C9A8] text-[#261409] shadow-lg shadow-[#E5C9A8]/20' : 'bg-[#261409]/70 border-white/20 text-[#FAF4EC] hover:bg-[#3B2010] shadow-md'
                          }`}
                        >
                          <motion.div
                            key={wishlist.includes(product.id) ? 'scroll-wish-yes' : 'scroll-wish-no'}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <Heart size={24} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                          </motion.div>
                        </motion.button>
                        <span className="text-[10px] font-black text-[#FAF4EC] uppercase tracking-tighter">{product.likes || 0}</span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                          className="w-12 h-12 rounded-full bg-[#261409] border border-[#E5C9A8]/30 text-[#FAF4EC] flex items-center justify-center focus:bg-[#E5C9A8] focus:text-[#261409] focus:shadow-[0_0_20px_rgba(229,201,168,0.4)] transition-all duration-300 shadow-2xl"
                        >
                          <ShoppingCart size={24} />
                        </button>
                        <span className="text-[10px] font-black text-[#FAF4EC] uppercase tracking-tighter">Take</span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onViewProduct(product); }}
                          className="w-12 h-12 rounded-full bg-[#261409]/70 border border-white/20 text-[#FAF4EC] flex items-center justify-center hover:bg-[#3B2010] transition-all shadow-md"
                        >
                          <Info size={24} />
                        </button>
                        <span className="text-[10px] font-black text-[#FAF4EC] uppercase tracking-tighter">Info</span>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation();
                            const baseUrl = window.location.origin + window.location.pathname;
                            const shareUrl = `${baseUrl}?productId=${product.id}`;
                            
                            if (navigator.share) {
                              navigator.share({
                                title: product.name,
                                text: `Check out ${product.name} at B.E.C Footwear!`,
                                url: shareUrl,
                              }).catch(console.error);
                            } else {
                              navigator.clipboard.writeText(`${product.name} - ${shareUrl}`);
                              toast.success('Link copied to clipboard!');
                            }
                          }}
                          className="w-12 h-12 rounded-full bg-[#261409]/70 border border-white/20 text-[#FAF4EC] flex items-center justify-center hover:bg-[#3B2010] transition-all active:scale-90 shadow-md"
                        >
                          <Share2 size={24} />
                        </button>
                        <span className="text-[10px] font-black text-[#FAF4EC] uppercase tracking-tighter">Share</span>
                      </div>

                      <div className="mt-4 relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4A2B18] to-[#261409] border-2 border-[#E5C9A8]/30 flex items-center justify-center animate-[spin_3s_linear_infinite]">
                          <div className="w-4 h-4 rounded-full bg-[#261409] border border-white/10 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-[#E5C9A8]" />
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E5C9A8] rounded-full flex items-center justify-center animate-bounce">
                          <div className="w-1 h-1 bg-[#261409] rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Info Panel (Bottom Left) */}
                  <div className="absolute left-6 bottom-24 max-w-[70%]">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={activeIndex === idx ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#E5C9A8] text-[#261409] text-[9px] font-black uppercase tracking-widest rounded-sm">
                          {product.category}
                        </span>
                        {!!product.isNew && (
                          <span className="px-2 py-0.5 bg-[#FAF4EC] text-[#261409] text-[9px] font-black uppercase tracking-widest rounded-sm">
                            NEW
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="text-3xl font-serif italic text-[#FAF4EC] tracking-tighter leading-none mb-1">
                          {product.name}
                        </h2>
                        <p className="text-[#E5C9A8]/80 text-[10px] font-medium leading-tight line-clamp-2 uppercase tracking-tighter">
                          {product.description || "Signature footwear pair from B.E.C Footwear."}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-sans font-black text-[#FAF4EC]">GH₵{product.price}</div>
                        <div className="text-[8px] font-mono text-[#E5C9A8]/60 uppercase tracking-widest">
                          PAIR: {product.id.slice(0, 8)}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Gesture Instruction Overlay */}
                <AnimatePresence>
                  {idx === 0 && activeIndex === 0 && showInstruction && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 1, duration: 1 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1E0F06]/60 pointer-events-auto cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setShowInstruction(false); }}
                    >
                      <div className="bg-[#261409] border border-[#8C532B]/40 p-8 rounded-[2rem] text-center space-y-6 max-w-[280px] shadow-2xl">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-[0.5em]">Quick Controls</div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowInstruction(false); }} 
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-[#E5C9A8]/70 hover:text-white transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-8 h-8 rounded-lg border border-[#E5C9A8]/30 flex items-center justify-center text-[10px] font-bold text-[#FAF4EC]">2X</div>
                            <div className="text-[10px] font-black text-[#FAF4EC] uppercase tracking-widest underline decoration-[#E5C9A8]">Add to Wishlist</div>
                          </div>
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-8 h-8 rounded-lg border border-[#E5C9A8]/30 flex items-center justify-center text-[10px] font-bold text-[#FAF4EC]">3X</div>
                            <div className="text-[10px] font-black text-[#FAF4EC] uppercase tracking-widest underline decoration-white">Add to Bag</div>
                          </div>
                        </div>
                        <div className="text-[8px] font-black text-[#E5C9A8]/60 uppercase tracking-[0.3em] pt-4 border-t border-white/10">
                          Shortcuts
                          <br/><span className="text-[#E5C9A8] mt-2 inline-block">Tap anywhere to dismiss</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="absolute inset-0 bg-[#1E0F06] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#E5C9A8]/20 border-t-[#E5C9A8] animate-spin" />
              </div>
            )}
          </div>
        );
      })}

      <div className="fixed top-8 left-0 w-full z-[120] flex items-center justify-between px-6 pointer-events-none">
        <div className="w-12 h-12 hidden sm:block" />

        {/* Centered Bag Target UI */}
        <div className="flex-1 flex justify-center">
          <button 
            onClick={handleEditTarget}
            className="pointer-events-auto flex items-center gap-6 px-10 py-4 bg-[#261409] border border-[#8C532B]/40 rounded-[2rem] text-[#FAF4EC] shadow-2xl active:scale-95 transition-all group"
          >
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-[#E5C9A8]/70 uppercase tracking-[0.4em] mb-1">Target</span>
              <span className="text-sm font-mono font-black text-[#E5C9A8] group-hover:text-white transition-colors">{haulTarget === 0 ? '∞' : haulTarget}</span>
            </div>
            
            <div className="w-px h-8 bg-[#5A331C]" />
            
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-[#E5C9A8]/70 uppercase tracking-[0.4em] mb-1">Acquired</span>
              <span className={`text-sm font-mono font-black transition-colors ${cartCount >= haulTarget && haulTarget > 0 ? 'text-[#E5C9A8]' : 'text-[#FAF4EC]'}`}>
                {cartCount}
              </span>
            </div>
            
            <div className="hidden sm:flex flex-col items-start ml-2">
              <span className="text-[7px] font-black text-[#E5C9A8]/70 uppercase tracking-widest leading-none">Status</span>
              <span className="text-[9px] font-black uppercase text-[#FAF4EC] tracking-widest">
                {haulTarget === 0 ? 'Browsing' : cartCount >= haulTarget ? 'Goal Reached' : 'Collecting Pairs'}
              </span>
            </div>
          </button>
        </div>

        {/* Right Side Filter Toggle */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={handleFilterToggle}
            className="w-12 h-12 md:w-14 md:h-14 bg-[#261409] border border-[#8C532B]/40 rounded-2xl flex flex-col items-center justify-center text-[#FAF4EC] hover:bg-[#4A2B18] transition-all group relative shadow-2xl"
            title="Filter Footwear"
          >
            <div className="flex flex-col items-center gap-0.5">
               <div className={`w-4 h-0.5 bg-current rounded-full transition-all ${filter ? 'w-2' : ''}`} />
               <div className="w-4 h-0.5 bg-current rounded-full" />
               <div className={`w-4 h-0.5 bg-current rounded-full transition-all ${filter ? 'w-2' : ''}`} />
            </div>
            {filter && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#8C532B] text-[7px] font-black flex items-center justify-center">!</span>
            )}
            <span className="mt-1 text-[6px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 whitespace-nowrap">{filter || 'All'}</span>
          </button>
        </div>
      </div>

      {showTargetModal && (
        <div
          onClick={(e) => { e.stopPropagation(); setShowTargetModal(false); }}
          className="fixed inset-0 z-[130] bg-black/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveTarget}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-[#FAF4EC] border border-[#EAD8C0] rounded-3xl p-6 space-y-4 text-[#261409] shadow-2xl"
          >
            <h3 className="text-lg font-serif italic">Bag Target Safeguard</h3>
            <p className="text-[10px] font-bold text-[#5A331C] uppercase tracking-wider">Set max pairs goal (0 for unlimited)</p>
            <input
              type="number"
              min="0"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-full bg-[#F5EAD8] border border-[#EAD8C0] rounded-xl px-4 py-3 text-sm font-mono font-bold text-[#261409] outline-none focus:border-[#4A2B18]"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F5EAD8] text-[#5A331C] text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#4A2B18] text-[#FAF4EC] text-[10px] font-black uppercase tracking-widest"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default ScrollMode;
