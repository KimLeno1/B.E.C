import React from 'react';
import { X, Shield, Truck, RefreshCcw } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'TERMS' | 'REFUND';
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1E0F06]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-[#FAF4EC] border border-[#EAD8C0] rounded-[2rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 text-[#3B2010]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8C532B] hover:text-[#3B2010] transition-colors"
          aria-label="Close policy dialog"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#4A2B18] flex items-center justify-center text-[#E5C9A8]">
            {type === 'TERMS' ? <Shield size={24} /> : <RefreshCcw size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-[#3B2010] leading-none">
              {type === 'TERMS' ? 'Terms & Conditions' : 'Refund & Delivery Policy'}
            </h2>
            <p className="text-[10px] font-black text-[#8C532B] uppercase tracking-widest mt-1.5">
              B.E.C Footwear • Nationwide Delivery Ghana
            </p>
          </div>
        </div>

        <div className="space-y-6 text-[#5A331C] text-xs leading-relaxed h-[400px] overflow-y-auto pr-2 scrollbar-hide">
          {type === 'TERMS' ? (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-[#3B2010] font-black uppercase text-xs tracking-widest">
                  1. ACCEPTANCE OF TERMS
                </h3>
                <p>
                  By browsing or placing an order with B.E.C Footwear, you agree to these Terms and Conditions for
                  purchases and nationwide delivery across Ghana.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="text-[#3B2010] font-black uppercase text-xs tracking-widest">
                  2. ACCOUNT &amp; ORDER ACCURACY
                </h3>
                <p>
                  Please verify your EU size (38–45), contact phone number, and delivery landmark when placing an
                  order so our dispatch riders can reach you smoothly.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="text-[#3B2010] font-black uppercase text-xs tracking-widest">
                  3. BRAND &amp; PRODUCT IMAGERY
                </h3>
                <p>
                  All catalog photos, collection descriptions, and B.E.C Footwear branding remain the property of
                  B.E.C Footwear.
                </p>
              </section>
              <section className="space-y-2">
                <h3 className="text-[#3B2010] font-black uppercase text-xs tracking-widest">
                  4. TRANSACTION SECURITY
                </h3>
                <p>
                  Card and Mobile Money payments are processed securely via encrypted gateways, or directly
                  confirmed with our sales desk on 0244122075 and 0260584440.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[#8C532B]">
                  <RefreshCcw size={14} />
                  <h3 className="text-[#3B2010] font-black uppercase text-xs tracking-widest">
                    Size Exchange &amp; Return Policy
                  </h3>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[#3B2010] text-[10px] font-bold uppercase">Return &amp; Exchange Window</h4>
                  <p>
                    • <strong>5-Day Exchange Window:</strong> Contact us within 5 days of delivery on 0244122075 or
                    0260584440 if you need a size swap or return.
                  </p>

                  <h4 className="text-[#3B2010] text-[10px] font-bold uppercase mt-4">Conditions for Return</h4>
                  <p>• Footwear must have clean, unworn soles with zero outdoor scuffing.</p>
                  <p>• Original box, dust bag, straps, and packaging must remain intact.</p>

                  <h4 className="text-[#3B2010] text-[10px] font-bold uppercase mt-4">Non-Returnable Items</h4>
                  <p>• Footwear showing signs of outdoor wear, creases, or damaged soles.</p>
                  <p>• Custom requested pairs or clearance final-sale pairs unless defective on arrival.</p>

                  <h4 className="text-[#3B2010] text-[10px] font-bold uppercase mt-4">Refund &amp; Swap Process</h4>
                  <p>• Once inspected at our Ghana hub, size swaps dispatch within 24–48 hours.</p>
                  <p>• Approved refunds return to your Mobile Money or Paystack card within 3–5 business days.</p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[#4A2B18]">
                  <Truck size={14} />
                  <h3 className="text-[#3B2010] font-black uppercase text-xs tracking-widest">
                    Nationwide Delivery Policy
                  </h3>
                </div>
                <div className="space-y-3">
                  <p>• <strong>Accra &amp; Kumasi:</strong> Same-day or next-day courier delivery.</p>
                  <p>• <strong>Other Regions (Nationwide):</strong> 1–3 business days via reliable regional transit.</p>
                  <p>• <strong>Support Desk:</strong> Track or update drop-off details on 0244122075 / 0260584440.</p>
                </div>
              </section>

              <div className="p-4 bg-[#F5EAD8] border border-[#EAD8C0] rounded-2xl">
                <p className="text-[10px] font-bold text-[#5A331C]">B.E.C Footwear Operational Policy</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-4 bg-[#4A2B18] text-[#FAF4EC] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-[#3B2010] transition-all shadow-md"
        >
          Acknowledge Policy
        </button>
      </div>
    </div>
  );
};

export default PolicyModal;
