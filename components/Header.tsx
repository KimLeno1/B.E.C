import React from 'react';
import { ViewState, UserStats, Page } from '../types';
import { ShoppingCart, Search, Bell, Heart } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  wishlistCount?: number;
  stats: UserStats;
  onCartOpen: () => void;
  onOpenSearch: () => void;
  onNavigatePage: (page: Page) => void;
  onNavigateView: (view: ViewState) => void;
  onNotificationOpen: () => void;
  currentPage: Page;
  currentView: ViewState;
  dropTime: number;
  onOpenCategories?: () => void;
  theme?: 'dark' | 'light';
  rep: number;
  handle: string;
}

const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount = 0,
  onCartOpen,
  onOpenSearch,
  onNavigateView,
  onNotificationOpen,
  currentView,
  handle,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 bg-[#FFFCF7]/95 backdrop-blur-xs border-b border-[#EAD8C0]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigateView(ViewState.LOBBY)}
          className="text-left whitespace-nowrap shrink-0 cursor-pointer flex items-baseline gap-1.5"
        >
          <span className="text-xl sm:text-2xl font-serif italic font-black tracking-tight text-[#4A2B18] leading-none">
            B.E.C
          </span>
          <span className="text-sm sm:text-base font-sans italic font-extrabold text-[#8C532B] leading-none">
            Footwear
          </span>
        </button>

        {/* Zone 2: Clean Search Affordance (Desktop & Tablet) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden md:flex flex-1 max-w-md items-center justify-between bg-[#FAF4EC] border border-[#EAD8C0] hover:border-[#4A2B18]/45 rounded-lg px-3.5 py-2 text-xs text-[#6B4A35] transition-colors cursor-pointer"
        >
          <span className="truncate">Search clogs, studded slides, sandals, slippers...</span>
          <Search className="w-3.5 h-3.5 text-[#8C532B] shrink-0 ml-2" />
        </button>

        {/* Zone 3: Compact Storefront Utility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[#4A2B18] hover:bg-[#F5EAD8] transition-colors cursor-pointer"
            aria-label="Search footwear"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onNotificationOpen}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#4A2B18] hover:bg-[#F5EAD8] transition-colors cursor-pointer"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateView(ViewState.WISHLIST)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer relative ${
              currentView === ViewState.WISHLIST
                ? 'bg-[#4A2B18] text-[#FAF4EC]'
                : 'text-[#4A2B18] hover:bg-[#F5EAD8]'
            }`}
            aria-label="Saved footwear"
            title="Saved Footwear"
          >
            <Heart
              className={`w-4 h-4 ${
                currentView === ViewState.WISHLIST
                  ? 'fill-[#FAF4EC] text-[#FAF4EC]'
                  : wishlistCount > 0
                  ? 'fill-rose-500 text-rose-500'
                  : ''
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center tabular-nums">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onCartOpen}
            className="h-10 px-2.5 sm:px-3 rounded-lg bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Open shopping bag"
            title="Shopping Bag"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-xs font-mono font-bold tabular-nums">{cartCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView(ViewState.PROFILE)}
            className="w-9 h-9 ml-0.5 rounded-lg flex items-center justify-center border border-[#D8BE9E] bg-[#F5EAD8] text-[#4A2B18] hover:border-[#4A2B18] transition-colors cursor-pointer"
            aria-label="Open profile"
            title="Profile"
          >
            <span className="text-xs font-bold uppercase">
              {handle.trim().charAt(0) || 'B'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
