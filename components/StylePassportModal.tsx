import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  X, 
  RotateCcw, 
  DollarSign, 
  Shirt, 
  Palette, 
  Layers, 
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { UserPreferences, Category } from '../types';
import { databaseService } from '../services/databaseService';

interface StylePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialPreferences?: UserPreferences | null;
  onPreferencesUpdated: (prefs: UserPreferences) => void;
}

const AESTHETICS = [
  { id: 'All-Terrain Outdoor', label: 'All-Terrain Outdoor', desc: 'Rugged ventilated clogs built for Ghana streets, travel, and daily hustle' },
  { id: 'Minimalist Slides', label: 'Minimalist Slides', desc: 'Clean matte and tonal silhouettes for effortless everyday wear' },
  { id: 'Studded Statement', label: 'Studded Statement', desc: 'Bold textured straps and standout street-luxe hardware' },
  { id: 'Executive & Classic', label: 'Executive & Classic', desc: 'Polished slides, designer clogs, and timeless espresso tones' },
  { id: 'Street & Urban', label: 'Street & Urban', desc: 'Elevated Ghanaian street footwear pairing relaxed fits with statement soles' },
  { id: 'Double-Strap Utility', label: 'Double-Strap Utility', desc: 'Buckle sandals and woven sliders for warm weather comfort' },
  { id: 'Evening & Lounge', label: 'Evening & Lounge', desc: 'Refined designer clogs and double-band slippers for weekend nights' },
  { id: 'Casual Everyday', label: 'Casual Everyday', desc: 'Soft contoured footbeds crafted for all-day errands and lounging' },
];

const COLOR_SWATCHES = [
  { name: 'Espresso Brown', hex: '#4A2B18' },
  { name: 'Warm Sand', hex: '#E5C9A8' },
  { name: 'Saddle Tan', hex: '#8C532B' },
  { name: 'Cocoa Black', hex: '#1E0F06' },
  { name: 'Oat Cream', hex: '#FAF4EC' },
  { name: 'Burberry Check', hex: '#A47E58' },
  { name: 'Khaki Olive', hex: '#6E6648' },
  { name: 'Mocha Suede', hex: '#7A543E' },
  { name: 'Slate Charcoal', hex: '#3A3A3C' },
  { name: 'Burgundy Wine', hex: '#6E1D26' },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'All-terrain clogs', label: 'All-Terrain Clogs' },
  { id: 'Studded slides', label: 'Studded Slides' },
  { id: 'Classic slides', label: 'Classic Slides' },
  { id: 'Double-strap sandals', label: 'Double-Strap Sandals' },
  { id: 'Designer clogs', label: 'Designer Clogs' },
  { id: 'Double-band slippers', label: 'Double-Band Slippers' },
];

const SIZES = ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'];

const FITS = [
  { id: 'Relaxed Wide Fit', label: 'Relaxed Wide Fit', desc: 'Extra toe-box room for natural splay and long walks' },
  { id: 'Regular True-to-Size', label: 'True-to-Size', desc: 'Standard EU 38–45 precision molding' },
  { id: 'Snug Contoured', label: 'Snug Contoured', desc: 'Secure arch wrap for active all-terrain traction' },
  { id: 'Cushioned Platform', label: 'Cushioned Platform', desc: 'Elevated EVA dual-density sole stack' },
];

const BUDGET_TIERS = [
  { id: 'budget', label: 'Everyday Slides', desc: 'Under GH₵ 250' },
  { id: 'mid', label: 'Signature Pairs', desc: 'GH₵ 250 – 450' },
  { id: 'premium', label: 'Designer & Multi-Packs', desc: 'GH₵ 450 – 800' },
  { id: 'luxury', label: 'Collector Bundles', desc: 'GH₵ 800+' },
  { id: 'all', label: 'All Ranges', desc: 'Show full B.E.C Footwear collection' },
];

const OCCASIONS = [
  { id: 'Everyday Errands & Street', label: 'Everyday Errands & Street' },
  { id: 'Campus & Casual Hangouts', label: 'Campus & Casual Hangouts' },
  { id: 'Travel & All-Terrain', label: 'Travel & All-Terrain' },
  { id: 'Weekend Lounge & Events', label: 'Weekend Lounge & Events' },
  { id: 'Beach & Poolside', label: 'Beach & Poolside' },
  { id: 'Gifting & Family Packs', label: 'Gifting & Family Packs' },
];

