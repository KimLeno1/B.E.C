import React, { useEffect } from 'react';
import { ShieldCheck, Sparkles, MapPin, Banknote, CheckCircle2, Phone, Truck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface AboutPageProps {
  onNavigate?: (view: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'About B.E.C Footwear — Slides, Clogs & Sandals in Ghana';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'B.E.C Footwear curates all-terrain clogs, studded slides, classic slides, double-strap sandals, designer clogs, and double-band slippers with nationwide delivery across Ghana. Call or WhatsApp 0244122075 / 0260584440.'
    );

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'About B.E.C Footwear — Nationwide Footwear Delivery in Ghana');

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute(
      'content',
      'B.E.C Footwear curates all-terrain clogs, studded & classic slides, double-strap sandals, designer clogs, and double-band slippers across Ghana. Call 0244122075 / 0260584440.'
    );

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'B.E.C Footwear',
      logo: '/logo.svg',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GH',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+233244122075',
          contactType: 'customer service',
          areaServed: 'GH',
          availableLanguage: ['English', 'Twi'],
        },
        {
          '@type': 'ContactPoint',
          telephone: '+233260584440',
          contactType: 'sales',
          areaServed: 'GH',
          availableLanguage: ['English', 'Twi'],
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'jsonld-about-schema';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('jsonld-about-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const whatsappPrimary =
    "https://wa.me/233244122075?text=Hello%20B.E.C%20Footwear!%20I'd%20like%20to%20enquire%20about%20a%20pair.";
  const whatsappSecondary =
    "https://wa.me/233260584440?text=Hello%20B.E.C%20Footwear!%20I'd%20like%20to%20order%20from%20your%20collection.";

  return (
    <div className="min-h-screen bg-[#FAF4EC] text-[#3B2010] selection:bg-[#4A2B18] selection:text-[#FAF4EC]">
      {/* Top Callout Banner */}
      <div className="bg-[#4A2B18] border-b border-[#3B2010] py-3.5 px-4 text-center">
        <p className="text-xs sm:text-sm font-serif italic text-[#FAF4EC] tracking-wide">
          “Signature comfort, sculpted soles, and everyday luxury — delivered nationwide.” —{' '}
          <span className="font-sans not-italic font-black text-[#E5C9A8]">B.E.C Footwear</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center">
          {/* Brand Emblem Column */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[#4A2B18] via-[#8C532B] to-[#E5C9A8] opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-500" />
              <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-2 border-[#EAD8C0] bg-[#4A2B18] shadow-2xl flex flex-col items-center justify-center p-6">
                <img src="/logo.svg" alt="B.E.C Footwear Logo" className="w-16 h-16 object-contain mb-2" />
                <span className="text-3xl font-serif italic font-black text-[#FAF4EC] leading-none tracking-tight">
                  B.E.C
                </span>
                <span className="text-sm font-serif italic font-bold text-[#E5C9A8] mt-0.5">
                  Footwear
                </span>
              </div>
              <div className="absolute -bottom-2 right-1 bg-[#FAF4EC] border border-[#EAD8C0] px-3 py-1 rounded-full text-[10px] font-black text-[#4A2B18] flex items-center gap-1.5 shadow-md uppercase tracking-wider">
                <Truck size={12} className="text-[#8C532B]" />
                Nationwide Delivery
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#3B2010] tracking-tight">
                B.E.C Footwear
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C532B]">
                Curated Clogs, Slides & Sandals
              </p>
              <p className="text-[11px] font-semibold text-[#5A331C]/80 tabular-nums">
                Call & WhatsApp: 0244122075 • 0260584440
              </p>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <a
                href={whatsappPrimary}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-[#1E0F06] font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 tabular-nums"
              >
                <WhatsAppIcon size={16} title="WhatsApp 0244122075" />
                0244122075
              </a>
              <a
                href="tel:+233260584440"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#4A2B18] hover:bg-[#3B2010] text-[#FAF4EC] font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 tabular-nums"
              >
                <Phone size={15} />
                0260584440
              </a>
            </div>
          </div>

          {/* Hero Mission Text Column */}
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EAD8] border border-[#EAD8C0] text-[#4A2B18] text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} className="text-[#8C532B]" />
              Our Top Collection
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold leading-tight text-[#3B2010]">
              Step into comfort with{' '}
              <span className="text-[#8C532B] not-italic font-sans font-black">handpicked</span> slides,
              clogs &amp; sandals.
            </h2>

            <p className="text-sm sm:text-base text-[#5A331C] leading-relaxed font-sans font-medium">
              B.E.C Footwear brings together six sought-after footwear silhouettes: All-terrain clogs, Studded
              slides, Classic slides, Double-strap sandals, Designer clogs, and Double-band slippers. Every pair
              is inspected in Ghana for sole cushion, strap strength, and true-to-size EU 38–45 fit before rapid
              nationwide dispatch.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EAD8C0]">
              <div className="bg-white border border-[#EAD8C0] p-4 rounded-2xl shadow-sm">
                <span className="text-2xl font-black text-[#3B2010] block tabular-nums">6 Lines</span>
                <span className="text-[10px] font-bold text-[#8C532B] uppercase tracking-wider">
                  Core Footwear
                </span>
              </div>
              <div className="bg-white border border-[#EAD8C0] p-4 rounded-2xl shadow-sm">
                <span className="text-2xl font-black text-[#4A2B18] block tabular-nums">EU 38–45</span>
                <span className="text-[10px] font-bold text-[#8C532B] uppercase tracking-wider">
                  Checked Sizing
                </span>
              </div>
              <div className="bg-white border border-[#EAD8C0] p-4 rounded-2xl col-span-2 sm:col-span-1 shadow-sm">
                <span className="text-2xl font-black text-[#25D366] block">Ghana Wide</span>
                <span className="text-[10px] font-bold text-[#8C532B] uppercase tracking-wider">
                  Nationwide Delivery
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* BRAND ETHOS & VISION */}
        <section className="bg-[#4A2B18] text-[#FAF4EC] p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5C9A8]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5C9A8]" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E5C9A8]">
                Craft &amp; Convenience // Ghana
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif italic text-white">
              “Footwear built to look sharp from morning errands to weekend link-ups.”
            </h3>

            <div className="text-sm sm:text-base text-[#FAF4EC]/85 leading-relaxed space-y-4 font-sans">
              <p>
                Whether you want rugged all-terrain clogs with adjustable heel straps, edgy matte studded slides,
                or effortless double-band slippers for warm weather, B.E.C Footwear delivers curated pairs without
                guesswork.
              </p>
              <p>
                We price every pair transparently in Ghanaian Cedi (GH₵), offer quick Paystack Mobile Money &amp;
                card checkout, and maintain direct WhatsApp ordering on{' '}
                <strong className="text-[#E5C9A8] tabular-nums">0244122075</strong> and{' '}
                <strong className="text-[#E5C9A8] tabular-nums">0260584440</strong> so your size arrives fast
                anywhere in Ghana.
              </p>
            </div>
          </div>
        </section>

        {/* CURATION SHOWCASE */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.28em] text-[#8C532B]">
              Quality Assurance
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#3B2010]">
              Inspected Pair by Pair
            </h3>
            <p className="text-xs font-medium text-[#5A331C] max-w-lg mx-auto">
              Every silhouette in our collection is verified for cushion density, grip traction, and finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-[#EAD8C0] rounded-3xl overflow-hidden group hover:border-[#8C532B] transition-all shadow-sm">
              <div className="h-64 overflow-hidden relative bg-[#F5EAD8]">
                <img
                  src="/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg"
                  alt="All-terrain clogs by B.E.C Footwear"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-[#4A2B18]/90 px-3 py-1 rounded-full text-[10px] font-bold text-[#FAF4EC] border border-[#E5C9A8]/30">
                  All-terrain clogs
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h4 className="text-base font-serif italic font-bold text-[#3B2010]">
                  All-Terrain &amp; Designer Clogs
                </h4>
                <p className="text-xs text-[#5A331C] leading-relaxed font-sans">
                  Molded EVA comfort, breathable ventilation ports, and woven turbo backstraps engineered for both
                  city concrete and weekend terrain.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#8C532B]">
                  <span>Quality Check #01</span>
                  <span className="text-emerald-700">✓ Verified Traction</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-[#EAD8C0] rounded-3xl overflow-hidden group hover:border-[#8C532B] transition-all shadow-sm">
              <div className="h-64 overflow-hidden relative bg-[#F5EAD8]">
                <img
                  src="/uploads/bec/bec_studded_slides_1795581066443.jpg"
                  alt="Studded slides by B.E.C Footwear"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-[#4A2B18]/90 px-3 py-1 rounded-full text-[10px] font-bold text-[#FAF4EC] border border-[#E5C9A8]/30">
                  Studded &amp; Classic Slides
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h4 className="text-base font-serif italic font-bold text-[#3B2010]">
                  Studded &amp; Classic Slides
                </h4>
                <p className="text-xs text-[#5A331C] leading-relaxed font-sans">
                  Cut-out geometric hardware, heritage woven straps, and cushioned contoured footbeds that hold
                  their profile wear after wear.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#8C532B]">
                  <span>Quality Check #02</span>
                  <span className="text-emerald-700">✓ Verified Footbed</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-[#EAD8C0] rounded-3xl overflow-hidden group hover:border-[#8C532B] transition-all shadow-sm">
              <div className="h-64 overflow-hidden relative bg-[#F5EAD8]">
                <img
                  src="/uploads/bec/bec_double_strap_sandals_1795581066438.jpg"
                  alt="Double-strap sandals and slippers by B.E.C Footwear"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-[#4A2B18]/90 px-3 py-1 rounded-full text-[10px] font-bold text-[#FAF4EC] border border-[#E5C9A8]/30">
                  Sandals &amp; Slippers
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h4 className="text-base font-serif italic font-bold text-[#3B2010]">
                  Double-Strap Sandals &amp; Slippers
                </h4>
                <p className="text-xs text-[#5A331C] leading-relaxed font-sans">
                  Adjustable twin-buckle uppers, thick shock-absorbing soles, and effortless slip-in styling made
                  for all-day wear across Ghana.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#8C532B]">
                  <span>Quality Check #03</span>
                  <span className="text-emerald-700">✓ Verified Stitching</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.28em] text-[#8C532B]">
              Our Commitment
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#3B2010]">
              Why Shop B.E.C Footwear
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#EAD8C0] p-8 rounded-3xl space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EAD8] border border-[#EAD8C0] text-[#4A2B18] flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-serif italic font-bold text-[#3B2010]">1. Inspected Craftsmanship</h4>
              <p className="text-xs text-[#5A331C] leading-relaxed font-sans">
                Every pair is checked for adhesive finish, strap tension, sole cushioning, and accurate EU sizing
                before dispatch.
              </p>
            </div>

            <div className="bg-white border border-[#EAD8C0] p-8 rounded-3xl space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EAD8] border border-[#EAD8C0] text-[#8C532B] flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <h4 className="text-lg font-serif italic font-bold text-[#3B2010]">2. Focused Collection</h4>
              <p className="text-xs text-[#5A331C] leading-relaxed font-sans">
                Six focused footwear styles—clogs, slides, sandals, and double-band slippers—curated so every option
                stands out.
              </p>
            </div>

            <div className="bg-white border border-[#EAD8C0] p-8 rounded-3xl space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EAD8] border border-[#EAD8C0] text-[#4A2B18] flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <h4 className="text-lg font-serif italic font-bold text-[#3B2010]">3. Nationwide Delivery</h4>
              <p className="text-xs text-[#5A331C] leading-relaxed font-sans">
                Reliable doorstep and station dispatch across Accra, Kumasi, Tema, Takoradi, Cape Coast, Sunyani,
                Tamale, and all 16 regions.
              </p>
            </div>

            <div className="bg-white border border-[#EAD8C0] p-8 rounded-3xl space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F5EAD8] border border-[#EAD8C0] text-[#8C532B] flex items-center justify-center">
                <Banknote size={24} />
              </div>
              <h4 className="text-lg font-serif italic font-bold text-[#3B2010]">4. Flexible Ghana Payments</h4>
              <p className="text-xs text-[#5A331C] leading-relaxed font-sans">
                Transparent pricing in GH₵ with secure Mobile Money (MTN MoMo, Telecel Cash), Visa/Mastercard,
                and instant WhatsApp order support.
              </p>
            </div>
          </div>
        </section>

        {/* PROMISE SECTION */}
        <section className="bg-[#F5EAD8] border border-[#EAD8C0] p-8 sm:p-12 rounded-[2.5rem] space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.28em] text-[#8C532B]">
              Service Standard
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#3B2010]">
              Our B.E.C Promise
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#EAD8C0]">
              <CheckCircle2 className="text-[#4A2B18] shrink-0 mt-0.5" size={20} />
              <div>
                <h5 className="text-sm font-bold text-[#3B2010] mb-1">Exact Pairs Photographed</h5>
                <p className="text-xs text-[#5A331C] leading-relaxed">
                  What you see on B.E.C Footwear matches the soles, straps, and finish delivered to your door.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#EAD8C0]">
              <CheckCircle2 className="text-[#4A2B18] shrink-0 mt-0.5" size={20} />
              <div>
                <h5 className="text-sm font-bold text-[#3B2010] mb-1">Ready-to-Ship Inventory</h5>
                <p className="text-xs text-[#5A331C] leading-relaxed">
                  In-stock pairs prepared promptly for same-day local dispatch or next-day regional transit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#EAD8C0]">
              <CheckCircle2 className="text-[#4A2B18] shrink-0 mt-0.5" size={20} />
              <div>
                <h5 className="text-sm font-bold text-[#3B2010] mb-1">Clear Pricing in GH₵</h5>
                <p className="text-xs text-[#5A331C] leading-relaxed">
                  No hidden platform charges—straightforward pair pricing and bundle savings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#EAD8C0]">
              <CheckCircle2 className="text-[#4A2B18] shrink-0 mt-0.5" size={20} />
              <div>
                <h5 className="text-sm font-bold text-[#3B2010] mb-1">Two Direct Support Lines</h5>
                <p className="text-xs text-[#5A331C] leading-relaxed tabular-nums">
                  Reach us directly via call or WhatsApp on 0244122075 or 0260584440 for sizing advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DIRECT SUPPORT CTA CARD */}
        <section className="bg-[#4A2B18] border border-[#3B2010] p-8 sm:p-12 rounded-[2.5rem] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center mx-auto shadow-lg">
              <WhatsAppIcon size={32} title="WhatsApp B.E.C Footwear" />
            </div>

            <h3 className="text-2xl sm:text-4xl font-serif italic text-white">
              Need help picking your EU size or ordering a pair?
            </h3>

            <p className="text-xs sm:text-sm text-[#FAF4EC]/80 font-sans">
              Call or WhatsApp B.E.C Footwear directly for live stock confirmation and nationwide dispatch.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappPrimary}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-[#1E0F06] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl active:scale-95 tabular-nums"
              >
                <WhatsAppIcon size={18} title="WhatsApp 0244122075" />
                WhatsApp 0244122075
              </a>
              <a
                href={whatsappSecondary}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#FAF4EC] hover:bg-[#E5C9A8] text-[#3B2010] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl active:scale-95 tabular-nums"
              >
                <Phone size={17} />
                Order Line 0260584440
              </a>
            </div>

            <p className="text-[10px] font-bold text-[#E5C9A8] uppercase tracking-widest pt-2">
              Nationwide Delivery Across Ghana • Mon–Sat 8am – 10pm GMT
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
