import React, { useState, useEffect } from 'react';
import { CartItem, ViewState, PromoCode, RankBenefits, UserStats } from '../types';
import { getImageUrl } from '../lib/imageUtils';
import LazyImage from './LazyImage';
import { databaseService } from '../services/databaseService';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, Lock } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string, size?: string, colorVariant?: { main: string; secondary: string }) => void;
  onUpdateQuantity: (id: string, delta: number, size?: string, colorVariant?: { main: string; secondary: string }) => void;
  onClear: () => void;
  onNavigate?: (view: ViewState) => void;
  activePromo?: PromoCode | null;
  rank: RankBenefits;
  currentView: ViewState;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity, 
  onClear, 
  onNavigate,
  activePromo,
  rank,
  currentView
}) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [applyCredit, setApplyCredit] = useState(false);
  const [haulTarget, setHaulTarget] = useState<number>(() => Number(localStorage.getItem('cc-haul-target') || '0'));
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    localStorage.setItem('cc-haul-target', haulTarget.toString());
  }, [haulTarget]);

  useEffect(() => {
    const fetchUserStats = async () => {
      const userId = localStorage.getItem('cc-user-id');
      if (userId && isOpen) {
        try {
          const stats = await databaseService.getUserStats(userId);
          setUserStats(stats);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchUserStats();
  }, [isOpen]);

  const subtotalProductsMarket = items.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalShipping = items.reduce((acc, item) => acc + ((item.shippingFee || 0) * item.quantity), 0);
  
  // Base valuation is the shop price
  const subtotalShopPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  let baseValuation = subtotalShopPrice;
  
  // Apply Promo Fragment
  if (activePromo) {
    if (activePromo.type === 'PERCENT') {
      baseValuation = baseValuation * (1 - activePromo.value / 100);
    } else {
      baseValuation = Math.max(0, baseValuation - activePromo.value);
    }
  }

  const finalValuationBeforeCredit = Math.floor(baseValuation + totalShipping);
  
  const availableCredit = userStats?.storeCredit || 0;
  const appliedCredit = applyCredit ? Math.min(availableCredit, finalValuationBeforeCredit) : 0;
  const finalValuation = finalValuationBeforeCredit - appliedCredit;

  const [expiry, setExpiry] = useState(600); // 10 minutes
  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const timer = setInterval(() => {
      setExpiry(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, items]);

  const min = Math.floor(expiry / 60);
  const sec = expiry % 60;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-[200] transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full md:max-w-xl bg-white z-[210] shadow-[-30px_0_100px_rgba(0,0,0,0.1)] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l border-zinc-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col relative overflow-hidden">
          
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

          <header id="cart-drawer-header" className="relative z-10 px-5 py-6 md:px-12 md:py-10 flex justify-between items-start border-b border-[#EAD8C0] bg-[#FAF4EC]">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="B.E.C Footwear" className="w-7 h-7 md:w-9 md:h-9 object-contain rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-[7px] md:text-[10px] font-black text-[#4A2B18] uppercase tracking-[0.3em] md:tracking-[0.4em]">B.E.C FOOTWEAR • {rank.tier}</span>
                  <span className="text-[5px] md:text-[7px] font-bold text-[#8C532B] uppercase tracking-widest">Nationwide Delivery Across Ghana</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif italic text-[#3B2010] tracking-tighter leading-none">Your Bag</h2>
              
              {currentView === ViewState.SCROLL_MODE && (
                <div className="flex items-center gap-3 py-2 border-t border-[#EAD8C0] mt-3">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-[#8C532B] uppercase tracking-widest">Scroll Safeguard</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number" 
                        min="0"
                        value={haulTarget}
                        onChange={(e) => setHaulTarget(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-10 bg-transparent border-b border-[#EAD8C0] text-[#3B2010] font-mono text-xs focus:border-[#4A2B18] outline-none"
                      />
                      <span className="text-[8px] font-black text-[#8C532B] uppercase">Pairs</span>
                    </div>
                  </div>
                  {haulTarget > 0 && (
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                        <span className={items.reduce((acc, i) => acc + i.quantity, 0) > haulTarget ? 'text-red-500 animate-pulse' : 'text-[#8C532B]'}>
                          {items.reduce((acc, i) => acc + i.quantity, 0) > haulTarget ? `+${items.reduce((acc, i) => acc + i.quantity, 0) - haulTarget} OVER_LIMIT` : 'Progress'}
                        </span>
                        <span className={items.reduce((acc, i) => acc + i.quantity, 0) > haulTarget ? 'text-red-500' : 'text-[#8C532B]'}>
                           {items.reduce((acc, i) => acc + i.quantity, 0)}/{haulTarget}
                        </span>
                      </div>
                      <div className="h-1 bg-[#F5EAD8] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${items.reduce((acc, i) => acc + i.quantity, 0) > haulTarget ? 'bg-red-500' : 'bg-[#4A2B18]'} shadow-[0_0_10px_currentColor] transition-all duration-700`} 
                          style={{ width: `${Math.min(100, (items.reduce((acc, i) => acc + i.quantity, 0) / haulTarget) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button 
              id="cart-drawer-close"
              onClick={onClose} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#EAD8C0] bg-white flex items-center justify-center text-[#5A331C] hover:bg-[#4A2B18] hover:text-[#FAF4EC] transition-all hover:rotate-90 group"
            >
              <span className="group-hover:scale-125 transition-transform">✕</span>
            </button>
          </header>


          <div id="cart-items-list" className="flex-1 overflow-y-auto px-5 md:px-12 py-6 md:py-10 space-y-8 md:space-y-14 scrollbar-hide relative z-10 bg-white">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 px-8">
                <div className="text-6xl md:text-[100px] mb-8 opacity-20">👞</div>
                <h3 className="text-xl font-serif italic text-[#3B2010] mb-2">Your Bag is Empty</h3>
                <p className="text-[10px] text-[#8C532B] uppercase tracking-widest leading-loose max-w-[220px] mb-10">Explore B.E.C Footwear clogs, slides, sandals &amp; slippers.</p>
                <button 
                  id="empty-cart-return"
                  onClick={onClose} 
                  className="px-10 py-4 bg-[#4A2B18] text-[#FAF4EC] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#3B2010] transition-all shadow-xl active:scale-95"
                >Browse Collection</button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div 
                  key={`${item.id}-${item.selectedSize}-${JSON.stringify(item.selectedColorVariant || 'default')}`} 
                  className="group flex flex-row gap-4 sm:gap-8 animate-in slide-in-from-right-12 duration-500 stagger"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-20 sm:w-32 md:w-40 aspect-[3/4] bg-zinc-50 group-hover:-rotate-2 transition-transform duration-700 overflow-hidden relative border border-zinc-100 rounded-xl shrink-0">
                    <LazyImage src={getImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="text-[7px] md:text-[9px] font-black text-[#4A2B18] uppercase tracking-[0.2em]">
                                {item.isBundle ? 'Pair Pack' : item.category}
                              </div>
                              <span className="w-1 h-1 rounded-full bg-[#EAD8C0]"></span>
                              <div className="text-[7px] md:text-[9px] font-black text-[#8C532B] uppercase tracking-[0.2em] tabular-nums">
                                EU {item.selectedSize || 'Standard'}
                              </div>
                              {item.selectedColorVariant && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-[#EAD8C0]"></span>
                                  <div className="flex items-center gap-1 group/colors">
                                    <div className="flex -space-x-1">
                                      <div className="w-2 h-2 rounded-full border border-black/10 z-10" style={{ backgroundColor: item.selectedColorVariant.main }} />
                                      <div className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: item.selectedColorVariant.secondary }} />
                                    </div>
                                    <div className="text-[7px] md:text-[8px] font-bold text-[#8C532B] uppercase tracking-widest">
                                      {item.selectedColorVariant.main} / {item.selectedColorVariant.secondary}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            <h3 className="text-base md:text-2xl font-serif italic text-[#3B2010] tracking-tight leading-tight group-hover:text-[#8C532B] transition-colors line-clamp-1">{item.name}</h3>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id, item.selectedSize, item.selectedColorVariant)} 
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-zinc-100 active:bg-zinc-200 transition-all text-sm active:scale-95"
                          title="Remove item"
                          aria-label="Remove item"
                        >✕</button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-xl p-1 gap-1 w-fit">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1, item.selectedSize, item.selectedColorVariant)} 
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-base font-bold text-zinc-500 hover:text-black hover:bg-white active:bg-zinc-200 transition-colors"
                            aria-label="Decrease quantity"
                          >-</button>
                          <span className="text-xs font-mono font-black text-zinc-950 min-w-[28px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1, item.selectedSize, item.selectedColorVariant)} 
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-base font-bold text-zinc-500 hover:text-black hover:bg-white active:bg-zinc-200 transition-colors"
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-end border-t border-zinc-100 pt-3">
                       <div className="flex flex-col">
                         <span className="text-[6px] md:text-[8px] font-black text-zinc-400 uppercase tracking-widest">Base Rate</span>
                         <span className="text-zinc-300 text-[10px] font-mono line-through">GH₵{item.originalPrice * item.quantity}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-base md:text-3xl font-mono font-black text-zinc-950 leading-none tracking-tighter">
                             <span className="text-zinc-950">GH₵{item.price * item.quantity}</span>
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <footer id="cart-drawer-footer" className="relative z-10 border-t border-zinc-200 p-6 md:p-12 space-y-8 md:space-y-10 shadow-[0_-30px_60px_rgba(0,0,0,0.05)] bg-white pb-safe">
              {(userStats?.storeCredit || 0) > 0 && (
                <div id="store-credit-panel" className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${applyCredit ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${applyCredit ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                      <span className="text-xs font-black">GH₵</span>
                    </div>
                    <div>
                      <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] block mb-0.5">Available Credit</span>
                      <span className="text-base md:text-lg font-mono font-black text-zinc-950">GH₵{userStats?.storeCredit || 0}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setApplyCredit(!applyCredit)}
                    className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-90 ${applyCredit ? 'bg-emerald-500 text-white shadow-lg' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                  >
                    {applyCredit ? 'Applied' : 'Apply'}
                  </button>
                </div>
              )}
              
              {/* Detailed Mobile Price Breakdown */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">Items Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                  <span className="font-mono font-bold text-zinc-950">GH₵{subtotalShopPrice}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                    <span>🇬🇭</span> Estimated Dispatch (Ghana)
                  </span>
                  <span className="font-mono font-bold text-zinc-950">
                    {totalShipping > 0 ? `+ GH₵${totalShipping}` : 'GH₵25 (Est. Accra)'}
                  </span>
                </div>

                {activePromo && (
                  <div className="flex justify-between items-center text-xs text-blue-600 font-bold">
                    <span>Promo Applied ({activePromo.code})</span>
                    <span className="font-mono">- GH₵{Math.floor(subtotalShopPrice - baseValuation)}</span>
                  </div>
                )}

                {appliedCredit > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                    <span>Store Credit Applied</span>
                    <span className="font-mono">- GH₵{appliedCredit}</span>
                  </div>
                )}

                <div className="border-t border-zinc-200/80 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-950 block">Total Payable</span>
                    <span className="text-[10px] text-zinc-400 font-medium">Includes all verified items</span>
                  </div>
                  <div className="text-right">
                    {applyCredit && (
                      <span className="text-emerald-600 font-mono text-xs line-through block opacity-70">
                        GH₵{finalValuationBeforeCredit}
                      </span>
                    )}
                    <span className="text-2xl md:text-3xl font-mono font-black text-zinc-950 tracking-tight">
                      GH₵{finalValuation}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Prominent Checkout Button */}
                <button 
                  id="checkout-initialize-btn"
                  onClick={() => { 
                    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
                    if (currentView === ViewState.SCROLL_MODE && haulTarget > 0 && totalItems < haulTarget) {
                      if (!confirm(`Your Scroll Mode Safeguard (${haulTarget} items) is not met. Currently: ${totalItems}. Initialize acquisition anyway?`)) {
                        return;
                      }
                    }
                    setIsFlashing(true);
                    setTimeout(() => {
                      setIsFlashing(false);
                      onClose(); 
                      if (onNavigate) onNavigate(ViewState.CHECKOUT); 
                    }, 400);
                  }} 
                  className={`w-full py-5 md:py-6 text-[12px] md:text-[13px] font-black uppercase tracking-[0.25em] rounded-2xl active:scale-98 transition-all duration-300 relative overflow-hidden group cursor-pointer shadow-xl flex items-center justify-center gap-2.5 ${
                    isFlashing 
                      ? 'bg-[#E5C9A8] text-[#3B2010] shadow-2xl scale-[1.01]' 
                      : 'bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC]'
                  }`}
                  disabled={isFlashing}
                >
                  {isFlashing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Proceeding to Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Proceed to Checkout • GH₵{finalValuation}</span>
                    </>
                  )}
                </button>

                {/* Continue Shopping Button */}
                <button
                  type="button"
                  id="cart-continue-shopping-btn"
                  onClick={onClose}
                  className="w-full py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-zinc-200"
                >
                  ← Continue Shopping
                </button>
                
                <div className="flex justify-center items-center gap-6 pt-1">
                  <div className="flex items-center gap-1.5 opacity-60 text-zinc-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Paystack Secured</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-80 text-[#5A331C]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A2B18]"></span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Nationwide Delivery • 0244122075</span>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;