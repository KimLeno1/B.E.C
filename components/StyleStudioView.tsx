import React, { useState, useEffect } from 'react';
import { Product, UserStats, RankBenefits, ViewState, UserPreferences } from '../types';
import OutfitBuilder from './OutfitBuilder';
import TryOn from './TryOn';
import KrazeLookLab from './KrazeLookLab';
import { getStylingAdvice, generateDreamOutfit } from '../services/geminiService';
import { motion } from 'motion/react';
import { 
  Sparkles, Footprints, ChevronLeft, Bot, 
  Layers, RefreshCw, ArrowRight, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export interface StyleStudioViewProps {
  initialPanel?: 'hub' | 'assembler' | 'tryon' | 'oracle' | 'looklab';
  products: Product[];
  stats: UserStats;
  rank: RankBenefits;
  onNavigate: (view: ViewState) => void;
  onLockLook?: (items: Product[]) => Promise<void> | void;
  onUpdateStats?: (stats: UserStats) => void;
  wishlistProducts?: Product[];
  haulProducts?: Product[];
  onTryOnUsed?: () => void;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product, size?: string) => void;
  userPassport?: UserPreferences;
}

export const StyleStudioView: React.FC<StyleStudioViewProps> = ({
  initialPanel = 'looklab',
  products = [],
  stats,
  rank,
  onNavigate,
  onLockLook = () => {},
  onUpdateStats,
  wishlistProducts = [],
  haulProducts = [],
  onTryOnUsed = () => {},
  onAddToCart = () => {},
  userPassport
}) => {
  const [currentPanel, setCurrentPanel] = useState<'hub' | 'assembler' | 'tryon' | 'oracle' | 'looklab'>(initialPanel);

  // Stylist AI Oracle State
  const [mood, setMood] = useState('');
  const [occasion, setOccasion] = useState('');
  const [advice, setAdvice] = useState('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [adviceLoadingText, setAdviceLoadingText] = useState('Consulting...');

  // Blueprint State (preserved cleanly)
  const [dreamDescription] = useState('');
  const [dreamImage, setDreamImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const usageCount = stats?.stylistAiUses || 0;
  const usageLimit = rank?.stylistAiLimit || 6;
  const canUseAI = usageCount < usageLimit;

  useEffect(() => {
    let interval: any;
    if (isLoadingAdvice) {
      const texts = ['SYNCING_STUDIO', 'CURATING_PAIRS', 'FINALIZING_VERDICT'];
      let i = 0;
      interval = setInterval(() => setAdviceLoadingText(texts[i++ % texts.length]), 600);
    }
    return () => clearInterval(interval);
  }, [isLoadingAdvice]);

  const recordUsage = () => {
    if (stats && onUpdateStats) {
      onUpdateStats({ ...stats, stylistAiUses: usageCount + 1 });
    }
  };

  const handleConsult = async () => {
    if (!mood || !occasion) return;
    setIsLoadingAdvice(true);
    try {
      const result = await getStylingAdvice(mood, occasion);
      setAdvice(result);
    } catch {
      setAdvice("Maintain clean espresso and oat-cream tones paired with B.E.C all-terrain clogs or studded slides.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  void dreamDescription;
  void dreamImage;
  void isGeneratingImage;
  void canUseAI;
  void setDreamImage;
  void setIsGeneratingImage;
  void generateDreamOutfit;
  void recordUsage;

  return (
    <div className="min-h-screen bg-[#1E0F06] text-[#FAF4EC] font-sans selection:bg-[#8C532B] selection:text-[#FAF4EC] pb-32">
      
      {/* STICKY TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-40 bg-[#1E0F06]/95 backdrop-blur-xl border-b border-[#5A331C]/60 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <button
          onClick={() => {
            if (currentPanel !== 'hub') {
              setCurrentPanel('hub');
            } else {
              onNavigate(ViewState.LOBBY);
            }
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#E5C9A8] hover:text-[#FAF4EC] hover:bg-[#3B2010] transition-all cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>{currentPanel !== 'hub' ? 'Studio Hub' : 'Exit Studio'}</span>
        </button>

        {/* SEGMENTED TAB SWITCHER */}
        <div className="flex bg-[#261409] p-1 rounded-2xl border border-[#5A331C]/70 shadow-inner overflow-x-auto">
          <button
            onClick={() => setCurrentPanel('looklab')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              currentPanel === 'looklab' ? 'bg-[#8C532B] text-[#FAF4EC] shadow-lg' : 'text-[#EAD8C0]/70 hover:text-[#FAF4EC]'
            }`}
          >
            <Sparkles size={13} className="text-[#E5C9A8]" />
            <span className="hidden sm:inline">Look Lab</span>
          </button>

          <button
            onClick={() => setCurrentPanel('hub')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              currentPanel === 'hub' ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg border border-[#E5C9A8]/30' : 'text-[#EAD8C0]/70 hover:text-[#FAF4EC]'
            }`}
          >
            <Layers size={13} />
            <span className="hidden sm:inline">Hub</span>
          </button>

          <button
            onClick={() => setCurrentPanel('assembler')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              currentPanel === 'assembler' ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg border border-[#E5C9A8]/30' : 'text-[#EAD8C0]/70 hover:text-[#FAF4EC]'
            }`}
          >
            <Footprints size={13} />
            <span className="hidden sm:inline">Pair Builder</span>
          </button>

          <button
            onClick={() => setCurrentPanel('tryon')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              currentPanel === 'tryon' ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg border border-[#E5C9A8]/30' : 'text-[#EAD8C0]/70 hover:text-[#FAF4EC]'
            }`}
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Try-On</span>
          </button>

          <button
            onClick={() => setCurrentPanel('oracle')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              currentPanel === 'oracle' ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-lg border border-[#E5C9A8]/30' : 'text-[#EAD8C0]/70 hover:text-[#FAF4EC]'
            }`}
          >
            <Bot size={13} />
            <span className="hidden sm:inline">Stylist AI</span>
          </button>
        </div>

        {/* TIER ALLOCATION BADGE */}
        <div className="hidden md:flex items-center gap-3 bg-[#261409] px-4 py-2 rounded-xl border border-[#5A331C] text-[9px] font-black uppercase tracking-widest text-[#FAF4EC] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{rank.tier} Tier</span>
          <span className="text-[#8C532B]">|</span>
          <span className="text-[#E5C9A8]">Sessions: {stats.aiTryOnsUsedToday || 0}/{rank.aiTryOnLimit}</span>
        </div>
      </div>

      {/* MAIN CONTENT CANVAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* ==================== LOOK LAB VIEW ==================== */}
        {currentPanel === 'looklab' && (
          <KrazeLookLab
            products={products}
            onAddToCart={onAddToCart}
            onLockLook={onLockLook}
            userPassport={userPassport}
          />
        )}

        {/* ==================== HUB VIEW ==================== */}
        {currentPanel === 'hub' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4A2B18]/60 border border-[#E5C9A8]/30 text-[#E5C9A8] text-[10px] font-mono font-bold uppercase tracking-widest">
                <Sparkles size={12} className="animate-pulse" />
                <span>B.E.C Footwear Styling Suite</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-serif italic text-[#FAF4EC] tracking-tighter leading-none">
                B.E.C Footwear <span className="text-[#E5C9A8] not-italic font-sans font-black uppercase">Studio</span>
              </h1>
              
              <p className="text-[#EAD8C0]/80 text-xs sm:text-sm font-sans leading-relaxed">
                Curate clogs, studded slides, double-strap sandals, and slippers, preview fit pairings, and get instant footwear recommendations across EU sizes 38–45.
              </p>
            </div>

            {/* QUICK STATS & ALLOCATION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#261409] border border-[#5A331C] p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-[#EAD8C0]/75 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span>Virtual Previews</span>
                  <Sparkles size={14} className="text-[#E5C9A8]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#FAF4EC]">
                  {stats.aiTryOnsUsedToday || 0} / {rank.aiTryOnLimit}
                  <span className="text-xs font-normal text-[#EAD8C0]/60 ml-2">used today</span>
                </div>
                <div className="w-full bg-[#1E0F06] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#E5C9A8] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((stats.aiTryOnsUsedToday || 0) / rank.aiTryOnLimit) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#261409] border border-[#5A331C] p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-[#EAD8C0]/75 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span>Stylist Consults</span>
                  <Bot size={14} className="text-[#E5C9A8]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#FAF4EC]">
                  {usageCount} / {usageLimit}
                  <span className="text-xs font-normal text-[#EAD8C0]/60 ml-2">allocations</span>
                </div>
                <div className="w-full bg-[#1E0F06] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#8C532B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (usageCount / usageLimit) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#261409] border border-[#5A331C] p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between text-[#EAD8C0]/75 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span>Member Rank</span>
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-[#FAF4EC] flex items-center gap-2">
                  <span>{rank.tier}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30 uppercase">
                    VIP
                  </span>
                </div>
                <p className="text-[10px] text-[#EAD8C0]/60">Unlocks daily studio allowances & priority Ghana delivery</p>
              </div>
            </div>

            {/* PORTAL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* LOOK LAB CARD */}
              <div 
                onClick={() => setCurrentPanel('looklab')}
                className="group relative bg-[#261409] border border-[#8C532B] hover:border-[#E5C9A8] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_40px_rgba(229,201,168,0.18)] cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8C532B]/20 rounded-full blur-2xl group-hover:bg-[#E5C9A8]/20 transition-all"></div>
                <div className="space-y-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#4A2B18] border border-[#E5C9A8]/30 flex items-center justify-center text-[#E5C9A8] group-hover:scale-110 transition-transform">
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#E5C9A8] bg-[#4A2B18] border border-[#E5C9A8]/20 px-2.5 py-1 rounded-full">
                      Curated Engine
                    </span>
                    <h3 className="text-2xl font-black text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors">
                      B.E.C Look Lab
                    </h3>
                    <p className="text-xs text-[#EAD8C0]/75 leading-relaxed font-sans">
                      Pair B.E.C Footwear collections with 7 styling modes, live inventory grounding, and GH₵ budget control.
                    </p>
                  </div>
                </div>
                <div className="pt-8 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#E5C9A8] group-hover:text-[#FAF4EC] transition-colors relative z-10 border-t border-[#5A331C]/50 mt-6">
                  <span>Enter Look Lab</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* CARD 1: PAIR BUILDER */}
              <div 
                onClick={() => setCurrentPanel('assembler')}
                className="group relative bg-[#261409] border border-[#5A331C] hover:border-[#E5C9A8] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_40px_rgba(229,201,168,0.15)] cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A2B18]/30 rounded-full blur-2xl group-hover:bg-[#8C532B]/30 transition-all"></div>
                <div className="space-y-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#3B2010] border border-[#8C532B]/40 flex items-center justify-center text-[#E5C9A8] group-hover:scale-110 transition-transform">
                    <Footprints size={28} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#E5C9A8] bg-[#3B2010] border border-[#5A331C] px-2.5 py-1 rounded-full">
                      Rotation Builder
                    </span>
                    <h3 className="text-2xl font-black text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors">
                      Pair Assembler
                    </h3>
                    <p className="text-xs text-[#EAD8C0]/75 leading-relaxed font-sans">
                      Interactive canvas for combining clogs, slides, sandals, and slippers into a multi-pair bundle.
                    </p>
                  </div>
                </div>
                <div className="pt-8 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors relative z-10 border-t border-[#5A331C]/50 mt-6">
                  <span>Launch Builder</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* CARD 2: VIRTUAL TRY-ON LAB */}
              <div 
                onClick={() => setCurrentPanel('tryon')}
                className="group relative bg-[#261409] border border-[#5A331C] hover:border-[#E5C9A8] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_40px_rgba(229,201,168,0.15)] cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A2B18]/30 rounded-full blur-2xl group-hover:bg-[#8C532B]/30 transition-all"></div>
                <div className="space-y-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#3B2010] border border-[#8C532B]/40 flex items-center justify-center text-[#E5C9A8] group-hover:scale-110 transition-transform">
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#E5C9A8] bg-[#3B2010] border border-[#5A331C] px-2.5 py-1 rounded-full">
                      Studio Fitting
                    </span>
                    <h3 className="text-2xl font-black text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors">
                      B.E.C Studio Preview
                    </h3>
                    <p className="text-xs text-[#EAD8C0]/75 leading-relaxed font-sans">
                      Preview how B.E.C Footwear clogs and slides match your style using a photo or lookbook model.
                    </p>
                  </div>
                </div>
                <div className="pt-8 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors relative z-10 border-t border-[#5A331C]/50 mt-6">
                  <span>Open Studio</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* CARD 3: STYLIST ORACLE */}
              <div 
                onClick={() => setCurrentPanel('oracle')}
                className="group relative bg-[#261409] border border-[#5A331C] hover:border-[#E5C9A8] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_40px_rgba(229,201,168,0.15)] cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A2B18]/30 rounded-full blur-2xl group-hover:bg-[#8C532B]/30 transition-all"></div>
                <div className="space-y-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#3B2010] border border-[#8C532B]/40 flex items-center justify-center text-[#E5C9A8] group-hover:scale-110 transition-transform">
                    <Bot size={28} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#E5C9A8] bg-[#3B2010] border border-[#5A331C] px-2.5 py-1 rounded-full">
                      Stylist Verdict
                    </span>
                    <h3 className="text-2xl font-black text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors">
                      Footwear Oracle
                    </h3>
                    <p className="text-xs text-[#EAD8C0]/75 leading-relaxed font-sans">
                      Consult our B.E.C Footwear specialist for quick recommendations on clogs, slides, and weekend comfort.
                    </p>
                  </div>
                </div>
                <div className="pt-8 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors relative z-10 border-t border-[#5A331C]/50 mt-6">
                  <span>Consult Oracle</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ==================== ASSEMBLER VIEW ==================== */}
        {currentPanel === 'assembler' && (
          <OutfitBuilder 
            products={products}
            stats={stats}
            onNavigate={onNavigate}
            onLockLook={onLockLook}
          />
        )}

        {/* ==================== TRY-ON VIEW ==================== */}
        {currentPanel === 'tryon' && (
          <TryOn 
            rank={rank}
            stats={stats}
            onUsed={onTryOnUsed}
            wishlistProducts={wishlistProducts}
            haulProducts={haulProducts}
          />
        )}

        {/* ==================== ORACLE VIEW ==================== */}
        {currentPanel === 'oracle' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10 max-w-5xl mx-auto"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A2B18] border border-[#E5C9A8]/30 text-[#E5C9A8] text-[10px] font-mono font-bold uppercase tracking-widest">
                <Bot size={12} />
                <span>B.E.C Footwear Stylist</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif italic text-[#FAF4EC]">Consult the Footwear Stylist</h2>
              <p className="text-[#EAD8C0]/80 text-xs sm:text-sm">Share your vibe and plans for the ideal clog, slide, or sandal pairing.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="bg-[#261409] border border-[#5A331C] p-8 rounded-3xl space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">Your Current Mood / Aesthetic</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g. Clean Minimalist, Espresso Luxe, Rugged Utility..."
                    className="w-full bg-[#1E0F06] border border-[#5A331C] rounded-2xl p-4 text-xs text-[#FAF4EC] placeholder-[#EAD8C0]/40 focus:border-[#E5C9A8] outline-none font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">Occasion / Destination</label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Weekend brunch in Accra, Cape Coast travel, daily errands..."
                    className="w-full bg-[#1E0F06] border border-[#5A331C] rounded-2xl p-4 text-xs text-[#FAF4EC] placeholder-[#EAD8C0]/40 focus:border-[#E5C9A8] outline-none font-sans"
                  />
                </div>

                <button
                  onClick={handleConsult}
                  disabled={isLoadingAdvice || !mood || !occasion}
                  className="w-full py-4 bg-[#8C532B] hover:bg-[#4A2B18] border border-[#E5C9A8]/30 disabled:opacity-40 text-[#FAF4EC] font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoadingAdvice ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{adviceLoadingText}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Request Footwear Recommendation</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#261409] border border-[#5A331C] p-8 rounded-3xl space-y-6 min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C9A8] mb-2">Stylist Verdict</div>
                  {advice ? (
                    <p className="text-sm font-serif italic text-[#FAF4EC] leading-relaxed">{advice}</p>
                  ) : (
                    <p className="text-xs text-[#EAD8C0]/60 italic">Configure your mood and destination to get a curated B.E.C Footwear recommendation.</p>
                  )}
                </div>
                <div className="pt-6 border-t border-[#5A331C]/60 flex justify-between items-center text-[10px] text-[#E5C9A8]/80 uppercase font-mono">
                  <span>Nationwide Delivery</span>
                  <span>B.E.C Footwear Studio</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default StyleStudioView;
