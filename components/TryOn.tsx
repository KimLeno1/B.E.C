import React, { useRef, useEffect, useState } from 'react';
import { RankBenefits, UserStats, Product } from '../types';
import { Camera, Upload, Image as ImageIcon, RefreshCw, Star, ShoppingBag, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TryOnModal from './TryOnModal';

interface TryOnProps {
  rank: RankBenefits;
  stats: UserStats;
  onUsed: () => void;
  wishlistProducts: Product[];
  haulProducts: Product[];
}

const MODEL_PRESETS = [
  { id: 'p1', name: 'Modern Minimalist', url: '/hero/hero_model_freedom_1788236993279.jpg' },
  { id: 'p2', name: 'Contemporary Editorial', url: '/hero/hero_model_identity_1788237069856.jpg' },
  { id: 'p3', name: 'Avant-Garde Silhouette', url: '/hero/hero_model_gallery_1788237022752.jpg' },
  { id: 'p4', name: 'High-Fashion Tailored', url: '/hero/hero_model_harder_1788237010924.jpg' },
];

const TryOn: React.FC<TryOnProps> = ({ rank, stats, onUsed, wishlistProducts, haulProducts }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string>(MODEL_PRESETS[0].url);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'WISHLIST' | 'HAUL'>('WISHLIST');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (useCamera) {
      navigator.mediaDevices?.getUserMedia?.({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCamera(true);
          }
        })
        .catch(() => {
          setHasCamera(false);
          setUseCamera(false);
        });
    } else {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setHasCamera(false);
    }
  }, [useCamera]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setUseCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = () => {
    if (!selectedProduct) return;
    setIsModalOpen(true);
  };

  const activePersonImage = uploadedImage || (useCamera && hasCamera ? null : selectedPresetUrl);

  if (stats.aiTryOnsUsedToday >= rank.aiTryOnLimit) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-12 text-center space-y-8 animate-in fade-in">
        <div className="text-8xl grayscale opacity-20">🚫</div>
        <div className="space-y-4">
           <h2 className="text-4xl font-serif italic text-zinc-950 uppercase tracking-tighter">Daily Limit Reached</h2>
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] max-w-sm mx-auto">
             Your account tier ({rank.tier}) allows {rank.aiTryOnLimit} virtual try-ons per day. Access resets tomorrow.
           </p>
        </div>
      </div>
    );
  }

  const currentProducts = activeTab === 'WISHLIST' ? wishlistProducts : haulProducts;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 sm:space-y-12 animate-in fade-in duration-500 pb-40">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-[#F5EAD8] px-4 py-2 rounded-full border border-[#EAD8C0] mb-2">
          <div className="w-2 h-2 rounded-full bg-[#4A2B18] animate-pulse"></div>
          <span className="text-[10px] font-black text-[#4A2B18] uppercase tracking-[0.4em]">B.E.C Footwear Studio</span>
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif italic text-[#261409] tracking-tighter leading-none">
          Virtual <span className="text-[#4A2B18] not-italic font-sans font-black">TRY-ON</span>
        </h1>
        <p className="text-[#5A331C] text-[10px] font-black uppercase tracking-[0.3em] mt-4">
          {rank.tier} Tier • Attempts used today: {stats.aiTryOnsUsedToday}/{rank.aiTryOnLimit}
        </p>
      </header>

      {/* MODEL PRESETS BAR */}
      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#5A331C] shrink-0">Model Silhouette:</span>
        {MODEL_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => {
              setUploadedImage(null);
              setUseCamera(false);
              setSelectedPresetUrl(preset.url);
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              !uploadedImage && !useCamera && selectedPresetUrl === preset.url
                ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-md'
                : 'bg-[#F5EAD8] hover:bg-[#EAD8C0] text-[#3B2010]'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Visual Terminal */}
        <div className="space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-[3rem] overflow-hidden bg-[#261409] border border-[#EAD8C0] shadow-2xl group">
            <AnimatePresence mode="wait">
              {useCamera && hasCamera ? (
                <motion.video
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <motion.img
                  key="preview-img"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={activePersonImage || MODEL_PRESETS[0].url}
                  className="w-full h-full object-cover"
                  alt="Fitting preview subject"
                />
              )}
            </AnimatePresence>

            {/* Product Overlay Simulation */}
            {selectedProduct && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.7, scale: 1 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center p-20"
              >
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="max-w-full max-h-full object-contain mix-blend-screen grayscale brightness-150"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
            
            {/* UI Overlays */}
            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between border-[16px] border-transparent">
              <div className="flex justify-between">
                <div className="w-10 h-10 border-t-2 border-l-2 border-[#E5C9A8]/70"></div>
                <div className="w-10 h-10 border-t-2 border-r-2 border-[#E5C9A8]/70"></div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-[#FAF4EC]/95 px-5 py-2 rounded-full border border-[#EAD8C0] shadow-md">
                   <span className="text-[9px] font-black uppercase text-[#4A2B18] tracking-widest">
                     {selectedProduct ? `FITTING: ${selectedProduct.name}` : 'Select a footwear pair from your wishlist/bag'}
                   </span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E5C9A8]/60 to-transparent animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-10 h-10 border-b-2 border-l-2 border-[#E5C9A8]/70"></div>
                <div className="w-10 h-10 border-b-2 border-r-2 border-[#E5C9A8]/70"></div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-3 pointer-events-auto">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3.5 bg-[#FAF4EC] text-[#261409] border border-[#EAD8C0] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#F5EAD8] transition-all shadow-md cursor-pointer text-[10px] font-black uppercase tracking-wider"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
              
              <button 
                onClick={() => {
                  setUploadedImage(null);
                  setUseCamera(!useCamera);
                }}
                className={`px-4 py-3.5 rounded-2xl border flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-[10px] font-black uppercase tracking-wider ${
                  useCamera ? 'bg-[#4A2B18] text-[#FAF4EC] border-[#4A2B18]' : 'bg-[#FAF4EC] text-[#261409] border-[#EAD8C0]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{useCamera ? 'Stop Cam' : 'Webcam'}</span>
              </button>

              {(uploadedImage || useCamera) && (
                <button 
                  onClick={() => {
                    setUploadedImage(null);
                    setUseCamera(false);
                  }}
                  className="w-12 h-12 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button 
            disabled={!selectedProduct}
            onClick={handleTryOn}
            className="w-full py-5 bg-[#4A2B18] text-[#FAF4EC] rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-[#3B2010] transition-all shadow-xl disabled:opacity-30 disabled:grayscale cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>Launch AI Virtual Try-On</span>
          </button>
        </div>

        {/* Asset Selection */}
        <div className="space-y-6">
          <div className="flex bg-[#F5EAD8] p-1.5 rounded-2xl border border-[#EAD8C0]">
            <button 
              onClick={() => setActiveTab('WISHLIST')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'WISHLIST' ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-sm' : 'text-[#5A331C] hover:text-[#261409]'}`}
            >
              <Star className="w-3 h-3" />
              Saved Wishlist ({wishlistProducts.length})
            </button>
            <button 
              onClick={() => setActiveTab('HAUL')}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'HAUL' ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-sm' : 'text-[#5A331C] hover:text-[#261409]'}`}
            >
              <ShoppingBag className="w-3 h-3" />
              My Bag ({haulProducts.length})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-2">
            {currentProducts.length === 0 ? (
              <div className="col-span-2 py-20 text-center text-[#5A331C] italic uppercase text-[10px] tracking-widest bg-[#FAF4EC] rounded-3xl border border-dashed border-[#EAD8C0]">
                No items found in your {activeTab.toLowerCase()}. Add pairs to try them on.
              </div>
            ) : (
              currentProducts.map(product => (
                <button 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`relative aspect-[4/5] rounded-3xl overflow-hidden border-2 transition-all group bg-[#FAF4EC] cursor-pointer ${selectedProduct?.id === product.id ? 'border-[#4A2B18] shadow-[0_0_20px_rgba(74,43,24,0.25)]' : 'border-[#EAD8C0] hover:border-[#8C532B]'}`}
                >
                  <img 
                    src={product.image} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${selectedProduct?.id === product.id ? 'scale-110' : 'group-hover:scale-105'}`} 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#261409]/85 via-transparent to-transparent opacity-70"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <p className="text-[9px] font-black text-[#FAF4EC] uppercase truncate">{product.name}</p>
                    <p className="text-[8px] font-mono text-[#E5C9A8] uppercase mt-1">GH₵{product.price}</p>
                  </div>
                  {selectedProduct?.id === product.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-[#4A2B18] rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-[#FAF4EC]" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <TryOnModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          rank={rank}
          stats={stats}
          onUpdateStats={() => onUsed()}
        />
      )}
    </div>
  );
};

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default TryOn;