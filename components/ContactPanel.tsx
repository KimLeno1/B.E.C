import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, MessageSquare, Info, Shield, RefreshCcw, ChevronDown, Send, CheckCircle2, Phone, Truck } from 'lucide-react';
import { databaseService } from '../services/databaseService';

type SupportTab = 'FAQ' | 'FEEDBACK' | 'ABOUT' | 'TERMS' | 'PRIVACY' | 'REFUND_SHIPPING';

const ContactPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SupportTab>('FEEDBACK');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [faqData, setFaqData] = useState<any[]>([]);
  const [aboutData, setAboutData] = useState<string>('');
  const [termsData, setTermsData] = useState<string>('');
  const [privacyData, setPrivacyData] = useState<string>('');
  const [refundData, setRefundData] = useState<string>('');

  const [formData, setFormData] = useState({
    identifier: '',
    email: '',
    topic: 'SIZING_AND_FIT',
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faq, about, terms, privacy, refund] = await Promise.all([
          databaseService.getPanelContent('faq'),
          databaseService.getPanelContent('about'),
          databaseService.getPanelContent('terms'),
          databaseService.getPanelContent('privacy'),
          databaseService.getPanelContent('refund'),
        ]);

        if (faq && Array.isArray(faq)) setFaqData(faq);
        if (about) setAboutData(about);
        if (terms) setTermsData(terms);
        if (privacy) setPrivacyData(privacy);
        if (refund) setRefundData(refund);
      } catch (error) {
        console.error('Failed to load panel content', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const loggedInUser = localStorage.getItem('userId');
      const payload = {
        userId: loggedInUser || 'GUEST',
        userHandle: formData.identifier,
        email: formData.email,
        topic: formData.topic,
        message: formData.message,
      };

      const res = await databaseService.submitFeedback(payload);
      if (res && res.status === 'success') {
        setIsSuccess(true);
        setFormData({ identifier: '', email: '', topic: 'SIZING_AND_FIT', message: '' });
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultFaqs = [
    {
      q: 'What footwear categories do you carry at B.E.C Footwear?',
      a: 'Our Top Collection includes six signature footwear lines: All-terrain clogs, Studded slides, Classic slides, Double-strap sandals, Designer clogs, and Double-band slippers in EU 38–45.',
    },
    {
      q: 'Do you deliver nationwide across Ghana?',
      a: 'Yes! We offer Nationwide Delivery across Ghana—including Accra, Kumasi, Tema, Takoradi, Cape Coast, Sunyani, and Tamale—typically arriving within 1–3 business days.',
    },
    {
      q: 'How can I call or message B.E.C Footwear directly?',
      a: 'You can call or WhatsApp us anytime on 0244122075 or 0260584440 for EU sizing guidance, stock checks, or urgent order dispatch.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We accept Mobile Money (MTN MoMo, Telecel Cash) and Visa/Mastercard securely via Paystack, as well as direct WhatsApp order confirmations.',
    },
  ];

  const displayFaqs = faqData.length > 0 ? faqData : defaultFaqs;

  const renderTabIcon = (tab: SupportTab) => {
    switch (tab) {
      case 'FAQ':
        return <HelpCircle className="w-5 h-5" />;
      case 'FEEDBACK':
        return <MessageSquare className="w-5 h-5" />;
      case 'ABOUT':
        return <Info className="w-5 h-5" />;
      case 'TERMS':
        return <Shield className="w-5 h-5" />;
      case 'PRIVACY':
        return <Shield className="w-5 h-5" />;
      case 'REFUND_SHIPPING':
        return <RefreshCcw className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-8 sm:space-y-10 pb-40 animate-in fade-in duration-700 text-[#3B2010]">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-[#EAD8C0] shadow-sm mb-2">
          <div className="w-2 h-2 rounded-full bg-[#4A2B18] animate-pulse" />
          <span className="text-[10px] font-black text-[#4A2B18] uppercase tracking-[0.35em]">
            B.E.C Footwear Customer Care
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif italic text-[#3B2010] tracking-tight leading-none">
          Support &amp; <span className="text-[#8C532B] not-italic font-sans font-black uppercase">Feedback</span>
        </h1>
        <p className="text-[#8C532B] text-[10px] font-black uppercase tracking-[0.35em] tabular-nums">
          Nationwide Delivery • 0244122075 / 0260584440
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 gap-3 md:justify-center">
        {(['FAQ', 'FEEDBACK', 'ABOUT'] as SupportTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeTab === tab
                ? 'bg-[#4A2B18] text-[#FAF4EC] border-[#4A2B18] shadow-md'
                : 'bg-white text-[#5A331C] border-[#EAD8C0] hover:border-[#8C532B] hover:text-[#3B2010]'
            }`}
          >
            {renderTabIcon(tab)}
            {tab === 'REFUND_SHIPPING' ? 'Refund & Shipping' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 md:p-14 rounded-[2.5rem] border border-[#EAD8C0] shadow-sm min-h-[480px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'FAQ' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 mb-10">
                <h2 className="text-3xl sm:text-4xl font-serif italic text-[#3B2010]">Frequent Queries</h2>
                <p className="text-[10px] font-black text-[#8C532B] uppercase tracking-widest">
                  Quick answers on sizing, delivery &amp; orders
                </p>
              </div>
              <div className="grid gap-4">
                {displayFaqs.map((faq, i) => (
                  <div
                    key={i}
                    className={`bg-[#FAF4EC] border rounded-3xl overflow-hidden transition-all duration-300 ${
                      expandedFaq === i ? 'border-[#4A2B18] bg-white shadow-sm' : 'border-[#EAD8C0]'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="text-sm font-black text-[#3B2010]">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#8C532B] transition-transform duration-300 shrink-0 ${
                          expandedFaq === i ? 'rotate-180 text-[#4A2B18]' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedFaq === i ? 'max-h-60' : 'max-h-0'
                      }`}
                    >
                      <div className="p-6 pt-0 text-xs font-medium text-[#5A331C] leading-relaxed max-w-2xl border-t border-[#EAD8C0] mt-2 whitespace-pre-wrap">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'FEEDBACK' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto"
            >
              {isSuccess ? (
                <div className="py-16 text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 size={42} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-serif italic text-[#3B2010]">Message Received</h2>
                    <p className="text-xs font-semibold text-[#5A331C] uppercase tracking-widest leading-relaxed">
                      Thank you for writing to B.E.C Footwear. <br />
                      Need an immediate reply? Call or WhatsApp 0244122075 / 0260584440.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-8">
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-3xl sm:text-4xl font-serif italic text-[#3B2010]">Direct Message</h2>
                    <p className="text-[10px] font-black text-[#8C532B] uppercase tracking-widest">
                      Questions about sizes, custom requests, or delivery
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#5A331C] uppercase tracking-widest px-1">
                          Your Name or Handle
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.identifier}
                          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                          className="w-full bg-[#FAF4EC] border border-[#EAD8C0] p-4 rounded-2xl text-xs font-bold text-[#3B2010] focus:border-[#4A2B18] focus:bg-white outline-none transition-all placeholder:text-[#8C532B]/50"
                          placeholder="e.g. Kwame Boateng"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#5A331C] uppercase tracking-widest px-1">
                          Email or Phone
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#FAF4EC] border border-[#EAD8C0] p-4 rounded-2xl text-xs font-bold text-[#3B2010] focus:border-[#4A2B18] focus:bg-white outline-none transition-all placeholder:text-[#8C532B]/50"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#5A331C] uppercase tracking-widest px-1">
                        Topic
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full bg-[#FAF4EC] border border-[#EAD8C0] p-4 rounded-2xl text-xs font-bold text-[#3B2010] focus:border-[#4A2B18] focus:bg-white outline-none cursor-pointer"
                      >
                        <option value="SIZING_AND_FIT">EU SIZING &amp; FIT ADVICE</option>
                        <option value="DELIVERY_STATUS">NATIONWIDE DELIVERY ENQUIRY</option>
                        <option value="BULK_OR_PACK_ORDER">MULTI-PAIR / BUNDLE ORDER</option>
                        <option value="GENERAL_QUERY">GENERAL FEEDBACK</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#5A331C] uppercase tracking-widest px-1">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-[#FAF4EC] border border-[#EAD8C0] p-5 rounded-3xl text-xs font-semibold text-[#3B2010] focus:border-[#4A2B18] focus:bg-white outline-none transition-all resize-none placeholder:text-[#8C532B]/50"
                        placeholder="Tell us the pair name, EU size (38–45), or delivery location..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 bg-[#4A2B18] text-[#FAF4EC] font-black uppercase tracking-[0.35em] text-[10px] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#3B2010] transition-all disabled:opacity-50 shadow-md"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-[#FAF4EC] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === 'ABOUT' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 max-w-3xl"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif italic text-[#3B2010] tracking-tight">
                  The Vision of B.E.C Footwear
                </h2>
                <div className="h-1 w-20 bg-[#8C532B]" />
              </div>
              <div className="space-y-6 text-[#5A331C] text-sm leading-relaxed whitespace-pre-wrap">
                {aboutData ||
                  `B.E.C Footwear is built around six signature everyday and statement silhouettes: All-terrain clogs, Studded slides, Classic slides, Double-strap sandals, Designer clogs, and Double-band slippers.

Our Standard
We inspect every sole, strap, buckle, and finish before dispatch so your footwear arrives looking crisp and feeling cushioned right out of the box.

Nationwide Delivery
Whether you are ordering in Accra, Kumasi, Takoradi, Tamale, or anywhere in Ghana, reach us directly on 0244122075 or 0260584440 for prompt delivery.`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="grid md:grid-cols-3 gap-6">
        <a
          href="tel:+233244122075"
          className="bg-white shadow-sm border border-[#EAD8C0] p-7 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:border-[#4A2B18] transition-colors"
        >
          <Phone className="w-6 h-6 text-[#4A2B18] mb-1" />
          <span className="text-[9px] font-black text-[#8C532B] uppercase tracking-widest">Primary Line</span>
          <span className="text-sm font-black text-[#3B2010] tabular-nums">0244122075</span>
        </a>
        <a
          href="tel:+233260584440"
          className="bg-white shadow-sm border border-[#EAD8C0] p-7 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:border-[#4A2B18] transition-colors"
        >
          <Phone className="w-6 h-6 text-[#8C532B] mb-1" />
          <span className="text-[9px] font-black text-[#8C532B] uppercase tracking-widest">Order Desk</span>
          <span className="text-sm font-black text-[#3B2010] tabular-nums">0260584440</span>
        </a>
        <div className="bg-white shadow-sm border border-[#EAD8C0] p-7 rounded-3xl flex flex-col items-center justify-center space-y-2">
          <Truck className="w-6 h-6 text-[#4A2B18] mb-1" />
          <span className="text-[9px] font-black text-[#8C532B] uppercase tracking-widest">Coverage</span>
          <span className="text-sm font-black text-[#3B2010]">NATIONWIDE DELIVERY</span>
        </div>
      </footer>
    </div>
  );
};

export default ContactPanel;
