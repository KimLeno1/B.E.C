import React, { useState } from 'react';
import { UserStats } from '../types';

interface SubscriptionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateSubscriptions: (brands: string[], tags: string[]) => void;
}

const AVAILABLE_BRANDS = ["B.E.C SIGNATURE", "ALL-TERRAIN", "STUDDED STUDIO", "CLASSIC SLIDE", "DOUBLE-STRAP", "DOUBLE-BAND"];
const AVAILABLE_TAGS = ["CLOGS", "SLIDES", "SANDALS", "SLIPPERS", "ALL-TERRAIN", "DESIGNER", "EVERYDAY", "WATERPROOF", "COMFORT", "LUXE"];

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ 
  isOpen, 
  onClose, 
  stats, 
  onUpdateSubscriptions 
}) => {
  const [brandInput, setBrandInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const toggleBrand = (brand: string) => {
    const current = stats.brandSubscriptions || [];
    const updated = current.includes(brand) 
      ? current.filter(b => b !== brand) 
      : [...current, brand];
    onUpdateSubscriptions(updated, stats.tagSubscriptions || []);
  };

  const toggleTag = (tag: string) => {
    const current = stats.tagSubscriptions || [];
    const updated = current.includes(tag) 
      ? current.filter(t => t !== tag) 
      : [...current, tag];
    onUpdateSubscriptions(stats.brandSubscriptions || [], updated);
  };

  const handleAddCustomBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandInput.trim()) {
      const brand = brandInput.trim().toUpperCase();
      if (!(stats.brandSubscriptions || []).includes(brand)) {
        toggleBrand(brand);
      }
      setBrandInput('');
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim()) {
      const tag = tagInput.trim().toUpperCase();
      if (!(stats.tagSubscriptions || []).includes(tag)) {
        toggleTag(tag);
      }
      setTagInput('');
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-[400] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-lg bg-[#FAF4EC] z-[410] shadow-2xl transition-transform duration-500 ease-out border-l border-[#EAD8C0] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <header className="p-6 sm:p-10 border-b border-[#EAD8C0] flex items-center justify-between bg-[#F5EAD8]">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#3B2010] tracking-tighter">Alerts &amp; Following</h2>
              <div className="text-[7px] sm:text-[8px] font-black text-[#8C532B] uppercase tracking-[0.5em]">B.E.C Footwear Alerts</div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FAF4EC] border border-[#EAD8C0] rounded-full flex items-center justify-center text-[#5A331C] hover:text-[#3B2010] hover:bg-[#EAD8C0]/40 transition-all shadow-xs"
            >
              <span className="text-lg sm:text-xl">✕</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 sm:p-10 space-y-10 sm:space-y-16">
            
            {/* Collection Subscriptions */}
            <section className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-serif italic text-[#3B2010]">Follow Footwear Lines</h3>
                <p className="text-[9px] sm:text-[10px] text-[#5A331C] font-bold uppercase tracking-widest leading-relaxed">
                  Receive priority notifications when new sizes arrive in your favorite B.E.C lines.
                </p>
              </div>

              <form onSubmit={handleAddCustomBrand} className="relative">
                <input 
                  type="text"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  placeholder="Enter Footwear Line..."
                  className="w-full bg-white border border-[#EAD8C0] rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-6 text-[10px] sm:text-xs font-bold text-[#3B2010] focus:border-[#4A2B18] transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-[#4A2B18] text-[#FAF4EC] px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[7px] sm:text-[8px] font-black uppercase tracking-widest hover:bg-[#3B2010] transition-all shadow-sm"
                >
                  Follow
                </button>
              </form>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {AVAILABLE_BRANDS.map(brand => {
                  const isActive = (stats.brandSubscriptions || []).includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all ${
                        isActive 
                        ? 'bg-[#4A2B18] border-[#4A2B18] text-[#FAF4EC] shadow-sm' 
                        : 'bg-[#F5EAD8] border-[#EAD8C0] text-[#5A331C] hover:border-[#4A2B18]/40 hover:text-[#3B2010]'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>

              {(stats.brandSubscriptions || []).filter(b => !AVAILABLE_BRANDS.includes(b)).length > 0 && (
                <div className="space-y-3 sm:space-y-4 pt-4">
                  <div className="text-[7px] sm:text-[8px] font-black text-[#8C532B] uppercase tracking-widest">Custom Lines</div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {(stats.brandSubscriptions || []).filter(b => !AVAILABLE_BRANDS.includes(b)).map(brand => (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border bg-[#F5EAD8] border-[#8C532B]/40 text-[#4A2B18] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                      >
                        {brand} ✕
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Tag Subscriptions */}
            <section className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-serif italic text-[#3B2010]">Footwear Tag Alerts</h3>
                <p className="text-[9px] sm:text-[10px] text-[#5A331C] font-bold uppercase tracking-widest leading-relaxed">
                  Monitor B.E.C Footwear for specific styles. You will be alerted when matching pairs arrive.
                </p>
              </div>

              <form onSubmit={handleAddCustomTag} className="relative">
                <input 
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter Footwear Tag..."
                  className="w-full bg-white border border-[#EAD8C0] rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-6 text-[10px] sm:text-xs font-bold text-[#3B2010] focus:border-[#4A2B18] transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-[#4A2B18] text-[#FAF4EC] px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[7px] sm:text-[8px] font-black uppercase tracking-widest hover:bg-[#3B2010] transition-all shadow-sm"
                >
                  Follow
                </button>
              </form>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {AVAILABLE_TAGS.map(tag => {
                  const isActive = (stats.tagSubscriptions || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all ${
                        isActive 
                        ? 'bg-[#8C532B] border-[#8C532B] text-[#FAF4EC] shadow-sm' 
                        : 'bg-[#F5EAD8] border-[#EAD8C0] text-[#5A331C] hover:border-[#4A2B18]/40 hover:text-[#3B2010]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>

              {(stats.tagSubscriptions || []).filter(t => !AVAILABLE_TAGS.includes(t)).length > 0 && (
                <div className="space-y-3 sm:space-y-4 pt-4">
                  <div className="text-[7px] sm:text-[8px] font-black text-[#8C532B] uppercase tracking-widest">Custom Tags</div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {(stats.tagSubscriptions || []).filter(t => !AVAILABLE_TAGS.includes(t)).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border bg-[#F5EAD8] border-[#8C532B]/40 text-[#4A2B18] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                      >
                        #{tag} ✕
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>

          <footer className="p-6 sm:p-10 bg-[#F5EAD8] border-t border-[#EAD8C0]">
            <div className="p-4 sm:p-6 bg-[#FAF4EC] border border-[#EAD8C0] rounded-xl sm:rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
                <span className="text-[8px] sm:text-[9px] font-black text-[#3B2010] uppercase tracking-widest">Restock Alerts Active</span>
              </div>
              <p className="text-[7px] sm:text-[8px] text-[#5A331C] font-bold uppercase tracking-widest leading-relaxed">
                Subscribed footwear lines are monitored daily. Nationwide Delivery across Ghana.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPanel;
