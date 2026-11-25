import React, { useEffect } from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate?: (view: any) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'Privacy Policy & Analytics Transparency — B.E.C Footwear';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Learn how B.E.C Footwear protects your privacy and order information for nationwide delivery across Ghana.'
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#3B2010] selection:bg-[#4A2B18] selection:text-[#FAF4EC]">
      {/* Top Banner */}
      <div className="bg-[#4A2B18] border-b border-[#3B2010] py-3.5 px-4 text-center">
        <p className="text-xs sm:text-sm font-serif italic text-[#FAF4EC] tracking-wide">
          “Privacy isn't just compliance—it's basic respect for every B.E.C Footwear customer.” —{' '}
          <span className="font-sans not-italic font-black text-[#E5C9A8]">B.E.C Footwear</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EAD8] border border-[#EAD8C0] text-[#4A2B18] text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-[#8C532B]" />
            Data Protection &amp; Transparency
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif italic font-bold text-[#3B2010] tracking-tight">
            Privacy Policy &amp; Transparency
          </h1>
          <p className="text-xs sm:text-sm text-[#8C532B] font-semibold">
            B.E.C Footwear • Nationwide Delivery Across Ghana
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-[#5A331C] font-sans text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white border border-[#EAD8C0] p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 text-[#3B2010] font-serif italic font-bold text-xl">
              <Lock className="text-[#4A2B18]" size={22} />
              <h2>1. Our Commitment to Your Privacy</h2>
            </div>
            <p>
              At B.E.C Footwear, we treat your personal contact and delivery details with care. Whether you browse our
              All-terrain clogs, Studded slides, Classic slides, Double-strap sandals, Designer clogs, or Double-band
              slippers, or order via WhatsApp, we never sell or rent your details to third-party advertisers.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-[#EAD8C0] p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 text-[#3B2010] font-serif italic font-bold text-xl">
              <EyeOff className="text-emerald-700" size={22} />
              <h2>2. Privacy-First Storefront Analytics</h2>
            </div>
            <p>
              To keep loading speeds fast across mobile networks in Ghana, we rely on minimal, privacy-respecting
              measurement without intrusive third-party ad tracking.
            </p>
            <ul className="space-y-2.5 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-emerald-700 shrink-0 mt-1" size={16} />
                <span>
                  <strong className="text-[#3B2010]">No Ad Trackers:</strong> We do not sell browsing profiles or run
                  invasive cross-site ad cookies.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-emerald-700 shrink-0 mt-1" size={16} />
                <span>
                  <strong className="text-[#3B2010]">Order Reliability:</strong> Aggregate event metrics (such as
                  viewing footwear, adding EU sizes to bag, and checkout completions) help keep popular sizes stocked.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-[#EAD8C0] p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3 text-[#3B2010] font-serif italic font-bold text-xl">
              <FileText className="text-[#8C532B]" size={22} />
              <h2>3. Information Collected When You Order</h2>
            </div>
            <p>
              When you place a B.E.C Footwear order or confirm via WhatsApp, we collect only the
              information needed for delivery:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5A331C]">
              <li>Your name and active phone number / WhatsApp line.</li>
              <li>Delivery address or pickup landmark anywhere in Ghana.</li>
              <li>Selected footwear style, EU size (38–45), and pair count.</li>
            </ul>
            <p className="pt-2">
              Mobile Money and card payments are handled by trusted encrypted payment processors; we never store raw
              card numbers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-[#F5EAD8] border border-[#EAD8C0] p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-[#3B2010] font-serif italic font-bold text-xl">
              <h2>4. Contact Support</h2>
            </div>
            <p>
              If you have privacy questions or wish to update or remove saved delivery details, contact B.E.C Footwear
              directly via WhatsApp or phone on{' '}
              <a
                href="https://wa.me/233244122075"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A2B18] font-black hover:underline tabular-nums"
              >
                0244122075
              </a>{' '}
              or{' '}
              <a
                href="https://wa.me/233260584440"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A2B18] font-black hover:underline tabular-nums"
              >
                0260584440
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
