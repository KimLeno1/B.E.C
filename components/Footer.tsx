import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Phone, Truck, Sparkles } from 'lucide-react';
import { ViewState } from '../types';
import { BEC_COLLECTIONS, BEC_CONTACT } from '../constants';

interface FooterProps {
  onNavigate?: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#3B2010] text-[#FAF4EC] px-6 md:px-12 py-16 border-t border-[#5A331C] relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif italic font-black text-[#FAF4EC] tracking-tight leading-none">
              B.E.C
            </h2>
            <p className="font-sans italic font-extrabold text-xl text-[#E5C9A8]">
              Footwear
            </p>
          </div>
          <p className="text-[#E5C9A8]/90 text-xs md:text-sm leading-relaxed">
            Your destination for all-terrain clogs, studded slides, classic slides, double-strap sandals, designer clogs, and double-band slippers—crafted for daily comfort and standout style.
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate(ViewState.ABOUT)}
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#FAF4EC] hover:text-[#E5C9A8] cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={13} /> Our Footwear Story
            </button>
          </div>
        </div>

        {/* Top Collections Column */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#E5C9A8]">
            Our Top Collection
          </h4>
          <ul className="space-y-2 text-xs text-[#FAF4EC]/90">
            {BEC_COLLECTIONS.map((col) => (
              <li
                key={col}
                onClick={() => onNavigate && onNavigate(ViewState.CATEGORIES)}
                className="hover:text-white hover:translate-x-1 cursor-pointer transition-all"
              >
                — {col}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Nationwide Delivery Column */}
        <div className="space-y-4">
          <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#E5C9A8]">
            Order via Call or WhatsApp
          </h4>
          <div className="space-y-3 text-xs">
            {BEC_CONTACT.phones.map((phone) => (
              <div
                key={phone.display}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#261409]/70 border border-[#5A331C]"
              >
                <div className="flex items-center gap-2.5">
                  <a
                    href={`tel:${phone.tel}`}
                    className="w-8 h-8 rounded-lg bg-[#FAF4EC] text-[#4A2B18] flex items-center justify-center hover:bg-white transition-colors"
                    aria-label={`Call ${phone.display}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${phone.tel}`}
                    className="font-mono font-bold text-sm text-[#FAF4EC] hover:underline tabular-nums"
                  >
                    {phone.display}
                  </a>
                </div>
                <a
                  href={`https://wa.me/${phone.whatsapp}?text=${encodeURIComponent('Hello B.E.C Footwear, I would like to place an order.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25D366]/15 text-[#4ADE80] hover:bg-[#25D366] hover:text-white font-bold text-[11px] transition-colors"
                >
                  <WhatsAppIcon size={13} title={`WhatsApp ${phone.display}`} />
                  <span>WhatsApp</span>
                </a>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-1 text-[#FAF4EC]">
              <span className="w-8 h-8 rounded-lg bg-[#FAF4EC]/10 flex items-center justify-center text-[#E5C9A8] shrink-0">
                <Truck className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#E5C9A8] font-bold block">
                  Dispatch Coverage
                </span>
                <span className="text-xs font-extrabold tracking-wide">
                  NATIONWIDE DELIVERY ACROSS GHANA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#5A331C] mt-10 text-[#E5C9A8]/80 text-[11px]">
        <div className="uppercase tracking-[0.25em] font-extrabold italic text-[#FAF4EC]">
          B.E.C Footwear • Nationwide Delivery
        </div>
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate(ViewState.CONTACT)}
            className="hover:text-white cursor-pointer transition-colors"
          >
            Contact Support
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate(ViewState.LEGAL)}
            className="hover:text-white cursor-pointer transition-colors"
          >
            Policies & Exchanges
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
