import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Product, ViewState } from '../types';
import { X } from 'lucide-react';
import { trackPlausibleEvent } from '../lib/analytics';

interface WhatsAppFloatingButtonProps {
  currentView?: ViewState;
  selectedProduct?: Product | null;
}

const WHATSAPP_PHONE = '233244122075';

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  currentView = ViewState.LOBBY,
  selectedProduct = null,
}) => {
  const isDismissed = typeof window !== 'undefined' && localStorage.getItem('wa-dismissed') === 'true';

  if (isDismissed) {
    return null;
  }

  const getWhatsAppMessage = (): string => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (selectedProduct) {
      return `Hello B.E.C Footwear, I am interested in "${selectedProduct.name}" (${currentUrl}).`;
    }

    if (currentView && currentView !== ViewState.LOBBY) {
      return `Hello B.E.C Footwear, I am browsing your collection (${currentView}) and would like to order.`;
    }

    return 'Hello B.E.C Footwear, I saw your collection and would like to order with nationwide delivery.';
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      localStorage.setItem('wa-dismissed', 'true');
      const btn = document.getElementById('whatsapp-floating-container');
      if (btn) {
        btn.style.display = 'none';
      }
    }
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(getWhatsAppMessage())}`;

  return (
    <div
      id="whatsapp-floating-container"
      className="fixed right-4 sm:right-6 bottom-20 sm:bottom-8 z-[9999] flex flex-col items-end gap-2 pointer-events-auto transition-all duration-300 group/btn"
    >
      <div className="hidden sm:flex items-center gap-2 bg-[#4A2B18] text-[#FAF4EC] px-3.5 py-1.5 rounded-full text-[11px] font-mono font-medium shadow-xl border border-[#EAD8C0]/30 opacity-0 translate-y-2 scale-95 group-hover/btn:opacity-100 group-hover/btn:translate-y-0 group-hover/btn:scale-100 pointer-events-none transition-all duration-300">
        <span>Order B.E.C Footwear: 0244122075</span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close WhatsApp chat button"
          title="Dismiss"
          className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 z-30 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4A2B18] hover:bg-red-600 text-[#FAF4EC] border border-white/25 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 focus:outline-none"
        >
          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        <a
          href={whatsappHref}
          onClick={() =>
            trackPlausibleEvent('whatsapp_click', {
              location: currentView || 'lobby',
              product_id: selectedProduct?.id,
              product_name: selectedProduct?.name,
            })
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with B.E.C Footwear on WhatsApp 0244122075"
          tabIndex={0}
          className="relative flex items-center justify-center w-[58px] h-[58px] rounded-full bg-[#25D366] text-white shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_30px_rgba(37,211,102,0.6)] hover:bg-[#20ba5a] active:scale-95 transition-all duration-300 select-none"
        >
          <div className="relative z-10 w-8 h-8 flex items-center justify-center transform group-hover/btn:scale-110 transition-transform duration-300">
            <WhatsAppIcon size={30} title="Chat with B.E.C Footwear on WhatsApp" />
          </div>
        </a>
      </div>
    </div>
  );
};

export default WhatsAppFloatingButton;
