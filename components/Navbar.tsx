import React from 'react';
import { UserStats, ViewState } from '../types';

interface NavbarProps {
  stats: UserStats;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  logoUrl: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, logoUrl }) => {
  const navItems = [
    { label: 'Hot Drops', view: ViewState.FAMOUS, icon: '⚡' },
    { label: 'Pairs & Packs', view: ViewState.BUNDLES, icon: '🎁' },
    { label: 'Footwear Studio', view: ViewState.TRY_ON, icon: '✨' },
  ];

  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="sticky top-0 z-50 bg-[#4A2B18]/95 backdrop-blur-xl border-b border-[#EAD8C0]/20 px-6 md:px-10 py-4 flex items-center justify-between shadow-[0_8px_32px_rgba(38,20,9,0.35)]">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => onNavigate(ViewState.LOBBY)}
        >
          <div className="relative">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="B.E.C Footwear" 
                className="w-12 h-12 rounded-2xl border border-[#E5C9A8]/40 shadow-[0_0_16px_rgba(229,201,168,0.2)] group-hover:scale-105 group-hover:border-[#E5C9A8]/70 transition-all duration-500 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4EC]/10 backdrop-blur-md animate-pulse border border-[#E5C9A8]/20" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-serif italic font-black tracking-tight leading-none text-[#FAF4EC]">
              B.E.C<span className="text-[#E5C9A8] font-sans font-black not-italic ml-1.5 text-base tracking-normal">Footwear</span>
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.28em] text-[#E5C9A8]/80 mt-1">Nationwide Delivery</div>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button 
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                  isActive 
                    ? 'bg-[#8C532B]/40 text-[#FAF4EC] border border-[#E5C9A8]/50 shadow-[0_0_16px_rgba(229,201,168,0.18)]' 
                    : 'text-[#E5C9A8]/80 hover:text-[#FAF4EC] hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#E5C9A8] rounded-full shadow-[0_0_8px_#E5C9A8]"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;