export const StylePassportModal: React.FC<StylePassportModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialPreferences,
  onPreferencesUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'aesthetics' | 'colors' | 'categories' | 'fit' | 'budget' | 'occasions'>('aesthetics');
  const [aesthetics, setAesthetics] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [preferredCategories, setPreferredCategories] = useState<Category[]>([]);
  const [clothingSizes, setClothingSizes] = useState<string[]>([]);
  const [fitPreference, setFitPreference] = useState<string>('Regular True-to-Size');
  const [budgetTier, setBudgetTier] = useState<string>('all');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [styleSummary, setStyleSummary] = useState<string>('');
  const [personalizationEnabled, setPersonalizationEnabled] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGeneratingSignature, setIsGeneratingSignature] = useState<boolean>(false);
  const [confirmingReset, setConfirmingReset] = useState<boolean>(false);

  useEffect(() => {
    setConfirmingReset(false);
    if (initialPreferences) {
      setAesthetics(initialPreferences.aesthetics || (initialPreferences.styleArchetype ? initialPreferences.styleArchetype.split(',').filter(Boolean) : []));
      setFavoriteColors(initialPreferences.favoriteColors || initialPreferences.colorPreferences || []);
      setPreferredCategories(initialPreferences.preferredCategories || []);
      setClothingSizes(initialPreferences.clothingSizes || []);
      setFitPreference(initialPreferences.fitPreference || 'Regular True-to-Size');
      setBudgetTier(initialPreferences.budgetTier || 'all');
      setOccasions(initialPreferences.occasions || []);
      setStyleSummary(initialPreferences.styleSummary || '');
      setPersonalizationEnabled(initialPreferences.personalizationEnabled !== false);
    } else {
      const load = async () => {
        try {
          const prefs = await databaseService.getUserPreferences(userId);
          if (prefs) {
            setAesthetics(prefs.aesthetics || (prefs.styleArchetype ? prefs.styleArchetype.split(',').filter(Boolean) : []));
            setFavoriteColors(prefs.favoriteColors || prefs.colorPreferences || []);
            setPreferredCategories(prefs.preferredCategories || []);
            setClothingSizes(prefs.clothingSizes || []);
            setFitPreference(prefs.fitPreference || 'Regular True-to-Size');
            setBudgetTier(prefs.budgetTier || 'all');
            setOccasions(prefs.occasions || []);
            setStyleSummary(prefs.styleSummary || '');
            setPersonalizationEnabled(prefs.personalizationEnabled !== false);
          }
        } catch (e) {
          console.warn('Could not load preferences:', e);
        }
      };
      if (isOpen) load();
    }
  }, [isOpen, initialPreferences, userId]);

  if (!isOpen) return null;

  const toggleArrayItem = <T,>(arr: T[], item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleGenerateSignature = async () => {
    setIsGeneratingSignature(true);
    try {
      const res = await databaseService.generateStyleSummary({
        aesthetics,
        favoriteColors,
        fitPreference,
        occasions,
        budgetTier: budgetTier as any
      });
      if (res && res.summary) {
        setStyleSummary(res.summary);
        toast.success('B.E.C Style Signature generated!');
      }
    } catch {
      toast.error('Could not generate signature right now');
    } finally {
      setIsGeneratingSignature(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: UserPreferences = {
        userId,
        aesthetics,
        styleArchetype: aesthetics.join(','),
        colorPreferences: favoriteColors,
        favoriteColors,
        preferredCategories,
        preferredGenders: initialPreferences?.preferredGenders || [],
        clothingSizes,
        fitPreference,
        budgetTier: budgetTier as any,
        occasions,
        styleSummary: styleSummary || (aesthetics.length ? `Curated ${aesthetics.slice(0, 2).join(' & ')} footwear profile with ${fitPreference.toLowerCase()} cushioning.` : ''),
        personalizationEnabled,
        styleProtocolCompleted: true,
        lastUpdated: new Date().toISOString()
      };

      await databaseService.saveUserPreferences(userId, updated);
      onPreferencesUpdated(updated);
      toast.success('B.E.C Style Passport updated!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save passport');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    setIsSaving(true);
    try {
      await databaseService.resetUserPreferences(userId);
      setAesthetics([]);
      setFavoriteColors([]);
      setPreferredCategories([]);
      setClothingSizes([]);
      setFitPreference('Regular True-to-Size');
      setBudgetTier('all');
      setOccasions([]);
      setStyleSummary('');
      const cleanPrefs: UserPreferences = {
        userId,
        aesthetics: [],
        styleArchetype: '',
        colorPreferences: [],
        favoriteColors: [],
        preferredCategories: [],
        preferredGenders: initialPreferences?.preferredGenders || [],
        clothingSizes: [],
        fitPreference: 'Regular True-to-Size',
        budgetTier: 'all',
        occasions: [],
        styleSummary: '',
        personalizationEnabled: true,
        dislikedProductIds: [],
        styleProtocolCompleted: false
      };
      onPreferencesUpdated(cleanPrefs);
      toast.success('B.E.C Style Passport reset to defaults');
      onClose();
    } catch {
      toast.error('Failed to reset preferences');
    } finally {
      setIsSaving(false);
      setConfirmingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl bg-[#261409] border border-[#8C532B]/40 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden text-[#FAF4EC]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5C9A8]/15 flex items-center justify-between bg-gradient-to-r from-[#4A2B18]/60 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A2B18] to-[#8C532B] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-[#E5C9A8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-[#FAF4EC]">B.E.C Style Passport</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#8C532B]/30 text-[#E5C9A8] border border-[#E5C9A8]/30">
                  Personalized
                </span>
              </div>
              <p className="text-xs text-[#E5C9A8]/70">Tailor your B.E.C Footwear recommendations & EU fit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#3B2010] hover:bg-[#4A2B18] flex items-center justify-center text-[#E5C9A8] hover:text-white transition-colors"
            aria-label="Close Style Passport"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Signature preview banner */}
        <div className="px-5 py-3 bg-[#3B2010]/40 border-b border-[#E5C9A8]/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E5C9A8]">Personal Footwear Signature</span>
              {isGeneratingSignature && (
                <span className="text-[10px] text-[#E5C9A8] animate-pulse">Crafting profile...</span>
              )}
            </div>
            <button
              onClick={handleGenerateSignature}
              disabled={isGeneratingSignature || aesthetics.length === 0}
              className="text-xs text-[#E5C9A8] hover:text-white font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C9A8]" />
              <span>{styleSummary ? 'Refresh Signature' : 'Generate Summary'}</span>
            </button>
          </div>
          <p className="text-xs italic text-[#FAF4EC]/90 leading-relaxed bg-[#1E0F06]/60 p-2.5 rounded-xl border border-[#E5C9A8]/10">
            {styleSummary || (aesthetics.length > 0 
              ? `Personalized around ${aesthetics.slice(0, 3).join(', ')} with ${fitPreference.toLowerCase()} feel.`
              : 'Select your preferred silhouettes and colors below to generate your personal B.E.C Footwear signature.')}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar px-4 py-2 border-b border-[#E5C9A8]/10 gap-2 bg-[#1E0F06]">
          {[
            { id: 'aesthetics', label: 'Aesthetics', icon: Sparkles, count: aesthetics.length },
            { id: 'colors', label: 'Colours', icon: Palette, count: favoriteColors.length },
            { id: 'categories', label: 'Collections', icon: Layers, count: preferredCategories.length },
            { id: 'fit', label: 'EU Sizes & Fit', icon: Shirt, count: (clothingSizes.length ? 1 : 0) + (fitPreference ? 1 : 0) },
            { id: 'budget', label: 'Budget', icon: DollarSign, count: budgetTier !== 'all' ? 1 : 0 },
            { id: 'occasions', label: 'Occasions', icon: Calendar, count: occasions.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-md border border-[#E5C9A8]/30'
                    : 'bg-[#3B2010]/60 text-[#E5C9A8]/80 hover:bg-[#3B2010]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#E5C9A8] text-[#261409]' : 'bg-[#8C532B]/40 text-[#E5C9A8]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[320px]">
          {/* TAB: AESTHETICS */}
          {activeTab === 'aesthetics' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#E5C9A8]/70 font-semibold">Select your footwear style</span>
                <span className="text-xs text-[#E5C9A8] font-medium">{aesthetics.length} selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AESTHETICS.map(item => {
                  const isSelected = aesthetics.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleArrayItem(aesthetics, item.id, setAesthetics)}
                      className={`min-h-[56px] text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-[#E5C9A8] bg-[#4A2B18] text-[#FAF4EC] shadow-sm'
                          : 'border-[#E5C9A8]/10 bg-[#3B2010]/40 text-[#FAF4EC]/80 hover:bg-[#3B2010]'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{item.label}</div>
                        <p className="text-[11px] text-[#E5C9A8]/70 mt-0.5 line-clamp-2">{item.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                        isSelected ? 'bg-[#E5C9A8] border-[#E5C9A8] text-[#261409]' : 'border-[#8C532B]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: COLOURS */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#E5C9A8]/70 font-semibold">Select your go-to tones</span>
                <span className="text-xs text-[#E5C9A8] font-medium">{favoriteColors.length} selected</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COLOR_SWATCHES.map(color => {
                  const isSelected = favoriteColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => toggleArrayItem(favoriteColors, color.name, setFavoriteColors)}
                      className={`min-h-[50px] p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                        isSelected 
                          ? 'border-[#E5C9A8] bg-[#4A2B18] ring-1 ring-[#E5C9A8]' 
                          : 'border-[#E5C9A8]/10 bg-[#3B2010]/40 hover:bg-[#3B2010]'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-full shadow-inner border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1 text-left">
                        <span className="text-xs font-semibold block text-[#FAF4EC]">{color.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#E5C9A8] stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#E5C9A8]/70 font-semibold">Our Top Collections</span>
                <span className="text-xs text-[#E5C9A8] font-medium">{preferredCategories.length} selected</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map(cat => {
                  const isSelected = preferredCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleArrayItem(preferredCategories, cat.id, setPreferredCategories)}
                      className={`min-h-[54px] p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-[#E5C9A8] bg-[#4A2B18] text-[#FAF4EC]'
                          : 'border-[#E5C9A8]/10 bg-[#3B2010]/40 text-[#FAF4EC]/80 hover:bg-[#3B2010]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: FIT & SIZES */}
          {activeTab === 'fit' && (
            <div className="space-y-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#E5C9A8]/70 font-semibold block mb-2">Footwear Sizes (EU 38–45)</span>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(sz => {
                    const isSelected = clothingSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleArrayItem(clothingSizes, sz, setClothingSizes)}
                        className={`min-w-[60px] min-h-[48px] px-3 rounded-2xl border font-bold text-xs flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#E5C9A8] border-[#E5C9A8] text-[#261409] shadow-md'
                            : 'bg-[#3B2010]/50 border-[#E5C9A8]/15 text-[#FAF4EC] hover:bg-[#4A2B18]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-[#E5C9A8]/70 font-semibold block mb-2">Preferred Cushion & Fit</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FITS.map(f => {
                    const isSelected = fitPreference === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFitPreference(f.id)}
                        className={`min-h-[50px] text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#E5C9A8] bg-[#4A2B18] text-[#FAF4EC]'
                            : 'border-[#E5C9A8]/10 bg-[#3B2010]/40 text-[#FAF4EC]/80 hover:bg-[#3B2010]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{f.label}</div>
                          <div className="text-[10px] text-[#E5C9A8]/70">{f.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#E5C9A8] bg-[#E5C9A8]' : 'border-[#8C532B]'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#261409]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BUDGET */}
          {activeTab === 'budget' && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#E5C9A8]/70 font-semibold block">Typical Footwear Budget (GH₵)</span>
              <div className="space-y-2">
                {BUDGET_TIERS.map(b => {
                  const isSelected = budgetTier === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBudgetTier(b.id)}
                      className={`w-full min-h-[50px] text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#E5C9A8] bg-[#4A2B18] text-[#FAF4EC]'
                          : 'border-[#E5C9A8]/10 bg-[#3B2010]/40 text-[#FAF4EC]/80 hover:bg-[#3B2010]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#E5C9A8]">{b.label}</div>
                        <div className="text-xs text-[#FAF4EC]/80 mt-0.5">{b.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#E5C9A8] bg-[#E5C9A8]' : 'border-[#8C532B]'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#261409]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: OCCASIONS */}
          {activeTab === 'occasions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#E5C9A8]/70 font-semibold">Where do you wear B.E.C Footwear?</span>
                <span className="text-xs text-[#E5C9A8] font-medium">{occasions.length} selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OCCASIONS.map(occ => {
                  const isSelected = occasions.includes(occ.id);
                  return (
                    <button
                      key={occ.id}
                      onClick={() => toggleArrayItem(occasions, occ.id, setOccasions)}
                      className={`min-h-[50px] text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#E5C9A8] bg-[#4A2B18] text-[#FAF4EC]'
                          : 'border-[#E5C9A8]/10 bg-[#3B2010]/40 text-[#FAF4EC]/80 hover:bg-[#3B2010]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{occ.label}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-[#E5C9A8] border-[#E5C9A8] text-[#261409]' : 'border-[#8C532B]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-[#E5C9A8]/15 bg-[#1E0F06] space-y-3">
          <div className="flex items-center justify-between text-xs px-1 text-[#E5C9A8]/70">
            <button
              onClick={() => setPersonalizationEnabled(!personalizationEnabled)}
              className="flex items-center gap-2 hover:text-white transition-colors min-h-[44px]"
            >
              {personalizationEnabled ? (
                <>
                  <Eye className="w-4 h-4 text-[#E5C9A8]" />
                  <span>Personalized Discovery: <strong className="text-[#E5C9A8]">Active</strong></span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-[#8C532B]" />
                  <span>Personalization: <strong className="text-[#8C532B]">Paused</strong></span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 transition-colors min-h-[44px] ${confirmingReset ? 'text-red-400 font-bold' : 'text-[#E5C9A8]/60 hover:text-red-400'}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmingReset ? 'Confirm Reset' : 'Reset'}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="min-h-[48px] px-4 rounded-2xl bg-[#3B2010] hover:bg-[#4A2B18] text-[#E5C9A8] text-xs font-semibold transition-colors"
            >
              Skip for now
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 min-h-[48px] rounded-2xl bg-[#E5C9A8] hover:bg-[#FAF4EC] text-[#261409] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#261409] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#4A2B18]" />
                  <span>Save Style Passport</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
