import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { Bell, Sliders, CheckCircle2, TrendingDown, RefreshCw, Sparkles, Package, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export interface NotificationPreferences {
  priceDrops: boolean;
  restocks: boolean;
  styleMatches: boolean;
  upcomingDrops: boolean;
  orderUpdates: boolean;
  communityActivity: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  priceDrops: true,
  restocks: true,
  styleMatches: true,
  upcomingDrops: true,
  orderUpdates: true,
  communityActivity: false,
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkRead,
  onMarkAllRead 
}) => {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PREFERENCES'>('ALERTS');
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('ck-notification-preferences');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PREFERENCES;
  });

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('ck-notification-preferences', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success('Notification preferences updated.');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#261409]/60 backdrop-blur-sm z-[220] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#FAF4EC] z-[230] shadow-[-20px_0_80px_rgba(38,20,9,0.18)] transition-transform duration-500 ease-out border-l border-[#EAD8C0] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="p-5 sm:p-7 border-b border-[#EAD8C0] flex items-center justify-between bg-[#FAF4EC]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#8C532B]" />
                <h2 className="text-xl sm:text-2xl font-serif italic text-[#3B2010] leading-none">Notifications</h2>
              </div>
              <p className="text-[8px] sm:text-[9px] font-black text-[#8C532B] uppercase tracking-[0.3em]">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'ALERTS' && notifications.some(n => !n.read) && (
                <button 
                  onClick={onMarkAllRead}
                  className="text-[8px] font-black text-[#4A2B18] hover:text-[#261409] uppercase tracking-widest transition-colors py-1 px-2 rounded-lg bg-[#F5EAD8] border border-[#EAD8C0]"
                >
                  Mark All Read
                </button>
              )}
              <button 
                onClick={onClose} 
                className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center text-[#5A331C] hover:text-[#3B2010] hover:bg-[#F5EAD8] transition-colors"
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#EAD8C0] bg-[#F5EAD8]/60 p-1.5">
            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ALERTS' 
                  ? 'bg-[#FAF4EC] text-[#3B2010] shadow-sm border border-[#EAD8C0]' 
                  : 'text-[#8C532B] hover:text-[#3B2010]'
              }`}
            >
              <span>Activity</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#4A2B18] text-[#FAF4EC] text-[9px] font-mono flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('PREFERENCES')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'PREFERENCES' 
                  ? 'bg-[#FAF4EC] text-[#3B2010] shadow-sm border border-[#EAD8C0]' 
                  : 'text-[#8C532B] hover:text-[#3B2010]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 scrollbar-hide">
            {activeTab === 'ALERTS' ? (
              notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 opacity-60">
                  <div className="text-4xl sm:text-5xl mb-4">🔔</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4A2B18]">No active alerts</p>
                  <p className="text-xs text-[#5A331C] mt-1 max-w-xs">You're up to date on B.E.C Footwear drops, orders, and wishlist activity.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => onMarkRead(n.id)}
                    className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                      n.read ? 'bg-[#F5EAD8]/50 border-[#EAD8C0]/70 opacity-65' : 'bg-white border-[#EAD8C0] shadow-[0_4px_20px_rgba(74,43,24,0.06)]'
                    }`}
                  >
                    {!n.read && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#8C532B] shadow-[0_0_8px_rgba(140,83,43,0.6)]"></div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                          n.type === 'URGENT' ? 'bg-red-500 text-white' : 
                          n.type === 'REWARD' ? 'bg-[#E5C9A8] text-[#3B2010]' : 
                          n.type === 'WELCOME' ? 'bg-[#4A2B18] text-[#FAF4EC]' : 
                          'bg-[#F5EAD8] text-[#4A2B18]'
                        }`}>
                          {n.type}
                        </span>
                        <span className="text-[8px] font-mono text-[#8C532B] uppercase">{n.timestamp}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-black uppercase text-[#3B2010] group-hover:text-[#8C532B] transition-colors">{n.title}</h3>
                      <p className="text-[10px] sm:text-xs text-[#5A331C] leading-relaxed font-normal">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* PREFERENCES PANEL */
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-[#F5EAD8] border border-[#EAD8C0] space-y-1">
                  <p className="text-xs font-bold text-[#3B2010] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C532B]" />
                    B.E.C Footwear Drop Alerts
                  </p>
                  <p className="text-[11px] text-[#5A331C] leading-relaxed">
                    Control which updates you receive for restocked EU sizes, new clog arrivals, and dispatch alerts.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Price Drops */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAD8C0] bg-white hover:border-[#8C532B]/50 transition-all">
                    <div className="flex items-start gap-3 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#3B2010]">Wishlist Price Drops</p>
                        <p className="text-[11px] text-[#5A331C]/80">Alerts when footwear pairs in your saved list go on promo.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePreference('priceDrops')}
                      className={`w-12 h-6 min-w-[48px] rounded-full p-1 transition-colors ${preferences.priceDrops ? 'bg-[#4A2B18]' : 'bg-[#EAD8C0]'}`}
                      aria-label="Toggle wishlist price drop alerts"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.priceDrops ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Restocks */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAD8C0] bg-white hover:border-[#8C532B]/50 transition-all">
                    <div className="flex items-start gap-3 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-[#F5EAD8] text-[#8C532B] flex items-center justify-center shrink-0 mt-0.5">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#3B2010]">EU Size Restocks</p>
                        <p className="text-[11px] text-[#5A331C]/80">Notice when sold-out clogs, slides, or your EU size return to stock.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePreference('restocks')}
                      className={`w-12 h-6 min-w-[48px] rounded-full p-1 transition-colors ${preferences.restocks ? 'bg-[#4A2B18]' : 'bg-[#EAD8C0]'}`}
                      aria-label="Toggle restock alerts"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.restocks ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Style Passport Matches */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAD8C0] bg-white hover:border-[#8C532B]/50 transition-all">
                    <div className="flex items-start gap-3 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#3B2010]">Style Passport Matches</p>
                        <p className="text-[11px] text-[#5A331C]/80">Alerts when new designer clogs or sandals match your taste.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePreference('styleMatches')}
                      className={`w-12 h-6 min-w-[48px] rounded-full p-1 transition-colors ${preferences.styleMatches ? 'bg-[#4A2B18]' : 'bg-[#EAD8C0]'}`}
                      aria-label="Toggle style match alerts"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.styleMatches ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Upcoming Drops & Pair Packs */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAD8C0] bg-white hover:border-[#8C532B]/50 transition-all">
                    <div className="flex items-start gap-3 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#3B2010]">Exclusive Drops &amp; Multi-Pair Packs</p>
                        <p className="text-[11px] text-[#5A331C]/80">Priority countdowns and early access to limited footwear drops.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePreference('upcomingDrops')}
                      className={`w-12 h-6 min-w-[48px] rounded-full p-1 transition-colors ${preferences.upcomingDrops ? 'bg-[#4A2B18]' : 'bg-[#EAD8C0]'}`}
                      aria-label="Toggle capsule drop alerts"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.upcomingDrops ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Order & Courier Updates */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAD8C0] bg-white hover:border-[#8C532B]/50 transition-all">
                    <div className="flex items-start gap-3 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-[#F5EAD8] text-[#3B2010] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#3B2010]">Order &amp; Nationwide Dispatch</p>
                        <p className="text-[11px] text-[#5A331C]/80">Live courier tracking and Nationwide Delivery progress in Ghana.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePreference('orderUpdates')}
                      className={`w-12 h-6 min-w-[48px] rounded-full p-1 transition-colors ${preferences.orderUpdates ? 'bg-[#4A2B18]' : 'bg-[#EAD8C0]'}`}
                      aria-label="Toggle order tracking alerts"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.orderUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Community Activity */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAD8C0] bg-white hover:border-[#8C532B]/50 transition-all">
                    <div className="flex items-start gap-3 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#3B2010]">Community Activity</p>
                        <p className="text-[11px] text-[#5A331C]/80">Notifications when members react to your B.E.C Footwear lookbook posts.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePreference('communityActivity')}
                      className={`w-12 h-6 min-w-[48px] rounded-full p-1 transition-colors ${preferences.communityActivity ? 'bg-[#4A2B18]' : 'bg-[#EAD8C0]'}`}
                      aria-label="Toggle community notifications"
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.communityActivity ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="p-4 sm:p-6 bg-[#FAF4EC] border-t border-[#EAD8C0]">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-black text-[#8C532B] uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-600" />
                Nationwide Delivery Active
              </span>
              <span>B.E.C Footwear Ghana</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;