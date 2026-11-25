import React, { useState, useEffect } from 'react';
import { Product, UserPreferences } from '../types';
import { generateLookLabOutfit } from '../services/geminiService';
import { 
  Sparkles, Footprints, Camera, Check, RefreshCw, 
  DollarSign, Calendar, Sliders, Layers, ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';

interface KrazeLookLabProps {
  products: Product[];
  onAddToCart: (product: Product, size?: string) => void;
  onLockLook: (items: Product[]) => void;
  userPassport?: UserPreferences;
}

export const KrazeLookLab: React.FC<KrazeLookLabProps> = ({
  products = [],
  onAddToCart,
  onLockLook,
  userPassport
}) => {
  const [intention, setIntention] = useState<'style_me' | 'complete_outfit' | 'occasion_outfit' | 'budget_outfit' | 'style_product' | 'inspiration_match' | 'three_way_styling'>('style_me');
  const [promptText, setPromptText] = useState('');
  const [occasion, setOccasion] = useState('Weekend Casual & Errands');
  const [budget, setBudget] = useState<number>(600);
  const [targetProduct, setTargetProduct] = useState<Product | null>(products[0] || null);
  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Curating footwear pairings...');
  const [curatedOutfit, setCuratedOutfit] = useState<any | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      const steps = [
        'REVIEWING_FOOTWEAR_PREFERENCES',
        'SEARCHING_BEC_COLLECTION',
        'MATCHING_SILHOUETTE_TONES',
        'CHECKING_BUDGET_BALANCE',
        'FINALIZING_CURATED_ROTATION'
      ];
      let idx = 0;
      timer = setInterval(() => {
        setLoadingStepText(steps[idx++ % steps.length]);
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInspirationImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateLookLabOutfit({
        intention,
        prompt: promptText,
        occasion,
        budget: intention === 'budget_outfit' ? budget : undefined,
        targetProductId: targetProduct?.id,
        inspirationImage: inspirationImage || undefined,
        userPassport
      });
      setCuratedOutfit(result);
      toast.success("B.E.C Footwear pairing generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate footwear styling");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAllToBag = () => {
    if (!curatedOutfit?.items) return;
    const lockedProducts: Product[] = [];
    curatedOutfit.items.forEach((item: any) => {
      if (item.product) {
        onAddToCart(item.product, item.product.sizes?.[0] || 'EU 42');
        lockedProducts.push(item.product);
      }
    });
    if (lockedProducts.length > 0) {
      onLockLook(lockedProducts);
    }
    toast.success("Complete footwear rotation added to bag!");
  };

  const intentionsList = [
    { id: 'style_me', label: 'Style Me', icon: Sparkles, desc: 'Tailored to your B.E.C Passport' },
    { id: 'complete_outfit', label: 'Pair Rotation', icon: Footprints, desc: 'Build around a signature pair' },
    { id: 'occasion_outfit', label: 'Occasion Finder', icon: Calendar, desc: 'Pairs matched to your plans' },
    { id: 'budget_outfit', label: 'Budget Builder', icon: DollarSign, desc: 'Strict GH₵ budget cap' },
    { id: 'style_product', label: 'Pair Styler', icon: Sliders, desc: '3 distinct styling directions' },
    { id: 'inspiration_match', label: 'Inspo Match', icon: Camera, desc: 'Upload outfit photo to match' },
    { id: 'three_way_styling', label: '3-Way Rotation', icon: Layers, desc: 'Clogs, Slides & Sandals' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-500">
      
      {/* HEADER HERO */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4A2B18]/40 border border-[#E5C9A8]/30 text-[#E5C9A8] text-[10px] font-mono font-bold uppercase tracking-widest">
          <Sparkles size={12} className="animate-pulse" />
          <span>B.E.C Footwear Look Lab</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif italic text-[#FAF4EC] tracking-tighter leading-none">
          B.E.C <span className="text-[#E5C9A8] not-italic font-sans font-black uppercase">Look Lab</span>
        </h1>
        <p className="text-[#EAD8C0]/80 text-xs sm:text-sm font-sans leading-relaxed">
          Select an intention below to curate clogs, slides, sandals, and slippers from verified B.E.C Footwear inventory in EU 38–45.
        </p>
      </div>

      {/* INTENTION SELECTOR GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {intentionsList.map((item) => {
          const Icon = item.icon;
          const isActive = intention === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setIntention(item.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive 
                  ? 'bg-gradient-to-br from-[#4A2B18] to-[#8C532B]/70 border-[#E5C9A8] shadow-lg shadow-[#1E0F06]/40 scale-105' 
                  : 'bg-[#261409]/80 border-[#4A2B18]/60 hover:border-[#8C532B] hover:bg-[#3B2010]/70'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={isActive ? 'text-[#E5C9A8]' : 'text-[#EAD8C0]/70'} />
                {isActive && <div className="w-2 h-2 rounded-full bg-[#E5C9A8] animate-ping"></div>}
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-[#FAF4EC] mb-1">{item.label}</div>
                <div className="text-[9px] text-[#EAD8C0]/70 line-clamp-2 leading-tight">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* INTENTION INPUT PANEL */}
      <div className="bg-[#261409]/90 border border-[#5A331C] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-[#5A331C]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#4A2B18] border border-[#E5C9A8]/30 flex items-center justify-center text-[#E5C9A8] font-bold text-xs">
              BEC
            </div>
            <div>
              <h3 className="text-sm font-black text-[#FAF4EC] uppercase tracking-wider">Configure Footwear Styling</h3>
              <p className="text-[10px] text-[#EAD8C0]/70">Real-time B.E.C Footwear inventory matching</p>
            </div>
          </div>
          <div className="text-[10px] font-mono font-bold uppercase px-3 py-1 bg-[#3B2010] rounded-lg border border-[#5A331C] text-[#E5C9A8]">
            Mode: {intention.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {intention === 'budget_outfit' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">Maximum Budget (GH₵)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-[#1E0F06] border border-[#5A331C] rounded-xl px-4 py-3 text-[#FAF4EC] font-mono text-sm focus:outline-none focus:border-[#E5C9A8]"
                placeholder="600"
              />
            </div>
          )}

          {intention === 'occasion_outfit' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">Select Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-[#1E0F06] border border-[#5A331C] rounded-xl px-4 py-3 text-[#FAF4EC] text-xs focus:outline-none focus:border-[#E5C9A8]"
              >
                <option value="Weekend Casual & Errands">Weekend Casual & Errands</option>
                <option value="Campus & Street">Campus & Street</option>
                <option value="Lounging & Travel">Lounging & Travel</option>
                <option value="Resort & Coastal">Resort & Coastal</option>
                <option value="Evening Social & Lounge">Evening Social & Lounge</option>
                <option value="Everyday Comfort Rotation">Everyday Comfort Rotation</option>
              </select>
            </div>
          )}

          {(intention === 'complete_outfit' || intention === 'style_product' || intention === 'three_way_styling') && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">Target Core Pair</label>
              <div 
                onClick={() => setShowProductSelector(true)}
                className="flex items-center justify-between p-3 bg-[#1E0F06] border border-[#5A331C] rounded-xl cursor-pointer hover:border-[#E5C9A8] transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={targetProduct?.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <div>
                    <div className="text-[11px] font-bold text-[#FAF4EC] uppercase">{targetProduct?.name || 'Select Pair...'}</div>
                    <div className="text-[9px] text-[#E5C9A8] font-mono">GH₵{targetProduct?.price || 0}</div>
                  </div>
                </div>
                <span className="text-xs text-[#E5C9A8] uppercase tracking-wider font-bold">Change</span>
              </div>
            </div>
          )}

          {intention === 'inspiration_match' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">Upload Outfit Photo</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-[#1E0F06] border border-[#5A331C] rounded-xl px-4 py-2.5 text-xs text-[#EAD8C0] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#8C532B] file:text-[#FAF4EC] hover:file:bg-[#4A2B18] cursor-pointer"
                />
                {inspirationImage && (
                  <img src={inspirationImage} className="w-10 h-10 rounded-lg object-cover border border-[#E5C9A8]" alt="Inspo" />
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">Custom Styling Direction or Prompt</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Pair all-terrain khaki clogs with weekend travel slides for a clean everyday rotation..."
              rows={3}
              className="w-full bg-[#1E0F06] border border-[#5A331C] rounded-2xl p-4 text-[#FAF4EC] placeholder-[#EAD8C0]/40 text-xs focus:outline-none focus:border-[#E5C9A8] resize-none font-sans"
            ></textarea>
          </div>
        </div>

        <button
          disabled={isGenerating}
          onClick={handleGenerate}
          className="w-full py-5 bg-gradient-to-r from-[#8C532B] to-[#4A2B18] border border-[#E5C9A8]/30 text-[#FAF4EC] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:from-[#9F6135] hover:to-[#5A331C] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>{loadingStepText}</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate B.E.C Footwear Styling</span>
            </>
          )}
        </button>
      </div>

      {/* CURATED OUTFIT RESULTS CANVAS */}
      {curatedOutfit && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-gradient-to-br from-[#261409] via-[#3B2010] to-[#1E0F06] border border-[#8C532B]/50 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-3xl">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#5A331C]/60 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A2B18] border border-[#E5C9A8]/30 text-[#E5C9A8] text-[9px] font-mono uppercase tracking-widest">
                  <Check size={12} />
                  <span>Curated B.E.C Rotation</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-serif italic text-[#FAF4EC]">{curatedOutfit.name}</h2>
                <p className="text-[#EAD8C0]/80 text-xs sm:text-sm font-sans max-w-2xl">{curatedOutfit.verdict}</p>
              </div>

              <div className="bg-[#1E0F06]/90 p-6 rounded-3xl border border-[#5A331C] text-right space-y-2 min-w-[200px]">
                <div className="text-[10px] font-black text-[#EAD8C0]/70 uppercase tracking-widest">Total Pair Valuation</div>
                <div className="text-3xl font-black font-mono text-[#FAF4EC]">GH₵{curatedOutfit.totalPrice}</div>
                <button
                  onClick={handleAddAllToBag}
                  className="w-full py-3 bg-[#E5C9A8] text-[#261409] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FAF4EC] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>Add Complete Rotation</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#E5C9A8] uppercase tracking-widest">Matched B.E.C Footwear Pairs ({curatedOutfit.items?.length || 0})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {curatedOutfit.items?.map((item: any, idx: number) => {
                  const p = item.product;
                  if (!p) return null;
                  return (
                    <div key={idx} className="bg-[#1E0F06]/90 border border-[#5A331C] rounded-2xl p-4 space-y-4 relative group hover:border-[#E5C9A8] transition-all">
                      <div className="absolute top-3 left-3 bg-[#261409]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono text-[#E5C9A8] border border-[#5A331C] uppercase">
                        {item.role}
                      </div>
                      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#3B2010]">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt={p.name} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#FAF4EC] uppercase truncate">{p.name}</div>
                        <div className="text-[10px] text-[#EAD8C0]/70 line-clamp-2">{item.reasoning}</div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-mono font-black text-[#E5C9A8]">GH₵{p.price}</span>
                          <button
                            onClick={() => onAddToCart(p, p.sizes?.[0] || 'EU 42')}
                            className="px-3 py-1.5 bg-[#4A2B18] hover:bg-[#E5C9A8] hover:text-[#261409] text-[#FAF4EC] rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Add Pair
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {curatedOutfit.stylingDirections && curatedOutfit.stylingDirections.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-[#5A331C]/60">
                <h3 className="text-xs font-black text-[#E5C9A8] uppercase tracking-widest">Three-Way Styling Directions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {curatedOutfit.stylingDirections.map((dir: any, dIdx: number) => (
                    <div key={dIdx} className="bg-[#1E0F06]/80 border border-[#5A331C] rounded-3xl p-6 space-y-4">
                      <div className="text-[10px] font-mono text-[#E5C9A8] font-bold uppercase">Direction 0{dIdx + 1}</div>
                      <h4 className="text-lg font-serif italic text-[#FAF4EC]">{dir.title}</h4>
                      <p className="text-xs text-[#EAD8C0]/75 leading-relaxed">{dir.description}</p>
                      <div className="flex -space-x-3 overflow-hidden pt-2">
                        {dir.products?.map((dp: Product, pIdx: number) => (
                          <img key={pIdx} src={dp.image} className="w-12 h-12 rounded-xl object-cover border-2 border-[#261409]" alt="" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* PRODUCT SELECTOR MODAL */}
      {showProductSelector && (
        <div className="fixed inset-0 z-50 bg-[#1E0F06]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#261409] border border-[#5A331C] rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6 space-y-6 shadow-3xl">
            <div className="flex items-center justify-between border-b border-[#5A331C] pb-4">
              <h3 className="text-lg font-serif italic text-[#FAF4EC]">Select Core Footwear Pair</h3>
              <button onClick={() => setShowProductSelector(false)} className="text-[#E5C9A8] hover:text-[#FAF4EC] font-bold text-xs uppercase cursor-pointer">Close</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setTargetProduct(p);
                    setShowProductSelector(false);
                  }}
                  className="bg-[#1E0F06] border border-[#5A331C]/60 rounded-2xl p-3 cursor-pointer hover:border-[#E5C9A8] transition-all space-y-2 group"
                >
                  <img src={p.image} className="w-full aspect-[4/5] rounded-xl object-cover" alt={p.name} />
                  <div className="text-[10px] font-bold text-[#FAF4EC] uppercase truncate">{p.name}</div>
                  <div className="text-[10px] font-mono text-[#E5C9A8]">GH₵{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KrazeLookLab;
