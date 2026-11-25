import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewState } from '../types';
import { Volume2, VolumeX } from 'lucide-react';

interface TourStep {
  view: ViewState;
  title: string;
  description: string;
  selector?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    view: ViewState.LOBBY,
    title: 'Home Showroom',
    description:
      'Explore All-terrain clogs, Studded slides, Classic slides, Double-strap sandals, Designer clogs, and Double-band slippers.',
  },
  {
    view: ViewState.SCROLL_MODE,
    title: 'Quick Pair Browser',
    description:
      'Swipe through footwear drops full-screen. Double-tap to save a pair to your wishlist or add your EU size straight to bag.',
  },
  {
    view: ViewState.FAMOUS,
    title: 'Flash Drops',
    description:
      'Limited markdowns on signature clogs, slides, and weekend slippers before pairs sell out.',
  },
  {
    view: ViewState.BUNDLES,
    title: 'Pairs & Packs',
    description:
      'Grab curated 2-pair and 3-pair packs built for rotation savings and single Nationwide Delivery dispatch.',
  },
  {
    view: ViewState.TRY_ON,
    title: 'Virtual Fitting',
    description: 'Preview footwear styles and colors alongside your look before checking out.',
  },
  {
    view: ViewState.SOCIAL,
    title: 'B.E.C Lookbook',
    description: 'Browse community fits styled with B.E.C Footwear pairs and rate your favourites.',
  },
  {
    view: ViewState.PROFILE,
    title: 'Your Account',
    description: 'Track orders across Ghana, manage your saved EU sizes, and contact 0244122075 or 0260584440.',
  },
];

interface TutorialProps {
  onComplete: () => void;
  onNavigate: (view: ViewState) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string) => {
      if (isMuted) return;
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = (window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || [];
        const preferredVoice =
          voices.find(
            (v) =>
              v &&
              v.name &&
              (v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.name.includes('Female')) &&
              v.lang &&
              v.lang.startsWith('en')
          ) || voices.find((v) => v && v.lang && v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.pitch = 1.05;
        utterance.rate = 0.95;
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis unavailable or blocked:', e);
      }
    },
    [isMuted]
  );

  useEffect(() => {
    if (currentStep === -1) {
      speak(
        'Welcome to B.E.C Footwear. Discover All-terrain clogs, studded slides, classic slides, and double-strap sandals with nationwide delivery across Ghana.'
      );
    } else {
      const step = TOUR_STEPS[currentStep];
      speak(`${step.title}. ${step.description}`);
    }
  }, [currentStep, speak]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (typeof onNavigate === 'function' && TOUR_STEPS[next]?.view) {
        onNavigate(TOUR_STEPS[next].view);
      }
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    localStorage.setItem('cc-seen-tutorial', 'true');
    setIsExiting(true);
    if (typeof onComplete === 'function') {
      setTimeout(onComplete, 500);
    }
  };

  const currentData = currentStep >= 0 ? TOUR_STEPS[currentStep] : null;

  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center p-6 transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-[#1E0F06]/90 backdrop-blur-2xl" onClick={handleClose} />

      {/* Sound Toggle */}
      <button
        onClick={() => {
          const newMuted = !isMuted;
          setIsMuted(newMuted);
          if (newMuted) window.speechSynthesis.cancel();
          else if (currentStep === -1) speak('Voice enabled.');
        }}
        className="fixed top-8 right-8 z-[700] w-12 h-12 bg-[#4A2B18] border border-[#E5C9A8]/30 rounded-full flex items-center justify-center hover:bg-[#5A331C] transition-colors"
        aria-label="Toggle voice guide"
      >
        {isMuted ? (
          <VolumeX size={20} className="text-[#E5C9A8]/50" />
        ) : (
          <Volume2 size={20} className="text-[#E5C9A8]" />
        )}
      </button>

      <div className="relative z-10 w-full max-w-xl animate-in zoom-in-95 duration-500">
        <div className="bg-[#261409] p-10 md:p-14 rounded-[3rem] border border-[#E5C9A8]/30 shadow-2xl relative overflow-hidden">
          {currentStep === -1 ? (
            <div className="space-y-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#4A2B18] border border-[#E5C9A8]/30 p-3 mx-auto flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="B.E.C Footwear" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-serif italic text-[#FAF4EC] tracking-tight">
                  Welcome to <span className="text-[#E5C9A8] not-italic font-sans font-black">B.E.C Footwear</span>
                </h1>
                <p className="text-[#E5C9A8]/80 text-[11px] font-bold uppercase tracking-[0.3em] leading-relaxed max-w-sm mx-auto">
                  Explore our Top Collection of clogs, slides &amp; sandals with Nationwide Delivery.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleNext()}
                  className="w-full py-5 bg-[#FAF4EC] text-[#3B2010] rounded-2xl font-black uppercase tracking-[0.35em] text-[11px] hover:bg-[#E5C9A8] transition-all shadow-xl"
                >
                  Start the Tour
                </button>
                <button
                  onClick={handleClose}
                  className="text-[10px] font-black text-[#E5C9A8]/70 hover:text-white uppercase tracking-[0.3em] transition-colors py-1"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#E5C9A8] animate-pulse" />
                  <span className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-[0.35em]">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </span>
                </div>
                <button onClick={handleClose} className="text-[#E5C9A8]/60 hover:text-white transition-colors">
                  ✕
                </button>
              </header>

              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-serif italic text-[#FAF4EC] tracking-tight">
                  {currentData?.title}
                </h2>
                <div className="text-[#FAF4EC]/85 text-sm font-medium leading-relaxed">
                  {currentData?.description}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5C9A8]/15 flex gap-4">
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-[#FAF4EC] text-[#3B2010] rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#E5C9A8] transition-all shadow-xl"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? 'Start Shopping' : 'Continue'}
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      i === currentStep ? 'w-8 bg-[#E5C9A8]' : 'w-2 bg-[#E5C9A8]/25'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;