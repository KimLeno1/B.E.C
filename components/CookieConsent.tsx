import React, { useState, useEffect } from 'react';
import { setCookie, getCookie } from '../lib/cookieUtils';

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = getCookie('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie('cookieConsent', 'true', 60);
    setShow(false);
  };

  const handleDeny = () => {
    setCookie('cookieConsent', 'denied', 1);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#1E0F06]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FAF4EC]/95 backdrop-blur-2xl border border-[#EAD8C0] p-8 rounded-[2.5rem] max-w-sm w-full space-y-6 shadow-2xl">
        <p className="text-[#5A331C] text-xs leading-relaxed font-medium">
          We use essential storage to keep your B.E.C Footwear bag and preferred EU sizes saved cleanly. Read more in
          our{' '}
          <a href="/privacy" className="text-[#4A2B18] hover:text-[#8C532B] underline font-bold transition-colors">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={handleDeny}
            className="text-[#8C532B] hover:text-[#3B2010] border border-[#EAD8C0] hover:border-[#8C532B] px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="bg-[#4A2B18] text-[#FAF4EC] hover:bg-[#3B2010] shadow-md px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
