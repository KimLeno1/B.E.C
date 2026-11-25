import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  X,
  Zap,
  Bell,
  ShieldCheck,
  Share2,
  PlusSquare,
  Smartphone,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { toast } from 'sonner';

interface PWAPromptModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const PWAPromptModal: React.FC<PWAPromptModalProps> = ({ forceOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isOpen: hookIsOpen, install, dismiss } = usePWAInstall();

  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const isOpen = forceOpen !== undefined ? forceOpen : hookIsOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dismiss();
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const outcome = await install();
      if (outcome === 'accepted') {
        setJustInstalled(true);
        toast.success('B.E.C Footwear app installed successfully!');
        setTimeout(() => {
          handleClose();
        }, 1800);
      } else if (outcome === 'manual') {
        if (isIOS) {
          toast.info('Follow the instructions below to add B.E.C Footwear to your Home Screen.');
        } else {
          toast.info("Tap the browser menu (⋮) and select 'Install app' or 'Add to Home Screen'.");
        }
      }
    } catch (err) {
      console.error('Install error:', err);
      toast.error('Could not trigger automatic install. Please use browser menu.');
    } finally {
      setInstalling(false);
    }
  };

  if (isInstalled && !forceOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-[#1E0F06]/65 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={handleClose} aria-label="Close download prompt" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#FAF4EC] border border-[#EAD8C0] rounded-[2.5rem] shadow-2xl overflow-hidden p-6 sm:p-8 z-10 text-[#3B2010]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-prompt-title"
          >
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5EAD8] hover:bg-[#EAD8C0] text-[#4A2B18] flex items-center justify-center transition-colors active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-2xl bg-[#4A2B18] p-2.5 flex items-center justify-center shadow-lg border border-[#3B2010] shrink-0">
                <img
                  src="/logo.svg"
                  alt="B.E.C Footwear App Icon"
                  className="w-full h-full object-contain rounded-xl"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#8C532B] rounded-full border-2 border-[#FAF4EC] flex items-center justify-center text-white">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>

              <div className="space-y-1 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5EAD8] border border-[#EAD8C0] text-[#4A2B18] text-[9px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-[#8C532B]" />
                  <span>Official Store App</span>
                </div>
                <h2 id="pwa-prompt-title" className="text-xl font-serif italic font-bold text-[#3B2010] tracking-tight">
                  Install B.E.C Footwear
                </h2>
                <p className="text-xs text-[#5A331C] font-medium">
                  Browse clogs, slides &amp; sandals anytime with instant restock alerts.
                </p>
              </div>
            </div>

            {justInstalled ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-inner">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#3B2010]">App Installed!</h3>
                <p className="text-xs text-[#5A331C] max-w-xs mx-auto">
                  B.E.C Footwear is now on your home screen for one-tap shopping.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 bg-white rounded-2xl p-4 border border-[#EAD8C0]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3B2010]">Lightning-Fast Catalog</p>
                      <p className="text-[11px] text-[#5A331C]">Instant footwear browsing &amp; EU size selection.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#F5EAD8] text-[#8C532B] flex items-center justify-center shrink-0">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3B2010]">Size &amp; Drop Alerts</p>
                      <p className="text-[11px] text-[#5A331C]">First notice when new clogs and slides restock.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#F5EAD8] text-[#4A2B18] flex items-center justify-center shrink-0">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3B2010]">1-Tap Home Screen Access</p>
                      <p className="text-[11px] text-[#5A331C]">Lightweight web app with zero store downloads.</p>
                    </div>
                  </div>
                </div>

                {isIOS && !isInstallable ? (
                  <div className="space-y-3 mb-6 p-4 rounded-2xl bg-[#F5EAD8] border border-[#EAD8C0]">
                    <p className="text-xs font-bold text-[#4A2B18] uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" />
                      How to install on iPhone &amp; iPad:
                    </p>
                    <ol className="text-xs text-[#3B2010] space-y-2 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-[#8C532B]">1.</span>
                        <span>
                          Tap the <strong className="text-[#3B2010]">Share</strong> button{' '}
                          <Share2 className="w-3.5 h-3.5 inline text-[#4A2B18] mx-1 align-text-bottom" /> in Safari's
                          bottom toolbar.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-[#8C532B]">2.</span>
                        <span>
                          Scroll down and tap <strong className="text-[#3B2010]">"Add to Home Screen"</strong>{' '}
                          <PlusSquare className="w-3.5 h-3.5 inline text-[#3B2010] mx-1 align-text-bottom" />.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-[#8C532B]">3.</span>
                        <span>
                          Tap <strong className="text-[#3B2010]">"Add"</strong> in the top right corner.
                        </span>
                      </li>
                    </ol>
                  </div>
                ) : null}

                <div className="space-y-2.5">
                  {isInstallable ? (
                    <button
                      onClick={handleInstall}
                      disabled={installing}
                      className="w-full py-4 px-6 rounded-2xl bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{installing ? 'Installing...' : 'Install B.E.C Footwear'}</span>
                    </button>
                  ) : isIOS ? (
                    <button
                      onClick={handleClose}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>Got It, I'll Add It</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleInstall}
                      className="w-full py-4 px-6 rounded-2xl bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download App</span>
                    </button>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 text-center text-xs font-semibold text-[#8C532B] hover:text-[#3B2010] transition-colors"
                  >
                    Continue in browser
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EAD8C0] flex items-center justify-between text-[10px] text-[#8C532B]">
                  <span>Size: &lt; 3 MB · No App Store required</span>
                  <span className="font-semibold text-[#4A2B18]">Nationwide Delivery</span>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PWAPromptModal;
