import React, { useState, useEffect } from 'react';
import { UserStats, ViewState, PromoCode, Order, OrderStatus, CheckoutProtocol, UserPreferences, CartItem } from '../types';
import { USER_ACHIEVEMENTS } from '../data/extendedMock';
import { databaseService } from '../services/databaseService';
import { getCurrentRank, getNextRankThreshold } from '../data/rankingSystem';
import OrderDetailsModal from './OrderDetailsModal';
import PurchaseInsights from './PurchaseInsights';
import { OrderSkeleton, Skeleton } from './Skeleton';
import { Sparkles, LogOut, Shield, Archive, MapPin, Users, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileProps {
  stats: UserStats;
  rep: number;
  handle: string;
  onUpdateHandle: (handle: string) => void;
  onNavigate: (view: ViewState) => void;
  onLogout?: () => void;
  onApplyPromo?: (promo: PromoCode) => void;
  activePromo?: PromoCode | null;
  onUpdateStats?: (stats: UserStats) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenStyleProtocol?: (step?: number) => void;
  protocols: CheckoutProtocol[];
  onUpdateProtocols: (protocols: CheckoutProtocol[]) => void;
  userPrefs?: UserPreferences | null;
  notificationCount: number;
  onNotificationOpen: () => void;
  gender?: string;
  onReorder?: (items: CartItem[]) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  stats, 
  rep, 
  handle, 
  onUpdateHandle, 
  onLogout, 
  onApplyPromo, 
  activePromo, 
  onUpdateStats, 
  theme, 
  onOpenStyleProtocol,
  protocols,
  onUpdateProtocols,
  notificationCount,
  onNotificationOpen,
  gender,
  onReorder
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'vault' | 'logistics' | 'referrals' | 'insights'>('status');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [newHandle, setNewHandle] = useState(handle);
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);
  const [protocolEditForm, setProtocolEditForm] = useState<CheckoutProtocol | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  const currentRank = getCurrentRank(rep);
  const nextRank = getNextRankThreshold(rep);
  const level = Math.floor(Math.sqrt(rep / 100)) + 1;
  const achievements = stats.achievements && stats.achievements.length > 0 ? stats.achievements : USER_ACHIEVEMENTS;
  const totalProgress = Math.round((achievements.reduce((acc, a) => acc + (Math.min(a.progress, a.goal) / a.goal), 0) / achievements.length) * 100);

  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [isBindingReferral, setIsBindingReferral] = useState(false);

  const refreshData = async () => {
    const userId = localStorage.getItem('cc-user-id');
    setIsDataLoading(true);
    try {
      if (userId) {
        const orders = await databaseService.getOrders();
        setUserOrders(orders);
        try {
          const savedOutfits = await databaseService.getOutfits(userId);
          setOutfits(savedOutfits);
        } catch (err) {
          console.error('Error fetching saved sets:', err);
        }
        try {
          const refResult = await databaseService.getReferralStats(userId);
          if (refResult.status === 'success') {
            setReferralStats(refResult.data);
          }
        } catch (err) {
          console.error('Error fetching referrals:', err);
        }
      } else {
        setUserOrders(await databaseService.getOrders());
      }
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    if (localStorage.getItem('scroll-to-referrals') === 'true') {
      localStorage.removeItem('scroll-to-referrals');
      setActiveTab('referrals');
      setTimeout(() => {
        const el = document.getElementById('referrals-hub');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    }
  }, []);

  const handlePromoActivate = async () => {
    const codes = await databaseService.getPromoCodes();
    const found = codes.find(c => c.code === promoInput.toUpperCase());
    if (found) {
      const isExpired = new Date(found.expiryDate) < new Date();
      const isLimitReached = found.usedCount >= found.usageLimit;

      if (isExpired) {
        setPromoError('Promo code expired.');
        setTimeout(() => setPromoError(null), 3000);
        return;
      }
      if (isLimitReached) {
        setPromoError('Promo code usage limit reached.');
        setTimeout(() => setPromoError(null), 3000);
        return;
      }

      onApplyPromo?.(found);
      setPromoInput('');
      setPromoError(null);
    } else {
      setPromoError('Promo code invalid or inactive.');
      setTimeout(() => setPromoError(null), 3000);
    }
  };

  return (
    <div className="px-4 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6 space-y-6 sm:space-y-8 pb-32 sm:pb-40 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-8">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[#4A2B18] animate-pulse"></div>
             <span className="text-[8px] sm:text-[10px] font-black text-[#8C532B] uppercase tracking-[0.4em]">B.E.C Member Profile</span>
          </div>
          <div className="flex items-center gap-4">
            {isEditingHandle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  className="border border-[#EAD8C0] px-3 py-1.5 rounded-xl text-lg sm:text-2xl font-black uppercase outline-none focus:border-[#4A2B18] bg-[#FAF4EC] text-[#261409]"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    onUpdateHandle(newHandle);
                    setIsEditingHandle(false);
                  }}
                  className="bg-[#4A2B18] text-[#FAF4EC] p-2 rounded-xl hover:scale-105 transition-transform"
                >
                  ✓
                </button>
              </div>
            ) : (
              <h1 className="text-3xl sm:text-4xl md:text-8xl font-serif italic tracking-tighter leading-none group cursor-pointer text-[#261409]" onClick={() => setIsEditingHandle(true)}>
                {handle} <span className="text-[#8C532B] text-[10px] sm:text-sm not-italic font-sans group-hover:text-[#4A2B18] transition-colors">✎</span>
              </h1>
            )}
          </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#5A331C] text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em]">
            <span>Reputation Magnitude: {(rep || 0).toLocaleString()} REP</span>
            {gender && (
              <>
                <span className="text-[#8C532B]">|</span>
                <span className="text-[#261409]">STYLE FIT: {gender}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] sm:text-[10px] font-black text-[#FAF4EC] bg-[#4A2B18] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg shadow-sm uppercase">LEVEL {level}</span>
            <button 
              onClick={onNotificationOpen}
              className="relative w-8 h-8 rounded-full border transition-all flex items-center justify-center bg-[#FAF4EC] border-[#EAD8C0] text-[#4A2B18] hover:bg-[#F5EAD8]"
            >
              <span className="text-sm">🔔</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4A2B18] rounded-full text-[8px] font-black flex items-center justify-center text-[#FAF4EC] border border-[#FAF4EC] animate-pulse">{notificationCount}</span>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">
           <div className="px-4 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border flex flex-col items-center min-w-[100px] sm:min-w-[160px] bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
              <span className="text-[7px] sm:text-[8px] font-black text-[#5A331C] uppercase tracking-widest mb-1">Status Tier</span>
              <span className="text-base sm:text-2xl font-mono font-black text-[#4A2B18] uppercase">{currentRank.tier}</span>
           </div>
           <div className="px-4 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border flex flex-col items-center min-w-[100px] sm:min-w-[140px] bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
              <span className="text-[7px] sm:text-[8px] font-black text-[#5A331C] uppercase tracking-widest mb-1">Sync Ratio</span>
              <span className="text-base sm:text-2xl font-mono font-black text-[#261409]">{totalProgress}%</span>
           </div>
           <div className="col-span-2 sm:col-auto px-4 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border flex flex-col items-center min-w-[100px] sm:min-w-[140px] bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
              <span className="text-[7px] sm:text-[8px] font-black text-[#8C532B] uppercase tracking-widest mb-1">Store Credit</span>
              <span className="text-base sm:text-2xl font-mono font-black text-[#261409]">GH₵{stats?.storeCredit || 0}</span>
           </div>
        </div>
      </header>

      {/* Dynamic Tab Navigation System */}
      <div className="mt-8 p-1.5 rounded-2xl border border-[#EAD8C0] bg-[#F5EAD8] transition-all grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'status'
              ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg font-extrabold'
              : 'text-[#5A331C] hover:text-[#261409] hover:bg-[#EAD8C0]/40'
          }`}
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Status & Standing</span>
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'vault'
              ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg font-extrabold'
              : 'text-[#5A331C] hover:text-[#261409] hover:bg-[#EAD8C0]/40'
          }`}
        >
          <Archive className="w-3.5 h-3.5 shrink-0" />
          <span>Orders & Wishlist</span>
          {(userOrders.length > 0 || outfits.length > 0) && (
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'vault' ? 'bg-[#FAF4EC] text-[#4A2B18]' : 'bg-[#4A2B18]/15 text-[#4A2B18]'
            }`}>
              {userOrders.length + outfits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logistics')}
          className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'logistics'
              ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg font-extrabold'
              : 'text-[#5A331C] hover:text-[#261409] hover:bg-[#EAD8C0]/40'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>Delivery Addresses</span>
          {protocols.length > 0 && (
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'logistics' ? 'bg-[#FAF4EC] text-[#4A2B18]' : 'bg-[#4A2B18]/15 text-[#5A331C]'
            }`}>
              {protocols.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'referrals'
              ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg font-extrabold'
              : 'text-[#5A331C] hover:text-[#261409] hover:bg-[#EAD8C0]/40'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>Affiliate Network</span>
          {referralStats?.referredUsers?.length > 0 && (
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'referrals' ? 'bg-[#FAF4EC] text-[#4A2B18]' : 'bg-[#8C532B]/20 text-[#4A2B18]'
            }`}>
              {referralStats.referredUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'insights'
              ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg font-extrabold'
              : 'text-[#5A331C] hover:text-[#261409] hover:bg-[#EAD8C0]/40'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
          <span>Purchase Insights</span>
        </button>
      </div>

      <div className="mt-8 transition-all duration-300">
        {activeTab === 'status' && (
          <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-500">
            <section className="p-6 sm:p-8 md:p-16 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] bg-[#FAF4EC] border border-[#EAD8C0] space-y-8 sm:space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-[0.04] text-[10rem] sm:text-[15rem] md:text-[20rem] font-black pointer-events-none group-hover:scale-110 transition-transform duration-1000 text-[#4A2B18]">
                {currentRank.tier.charAt(0)}
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12 relative z-10">
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-48 md:h-48 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] bg-[#4A2B18] p-0.5 sm:p-1 shadow-2xl">
                  <div className="w-full h-full bg-[#FAF4EC] rounded-[1.4rem] sm:rounded-[2.3rem] md:rounded-[3.3rem] flex items-center justify-center text-3xl sm:text-5xl md:text-6xl">
                    {currentRank.tier === 'Kraze Legend' ? '💯' : currentRank.tier === 'Closet Royalty' ? '👑' : currentRank.tier === 'Fashion Icon' ? '🔥' : currentRank.tier === 'Trendsetter' ? '💎' : currentRank.tier === 'Stylist' ? '🌟' : '👤'}
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6 text-center md:text-left flex-1 w-full">
                  <div className="space-y-2 sm:space-y-4">
                    <h2 className="text-2xl sm:text-3xl md:text-6xl font-serif italic tracking-tight text-[#261409]">
                      Current Standing: {currentRank.tier}
                    </h2>
                    
                    {nextRank && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[7px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#5A331C]">
                          <span>Next Rank: {nextRank.next}</span>
                          <span>{(rep || 0).toLocaleString()} / {nextRank.threshold.toLocaleString()} REP</span>
                        </div>
                        <div className="h-1 sm:h-1.5 w-full rounded-full overflow-hidden bg-[#EAD8C0]">
                          <div 
                            className="h-full bg-[#4A2B18]" 
                            style={{ width: `${(rep / nextRank.threshold) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-4 justify-center md:justify-start">
                    <button 
                      onClick={() => onOpenStyleProtocol?.()}
                      className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[7px] sm:text-[8px] md:text-[9px] transition-all shadow-lg border border-[#EAD8C0] bg-[#F5EAD8] text-[#4A2B18] hover:bg-[#EAD8C0] flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#8C532B]" />
                      <span>B.E.C Style Passport</span>
                    </button>

                    {onLogout && (
                      <button 
                        onClick={onLogout}
                        className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 border border-[#EAD8C0] rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[7px] sm:text-[8px] md:text-[9px] hover:bg-red-50 hover:text-red-700 transition-all shadow-lg flex items-center justify-center gap-3 bg-[#FAF4EC] text-[#5A331C]"
                      >
                        <LogOut className="w-3 h-3" />
                        Log Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Promo Activation */}
            <section className="space-y-8 md:space-y-10">
              <div className="flex items-center gap-6">
                <h3 className="text-xl md:text-2xl font-serif italic whitespace-nowrap text-[#261409]">Promo Codes</h3>
                <div className="h-px w-full bg-[#EAD8C0]"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                <div className="bg-[#FAF4EC] border border-[#EAD8C0] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-[9px] md:text-[10px] font-black text-[#8C532B] uppercase tracking-widest">Apply Promo Code</div>
                    <div className="relative group">
                      <input 
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="ENTER PROMO CODE"
                        className="w-full bg-[#F5EAD8] border border-[#EAD8C0] p-5 md:p-6 rounded-2xl text-[10px] md:text-xs font-black text-[#261409] focus:border-[#4A2B18] transition-all outline-none"
                      />
                      <button 
                        onClick={handlePromoActivate}
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-[#4A2B18] text-[#FAF4EC] px-4 md:px-6 py-2 md:py-3 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-[#3B2010] transition-all active:scale-95"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-[8px] font-black text-red-600 uppercase px-2 animate-pulse">{promoError}</p>}
                  </div>
                </div>

                <div className="bg-[#FAF4EC] border border-[#EAD8C0] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[160px]">
                   {activePromo ? (
                     <div className="animate-in zoom-in-95 duration-500 space-y-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#F5EAD8] border border-[#8C532B]/40 flex items-center justify-center text-2xl md:text-3xl mx-auto animate-pulse">🎫</div>
                        <div className="space-y-1">
                          <div className="text-[8px] md:text-[9px] font-black text-[#8C532B] uppercase tracking-widest">Active Promo Code</div>
                          <div className="text-lg md:text-xl font-black text-[#261409] tracking-widest uppercase">{activePromo.code}</div>
                        </div>
                     </div>
                   ) : (
                     <div className="opacity-50 space-y-4">
                       <div className="text-5xl md:text-6xl">🔒</div>
                       <p className="text-[9px] md:text-[10px] font-black text-[#5A331C] uppercase tracking-widest">No Active Promo Codes</p>
                     </div>
                   )}
                </div>
              </div>
            </section>

            {/* Achievements */}
            <section className="space-y-8 md:space-y-10">
              <div className="flex items-center gap-6">
                <h3 className="text-xl md:text-2xl font-serif italic whitespace-nowrap text-[#261409]">Achievements</h3>
                <div className="h-px w-full bg-[#EAD8C0]"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {achievements.map(ach => {
                  const progressPercent = (Math.min(ach.progress, ach.goal) / ach.goal) * 100;
                  return (
                    <div 
                      key={ach.id} 
                      className={`relative group bg-[#FAF4EC] border p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 overflow-hidden ${
                        ach.unlocked 
                        ? 'border-[#8C532B]/50 shadow-sm' 
                        : 'border-[#EAD8C0] grayscale hover:grayscale-[0.5]'
                      }`}
                    >
                      <div className="absolute bottom-0 left-0 h-1 bg-[#F5EAD8] w-full">
                         <div 
                           className={`h-full transition-all duration-1000 ${ach.unlocked ? 'bg-[#4A2B18]' : 'bg-[#8C532B]/40'}`} 
                           style={{ width: `${progressPercent}%` }}
                         ></div>
                      </div>

                      <div className="flex items-start justify-between mb-6 md:mb-8 relative z-10">
                        <div className="text-3xl md:text-4xl transition-transform duration-500 group-hover:scale-110">
                          {ach.unlocked ? ach.icon : '🔒'}
                        </div>
                      </div>

                      <div className="space-y-2 relative z-10">
                        <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#261409] group-hover:text-[#8C532B] transition-colors">
                          {ach.unlocked ? ach.title : 'Locked Badge'}
                        </h4>
                        <p className="text-[9px] md:text-[10px] text-[#5A331C] font-bold uppercase tracking-tight leading-relaxed line-clamp-2 italic">
                          {ach.unlocked || ach.progress > 0 ? ach.description : 'Complete more activities to unlock this badge.'}
                        </p>
                      </div>

                      <div className="mt-6 md:mt-8 flex justify-between items-center relative z-10">
                         <div className="text-[8px] font-black text-[#8C532B] uppercase tracking-[0.2em]">REP Reward: +{ach.rewardREP}</div>
                         <div className="text-[9px] md:text-[10px] font-mono font-black text-[#5A331C]">
                           {ach.progress} <span className="text-[#8C532B]">/</span> {ach.goal}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-500">
            {/* Order History */}
            <section className="space-y-8 md:space-y-10">
              <div className="flex items-center gap-6">
                <h3 className="text-xl md:text-2xl font-serif italic whitespace-nowrap text-[#261409]">Order History</h3>
                <div className="h-px w-full bg-[#EAD8C0]"></div>
              </div>

              <div className="grid gap-4">
                {isDataLoading ? (
                  [...Array(3)].map((_, i) => <OrderSkeleton key={i} />)
                ) : userOrders.length === 0 ? (
                  <div className="py-16 md:py-20 text-center bg-[#FAF4EC] border border-dashed border-[#EAD8C0] rounded-[2.5rem] md:rounded-[3rem] opacity-60">
                     <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#5A331C]">No past footwear orders found.</p>
                  </div>
                ) : (
                  userOrders.map(order => (
                    <button 
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-left group bg-[#FAF4EC] border border-[#EAD8C0] hover:border-[#4A2B18]/40 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                         <div className="w-12 h-12 md:w-14 md:h-14 bg-[#F5EAD8] border border-[#EAD8C0] rounded-2xl flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform">
                            📦
                         </div>
                         <div className="space-y-1">
                            <div className="text-[9px] md:text-[10px] font-black text-[#8C532B] uppercase tracking-widest">Ref: {order.id}</div>
                            <div className="text-xs md:text-sm font-black uppercase text-[#261409]">{order.items.length} Pair{order.items.length > 1 ? 's' : ''} Ordered</div>
                            <div className="text-[8px] font-bold text-[#5A331C] uppercase tracking-widest">{new Date(order.timestamp).toLocaleDateString('en-GB', { timeZone: 'GMT' })}</div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10">
                         <div className="text-left md:text-right">
                            <div className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest mb-1">Status</div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              order.status === OrderStatus.DELIVERED ? 'bg-green-500/10 text-green-700' :
                              order.status === OrderStatus.CANCELLED ? 'bg-red-500/10 text-red-600' :
                              'bg-[#4A2B18]/10 text-[#4A2B18]'
                            }`}>
                              {order.status}
                            </span>
                         </div>
                         <div className="text-right">
                            <div className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest mb-1">Valuation</div>
                            <div className="text-lg md:text-xl font-mono font-black text-[#261409]">GH₵{order.total}</div>
                         </div>
                         <div className="hidden md:block text-[#5A331C] group-hover:text-[#4A2B18] transition-colors">→</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Saved Sets */}
            <section className="space-y-8 md:space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1">
                  <h3 className="text-xl md:text-2xl font-serif italic whitespace-nowrap text-[#261409]">Saved Footwear Sets</h3>
                  <div className="h-px w-full bg-[#EAD8C0]"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {isDataLoading ? (
                   [...Array(5)].map((_, i) => (
                     <div key={i} className="bg-[#FAF4EC] border border-[#EAD8C0] rounded-3xl p-4 space-y-4">
                       <div className="flex -space-x-4 mb-2 justify-center">
                         {[...Array(3)].map((_, j) => <Skeleton key={j} className="w-16 h-16 rounded-2xl border-2 border-[#4A2B18]" />)}
                       </div>
                       <div className="space-y-2">
                          <Skeleton className="h-3 w-3/4 mx-auto" variant="text" />
                          <Skeleton className="h-2 w-1/2 mx-auto" variant="text" />
                       </div>
                     </div>
                   ))
                ) : outfits.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-[#FAF4EC] border border-dashed border-[#EAD8C0] rounded-[3rem] opacity-60">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#5A331C]">No saved footwear combinations yet.</p>
                  </div>
                ) : (
                  outfits.map(outfit => (
                    <div key={outfit.id} className="group bg-[#FAF4EC] border border-[#EAD8C0] rounded-3xl overflow-hidden hover:border-[#4A2B18]/50 transition-all p-4 space-y-4">
                      <div className="flex -space-x-4 mb-2 justify-center">
                        {outfit.items.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-16 h-16 rounded-2xl border-2 border-[#4A2B18] overflow-hidden shadow-xl">
                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                          </div>
                        ))}
                        {outfit.items.length > 3 && (
                          <div className="w-16 h-16 rounded-2xl border-2 border-[#4A2B18] bg-[#3B2010] flex items-center justify-center text-[10px] font-black text-[#E5C9A8]">
                            +{outfit.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-black uppercase truncate text-[#261409]">{outfit.name}</div>
                        <div className="text-[8px] font-bold text-[#5A331C] uppercase tracking-widest">{new Date(outfit.timestamp).toLocaleDateString('en-GB', { timeZone: 'GMT' })}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'logistics' && (
          <section className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-6">
              <h3 className="text-xl md:text-2xl font-serif italic whitespace-nowrap text-[#261409]">Delivery Addresses</h3>
              <div className="h-px w-full bg-[#EAD8C0]"></div>
            </div>

            <div className="grid gap-4">
              {protocols.length === 0 ? (
                <div className="py-12 text-center bg-[#FAF4EC] border border-dashed border-[#EAD8C0] rounded-[2.5rem] opacity-60">
                   <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#5A331C]">No saved delivery addresses detected.</p>
                </div>
              ) : (
                protocols.map(protocol => (
                  <div 
                    key={protocol.id}
                    className="w-full bg-[#FAF4EC] border border-[#EAD8C0] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {editingProtocolId === protocol.id ? (
                      <div className="w-full space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            value={protocolEditForm?.name} 
                            onChange={(e) => setProtocolEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="bg-[#F5EAD8] border border-[#EAD8C0] p-4 rounded-xl text-xs font-bold text-[#261409] outline-none"
                            placeholder="Full Name"
                          />
                          <input 
                            type="text" 
                            value={protocolEditForm?.phone} 
                            onChange={(e) => setProtocolEditForm(prev => prev ? {...prev, phone: e.target.value} : null)}
                            className="bg-[#F5EAD8] border border-[#EAD8C0] p-4 rounded-xl text-xs font-bold text-[#261409] outline-none"
                            placeholder="Phone"
                          />
                          <input 
                            type="text" 
                            value={protocolEditForm?.address} 
                            onChange={(e) => setProtocolEditForm(prev => prev ? {...prev, address: e.target.value} : null)}
                            className="bg-[#F5EAD8] border border-[#EAD8C0] p-4 rounded-xl text-xs font-bold text-[#261409] outline-none sm:col-span-2"
                            placeholder="Address"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              if (protocolEditForm) {
                                const newProtocols = protocols.map(p => p.id === protocol.id ? protocolEditForm : p);
                                const userId = localStorage.getItem('cc-user-id');
                                if (userId) {
                                  await databaseService.saveUserLogistics(userId, newProtocols);
                                  onUpdateProtocols(newProtocols);
                                  setEditingProtocolId(null);
                                  toast.success("Address Updated");
                                }
                              }
                            }}
                            className="bg-[#4A2B18] text-[#FAF4EC] px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-[#3B2010] transition-colors"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingProtocolId(null)}
                            className="bg-[#F5EAD8] text-[#5A331C] px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-[#F5EAD8] border border-[#EAD8C0] rounded-2xl flex items-center justify-center text-xl md:text-2xl">
                              👤
                          </div>
                          <div className="space-y-1">
                              <div className="text-xs md:text-sm font-black uppercase text-[#261409]">{protocol.name}</div>
                              <div className="text-[8px] font-bold text-[#5A331C] uppercase tracking-widest">{protocol.city}, {protocol.region}</div>
                              <div className="text-[8px] font-bold text-[#8C532B] uppercase tracking-widest">{protocol.phone}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => {
                              setEditingProtocolId(protocol.id);
                              setProtocolEditForm(protocol);
                            }}
                            className="text-[8px] font-black text-[#4A2B18] uppercase tracking-widest hover:underline"
                          >
                            Edit Address
                          </button>
                          <button 
                            onClick={async () => {
                              const newProtocols = protocols.filter(p => p.id !== protocol.id);
                              const userId = localStorage.getItem('cc-user-id');
                              if (userId) {
                                await databaseService.saveUserLogistics(userId, newProtocols);
                                onUpdateProtocols(newProtocols);
                                toast.success("Address Deleted");
                              }
                            }}
                            className="text-[8px] font-black text-red-600 uppercase tracking-widest hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'referrals' && (
          <section id="referrals-hub" className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-6">
              <h3 className="text-xl md:text-2xl font-serif italic whitespace-nowrap text-[#261409]">Referrals</h3>
              <div className="h-px w-full bg-[#EAD8C0]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-[2rem] border relative overflow-hidden group bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] text-7xl font-mono select-none pointer-events-none text-[#4A2B18]">CODE</div>
                  <div className="space-y-4">
                    <span className="text-[8px] font-black text-[#8C532B] uppercase tracking-widest block">Your Unique Invite Code</span>
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                      <div className="flex-1 font-mono font-black text-[#261409] text-lg bg-[#F5EAD8] border border-[#EAD8C0] p-4 rounded-xl flex items-center justify-between">
                        <span>{referralStats?.referralCode || `BEC_${handle.toUpperCase()}`}</span>
                        <button 
                          onClick={() => {
                            const code = referralStats?.referralCode || `BEC_${handle.toUpperCase()}`;
                            navigator.clipboard.writeText(code);
                            toast.success("Referral code copied to clipboard!");
                          }}
                          className="text-[#4A2B18] hover:underline hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
                        >
                          Copy Code
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          const code = referralStats?.referralCode || `BEC_${handle.toUpperCase()}`;
                          const shareLink = `${window.location.origin}/register?ref=${code}`;
                          navigator.clipboard.writeText(shareLink);
                          toast.success("Affiliate registration link copied!");
                        }}
                        className="bg-[#4A2B18] text-[#FAF4EC] hover:bg-[#3B2010] transition-all px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]"
                      >
                        Copy Link
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-[#5A331C] italic mt-2">
                      Share your B.E.C Footwear invite code or link with friends. You earn +200 REP and 10% store credit on their first order, while they unlock GH₵5 welcome credit & +50 REP!
                    </p>
                  </div>
                </div>

                {/* Bind Referrer */}
                <div className="p-6 sm:p-8 rounded-[2rem] border relative overflow-hidden group bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
                  <div className="space-y-4">
                    <span className="text-[8px] font-black text-[#8C532B] uppercase tracking-widest block">Link Referral Source</span>
                    {referralStats?.referrer ? (
                      <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">🔗</div>
                        <div>
                          <div className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Active Link Partner</div>
                          <div className="text-xs font-black uppercase text-[#261409]">{referralStats.referrer.handle}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-[#5A331C]">
                          Were you invited by a friend? Enter their referral code here to link accounts and unlock a GH₵5 welcome reward.
                        </p>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="B.E.C FRIEND CODE"
                            value={referralCodeInput}
                            onChange={(e) => setReferralCodeInput(e.target.value)}
                            className="flex-1 bg-[#F5EAD8] border border-[#EAD8C0] p-4 rounded-xl text-xs font-black text-[#261409] outline-none focus:border-[#4A2B18] transition-all uppercase"
                          />
                          <button 
                            onClick={async () => {
                              if (!referralCodeInput.trim()) {
                                toast.error("Please enter a referral code.");
                                return;
                              }
                              setIsBindingReferral(true);
                              try {
                                const res = await databaseService.bindReferralCode(referralCodeInput);
                                if (res.status === 'success') {
                                  toast.success(res.message || "Referral Applied!");
                                  setReferralCodeInput('');
                                  refreshData();
                                  if (stats && onUpdateStats) {
                                    const userId = localStorage.getItem('cc-user-id');
                                    if (userId) {
                                      const updatedProfile = await fetch(`${window.location.origin}/api/user/profile/${userId}`, {
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('cc-auth-token')}` }
                                      }).then(r => r.json());
                                      if (updatedProfile && updatedProfile.stats) {
                                        onUpdateStats(updatedProfile.stats);
                                      }
                                    }
                                  }
                                } else {
                                  toast.error(res.message || "Referral code error.");
                                }
                              } catch (err: any) {
                                toast.error(err.message || "Error linking referral.");
                              } finally {
                                setIsBindingReferral(false);
                              }
                            }}
                            disabled={isBindingReferral}
                            className="bg-[#8C532B] text-[#FAF4EC] font-black px-6 rounded-xl hover:bg-[#4A2B18] active:scale-95 transition-transform text-[9px] uppercase tracking-widest disabled:opacity-50"
                          >
                            {isBindingReferral ? 'Linking...' : 'Bind'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics Grid & History */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border flex flex-col justify-between min-h-[110px] bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
                    <span className="text-[8px] font-black text-[#8C532B] uppercase tracking-widest">Referred Friends</span>
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-[#261409]">{referralStats?.referredUsers?.length || 0}</div>
                      <span className="text-[7px] font-bold text-[#5A331C] uppercase tracking-widest">Successful Connections</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl border flex flex-col justify-between min-h-[110px] bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
                    <span className="text-[8px] font-black text-[#8C532B] uppercase tracking-widest">Store Credit Earned</span>
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl font-mono font-black text-[#4A2B18]">GH₵{referralStats?.totalEarnings || 0}</div>
                      <span className="text-[7px] font-bold text-[#5A331C] uppercase tracking-widest">Total Value Earned</span>
                    </div>
                  </div>
                </div>

                {/* Referred Users List */}
                <div className="p-6 rounded-[2rem] border min-h-[160px] flex flex-col relative overflow-hidden bg-[#FAF4EC] border-[#EAD8C0] shadow-sm text-[#261409]">
                  <span className="text-[8px] font-black text-[#5A331C] uppercase tracking-widest mb-4 block">Affiliate History</span>
                  
                  {referralStats?.referredUsers && referralStats.referredUsers.length > 0 ? (
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {referralStats.referredUsers.map((user: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-[#F5EAD8] border border-[#EAD8C0] p-3 rounded-xl hover:border-[#8C532B] transition-all">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase text-[#261409]">{user.handle}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-mono font-black text-emerald-700">+GH₵{user.rewardAmount}</span>
                            <div className="text-[7px] font-bold text-[#5A331C] uppercase tracking-[0.1em]">{new Date(user.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-4">
                      <div className="text-3xl mb-1">📡</div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#8C532B]">No active referral connections yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'insights' && (
          <PurchaseInsights orders={userOrders} theme={theme} />
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onReorder={onReorder}
        />
      )}
    </div>
  );
};

export default Profile;
