import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface VaultEntranceProps {
  onComplete?: () => void;
}

const ENTRANCE_SHOWCASE = [
  {
    src: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
    label: 'All-Terrain Clogs',
  },
  {
    src: '/uploads/bec/bec_studded_slides_1795581066443.jpg',
    label: 'Studded Slides',
  },
  {
    src: '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg',
    label: 'Double-Strap Sandals',
  },
];

const VaultEntrance: React.FC<VaultEntranceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'presenting' | 'opening' | 'done'>('presenting');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const completedRef = useRef(false);

  const finishEntrance = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('done');
    onComplete?.();
  }, [onComplete]);

  const triggerOpen = useCallback(() => {
    setPhase((prev) => (prev === 'presenting' ? 'opening' : prev));
  }, []);

  useEffect(() => {
    const mediaQuery =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const reduced = Boolean(mediaQuery?.matches);
    setPrefersReducedMotion(reduced);

    const openDelay = reduced ? 450 : 1550;
    const exitDuration = reduced ? 320 : 720;

    const openTimer = window.setTimeout(() => {
      triggerOpen();
    }, openDelay);

    const doneTimer = window.setTimeout(() => {
      finishEntrance();
    }, openDelay + exitDuration);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
    };
  }, [triggerOpen, finishEntrance]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const quickDone = window.setTimeout(() => {
      finishEntrance();
    }, prefersReducedMotion ? 280 : 680);
    return () => window.clearTimeout(quickDone);
  }, [phase, prefersReducedMotion, finishEntrance]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        triggerOpen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerOpen]);

  if (phase === 'done') return null;

  const isOpening = phase === 'opening';
  const curtainTransition = prefersReducedMotion
    ? { duration: 0.25, ease: 'easeOut' as const }
    : { duration: 0.68, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div
      role="dialog"
      aria-label="Welcome to B.E.C Footwear"
      onClick={triggerOpen}
      className="fixed inset-0 z-[9999] overflow-hidden cursor-pointer select-none"
    >
      {/* Left Architectural Curtain */}
      <motion.div
        aria-hidden="true"
        initial={{ x: '0%' }}
        animate={{ x: isOpening ? '-100%' : '0%' }}
        transition={curtainTransition}
        className="absolute inset-y-0 left-0 w-1/2 bg-[#261409] border-r border-[#8C532B]/35 will-change-transform"
      >
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 85% 45%, rgba(140, 83, 43, 0.28) 0%, rgba(38, 20, 9, 0) 68%)',
          }}
        />
      </motion.div>

      {/* Right Architectural Curtain */}
      <motion.div
        aria-hidden="true"
        initial={{ x: '0%' }}
        animate={{ x: isOpening ? '100%' : '0%' }}
        transition={curtainTransition}
        className="absolute inset-y-0 right-0 w-1/2 bg-[#261409] border-l border-[#8C532B]/35 will-change-transform"
      >
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 15% 45%, rgba(140, 83, 43, 0.28) 0%, rgba(38, 20, 9, 0) 68%)',
          }}
        />
      </motion.div>

      {/* Center Editorial Vestibule Content */}
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
        animate={{
          opacity: isOpening ? 0 : 1,
          y: isOpening && !prefersReducedMotion ? -8 : 0,
        }}
        transition={{
          duration: isOpening ? 0.32 : 0.48,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 h-full w-full flex flex-col items-center justify-between px-6 py-8 sm:py-12 max-w-4xl mx-auto text-[#FAF4EC]"
      >
        {/* Top Quiet Metadata Line (No Pills / No Telemetry) */}
        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.28em] text-[#E5C9A8]/85">
          <span>Ghana</span>
          <span aria-hidden="true" className="text-[#8C532B]">/</span>
          <span>Nationwide Delivery</span>
          <span aria-hidden="true" className="text-[#8C532B]">/</span>
          <span>EU 38–45</span>
        </div>

        {/* Brand Lockup + Footwear Preview Trio */}
        <div className="w-full flex flex-col items-center text-center space-y-6 sm:space-y-8 my-auto py-4">
          <div className="space-y-2">
            <h1 className="font-serif italic font-black tracking-tight leading-[0.86] text-6xl sm:text-7xl md:text-8xl text-[#FAF4EC]">
              B.E.C
            </h1>
            <p className="font-sans italic font-extrabold tracking-tight text-2xl sm:text-3xl md:text-4xl text-[#E5C9A8]">
              Footwear
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#E5C9A8]/70 to-transparent mx-auto pt-1" />
            <p className="text-xs sm:text-sm text-[#E5C9A8]/85 font-medium tracking-wide pt-1">
              Clogs, Studded Slides, Classic Slides &amp; Double-Strap Sandals
            </p>
          </div>

          {/* Framed Trio Preview Using Local Collection Photography */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-xl">
            {ENTRANCE_SHOWCASE.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.5,
                  delay: prefersReducedMotion ? 0 : 0.12 + idx * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="bg-[#FAF4EC] rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-xl border border-[#E5C9A8]/40"
              >
                <div className="relative aspect-[4/3] w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#F5EAD8]">
                  <img
                    src={item.src}
                    alt={item.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <p className="mt-1.5 mb-0.5 text-[10px] sm:text-[11px] font-bold text-[#4A2B18] truncate px-1">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Direct Storefront Entry CTA */}
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerOpen();
            }}
            className="min-h-[44px] px-7 py-3 rounded-xl bg-[#FAF4EC] hover:bg-white text-[#261409] text-xs font-extrabold uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-xl transition-colors cursor-pointer"
          >
            <span>Enter Storefront</span>
            <ArrowRight className="w-4 h-4 text-[#4A2B18]" />
          </button>
          <span className="text-[11px] text-[#E5C9A8]/70 font-medium tracking-wide">
            0244122075 · 0260584440
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default VaultEntrance;
