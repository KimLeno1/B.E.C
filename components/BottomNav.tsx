import React, { useState, useRef, useEffect } from 'react';
import { ViewState } from '../types';
import {
  Package,
  MoreHorizontal,
  User,
  Shield,
  Heart,
  Flame,
  Headphones,
  LogOut,
  LogIn,
  X,
  Users,
  Sparkles,
  Download,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { triggerPWAPrompt } from '../hooks/usePWAInstall';
import { triggerHaptic } from '../lib/haptics';

interface BottomNavProps {
  onNotificationOpen: () => void;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenCategories: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout?: () => void;
  handle?: string;
  cartCount?: number;
  wishlistCount?: number;
  onCartOpen?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenCategories,
  isAuthenticated,
  onLogin,
  onLogout,
  handle = 'Guest Shopper',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const holdTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const hasLongPressedRef = useRef(false);

  const startHold = () => {
    hasLongPressedRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      triggerHaptic('success');
      onNavigate(currentView === ViewState.SCROLL_MODE ? ViewState.LOBBY : ViewState.SCROLL_MODE);
      hasLongPressedRef.current = true;
    }, 5000);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const NavItem = ({ icon: Icon, label, action, isActive }: any) => (
    <button
      onClick={() => {
        triggerHaptic('selection');
        action();
      }}
      className={`flex flex-col items-center justify-end pb-2 gap-1 flex-1 transition-all duration-300 relative h-full cursor-pointer ${
        isActive
          ? 'text-[#4A2B18] font-black'
          : 'text-[#7C5A43] hover:text-[#261409]'
      }`}
    >
      {isActive && <div className="glow-dot" />}
      <div className={`transition-transform duration-300 mb-0.5 ${isActive ? 'scale-110 text-[#4A2B18]' : 'hover:scale-105'}`}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} fill="none" className="sm:w-6 sm:h-6" />
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none">
        {label}
      </span>
    </button>
  );

  const handleNavClick = (view: ViewState) => {
    triggerHaptic('selection');
    setIsMenuOpen(false);
    setTimeout(() => {
      onNavigate(view);
    }, 10);
  };

  return (
    <>
      {/* Secondary Navigation Slide-Up Drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[160] flex flex-col justify-end bg-[#261409]/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="w-full max-h-[85vh] bg-[#FFFCF7] rounded-t-[2rem] border-t border-[#EAD8C0] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#EAD8C0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4A2B18] text-[#FAF4EC] flex items-center justify-center font-bold text-sm shadow-sm border border-[#D8BE9E]">
                  {handle.trim().charAt(0).toUpperCase() || 'B'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#261409] leading-tight">{handle}</h3>
                  <span className="text-[10px] font-semibold text-[#8C532B] tracking-wider uppercase">
                    {isAuthenticated ? 'B.E.C Footwear Member' : 'B.E.C Guest Shopper'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('selection');
                  setIsMenuOpen(false);
                }}
                className="w-10 h-10 rounded-full bg-[#F5EAD8] text-[#4A2B18] hover:bg-[#EAD8C0] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-4 max-h-[calc(85vh-80px)] pb-safe">
              {/* Account Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick(ViewState.PROFILE)}
                  className="p-3 rounded-xl bg-[#FAF4EC] border border-[#EAD8C0] hover:border-[#4A2B18]/40 flex items-center gap-2.5 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <User size={18} className="text-[#4A2B18] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#261409] block truncate">My Profile</span>
                    <span className="text-[9px] text-[#7C5A43] block truncate">Orders & EU sizes</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavClick(ViewState.WISHLIST)}
                  className="p-3 rounded-xl bg-[#FAF4EC] border border-[#EAD8C0] hover:border-[#4A2B18]/40 flex items-center gap-2.5 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <Heart size={18} className="text-[#8C532B] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#261409] block truncate">Saved Pairs</span>
                    <span className="text-[9px] text-[#7C5A43] block truncate">Your wishlist</span>
                  </div>
                </button>
              </div>

              {/* Collections & Discovery */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8C532B] px-1">
                  Footwear Studio & Packs
                </span>

                <button
                  onClick={() => handleNavClick(ViewState.TRY_ON)}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center border border-[#EAD8C0]">
                      <Sparkles size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">B.E.C Style Studio</span>
                      <span className="text-[10px] text-[#7C5A43]">Try-On & Pairings Preview</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>

                <button
                  onClick={() => handleNavClick(ViewState.BUNDLES)}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#8C532B] flex items-center justify-center border border-[#EAD8C0]">
                      <Package size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">Footwear Pairs & Packs</span>
                      <span className="text-[10px] text-[#7C5A43]">Clog & Slide bundles with savings</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>

                <button
                  onClick={() => handleNavClick(ViewState.FAMOUS)}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/60">
                      <Flame size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">Flash Deals & Offers</span>
                      <span className="text-[10px] text-[#7C5A43]">Limited-time footwear drops</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>

                <button
                  onClick={() => handleNavClick(ViewState.KFAM)}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                      <Users size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">Referral Rewards</span>
                      <span className="text-[10px] text-[#7C5A43]">Share B.E.C Footwear & earn credit</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>
              </div>

              {/* Support & Platform */}
              <div className="space-y-1 pt-2 border-t border-[#EAD8C0]">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8C532B] px-1">
                  Support & Nationwide Delivery
                </span>

                <button
                  onClick={() => handleNavClick(ViewState.CONTACT)}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center">
                      <Headphones size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">Call & WhatsApp Support</span>
                      <span className="text-[10px] text-[#7C5A43]">0244122075 / 0260584440 • Nationwide</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    triggerPWAPrompt();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center">
                      <Download size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">Download App</span>
                      <span className="text-[10px] text-[#7C5A43]">Install B.E.C Footwear for quick ordering</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>

                <button
                  onClick={() => handleNavClick(ViewState.ABOUT)}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">About B.E.C Footwear</span>
                      <span className="text-[10px] text-[#7C5A43]">Our 6 top collections & quality promise</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>

                <button
                  onClick={() => handleNavClick(ViewState.LEGAL)}
                  className="w-full p-3 rounded-xl hover:bg-[#FAF4EC] flex items-center justify-between text-[#261409] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center">
                      <Shield size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#261409] block">Legal & Exchange Policy</span>
                      <span className="text-[10px] text-[#7C5A43]">Terms, privacy & size exchanges</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#8C532B]" />
                </button>
              </div>

              {/* Authentication Action */}
              <div className="pt-2 border-t border-[#EAD8C0]">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      triggerHaptic('selection');
                      setIsMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      triggerHaptic('selection');
                      setIsMenuOpen(false);
                      onLogin();
                    }}
                    className="w-full p-3 rounded-xl bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    <LogIn size={16} />
                    <span>Sign In or Register</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar Background with Radial Mask */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[64px] sm:h-[70px] z-[120] pointer-events-none bg-[#FFFCF7] border-t border-[#EAD8C0] rounded-t-[1.5rem] shadow-[0_-4px_25px_rgba(74,43,24,0.08)]"
        style={{
          maskImage: 'radial-gradient(circle at 50% 5px, transparent 38px, black 39px)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 5px, transparent 38px, black 39px)',
        }}
      ></div>

      {/* Curved Border Accent */}
      <div
        className="fixed bottom-[21px] sm:bottom-[27px] left-1/2 -translate-x-1/2 w-[76px] h-[76px] rounded-full border border-[#D8BE9E] pointer-events-none z-[122]"
        style={{
          clipPath: 'inset(50% 0 0 0)',
        }}
      ></div>

      <nav className="fixed bottom-0 left-0 right-0 h-[64px] sm:h-[70px] z-[121] flex justify-around items-end pb-1.5 sm:pb-2 px-2 max-w-7xl mx-auto">
        <NavItem
          icon={Compass}
          label="Collections"
          action={onOpenCategories}
          isActive={currentView === ViewState.CATEGORIES || currentView === ViewState.SEARCH}
        />

        <NavItem
          icon={Heart}
          label="Saved"
          action={() => onNavigate(ViewState.WISHLIST)}
          isActive={currentView === ViewState.WISHLIST}
        />

        {/* Floating Center Orb */}
        <div className="relative flex-1 flex justify-center h-full">
          <button
            id="bottom-nav-home-btn"
            aria-label="Home"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
              if (hasLongPressedRef.current) {
                hasLongPressedRef.current = false;
                return;
              }
              triggerHaptic('selection');
              onNavigate(ViewState.LOBBY);
            }}
            className="absolute -top-6 sm:-top-8 w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center bg-transparent group/orb transition-transform duration-500 hover:scale-105 active:scale-95 select-none touch-none no-callout z-[130] breathing-animation cursor-pointer"
          >
            <div className={`absolute inset-0 rounded-full scale-90 border transition-all duration-300 shadow-[0_6px_18px_rgba(74,43,24,0.38)] ${
              currentView === ViewState.LOBBY
                ? 'bg-gradient-to-br from-[#5A331C] via-[#4A2B18] to-[#261409] border-[#F5EAD8] ring-2 ring-[#4A2B18]/25'
                : 'bg-gradient-to-br from-[#4A2B18] to-[#261409] border-[#D8BE9E] group-hover/orb:border-[#FAF4EC]'
            }`}></div>

            <div className="relative z-10 flex flex-col items-center justify-center transition-transform duration-300 group-hover/orb:scale-105 select-none">
              <span className="text-[14px] font-serif italic font-black tracking-tight text-[#FAF4EC] leading-none">
                B.E.C
              </span>
              <span className="text-[6.5px] font-bold uppercase tracking-widest text-[#E5C9A8] leading-none mt-0.5">
                PAIRS
              </span>
            </div>
          </button>

          <span className={`absolute bottom-0.5 sm:bottom-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center transition-colors ${
            currentView === ViewState.LOBBY ? 'text-[#4A2B18] font-extrabold' : 'text-[#7C5A43]'
          }`}>
            HOME
          </span>
        </div>

        <NavItem
          icon={Sparkles}
          label="Bundles"
          action={() => onNavigate(ViewState.BUNDLES)}
          isActive={currentView === ViewState.BUNDLES}
        />

        <NavItem
          icon={MoreHorizontal}
          label="More"
          action={() => setIsMenuOpen(!isMenuOpen)}
          isActive={isMenuOpen}
        />
      </nav>
    </>
  );
};

export default BottomNav;
