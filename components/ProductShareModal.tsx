import React, { useState } from 'react';
import { Product } from '../types';
import { getImageUrl } from '../lib/imageUtils';
import { toast } from 'sonner';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageSquare,
  FileText,
  Tag,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { trackPlausibleEvent } from '../lib/analytics';

interface ProductShareModalProps {
  product: Product;
  initialSize?: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  'Check out this pair at B.E.C Footwear!',
  'What do you think of this EU size?',
  'Can you grab these slides/clogs for me?',
  'Nationwide Delivery from B.E.C Footwear',
  'Clean everyday pair — rate the fit!',
];

export const ProductShareModal: React.FC<ProductShareModalProps> = ({
  product,
  initialSize,
  isOpen,
  onClose,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'EU 42')
  );
  const [shortMessage, setShortMessage] = useState<string>('Check out this pair at B.E.C Footwear!');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCard, setCopiedCard] = useState<boolean>(false);

  if (!isOpen) return null;

  const firstImageRaw = product.images && product.images.length > 0 ? product.images[0] : product.image;
  const firstImageUrl = getImageUrl(firstImageRaw);
  const absoluteImageUrl = firstImageUrl.startsWith('http')
    ? firstImageUrl
    : `${window.location.origin}${firstImageUrl}`;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const queryParams = new URLSearchParams();
  queryParams.set('productId', product.id);
  if (selectedSize && selectedSize !== 'Standard') {
    queryParams.set('size', selectedSize);
  }
  if (shortMessage && shortMessage.trim() !== '') {
    queryParams.set('msg', shortMessage.trim());
  }
  const shareUrl = `${baseUrl}/?${queryParams.toString()}`;

  const formatWhatsAppText = () => {
    return [
      `👞 *B.E.C FOOTWEAR COLLECTION* 👞`,
      `*${product.name}* (${product.category || 'Footwear'})`,
      ``,
      `📏 *EU Size:* ${selectedSize}`,
      `💰 *Price:* GH₵${product.price}${
        product.originalPrice && product.originalPrice > product.price
          ? ` _(Was: GH₵${product.originalPrice})_`
          : ''
      }`,
      `💬 *Note:* "${shortMessage}"`,
      ``,
      `🖼️ *Preview:* ${absoluteImageUrl}`,
      `⚡ *View & Order:* ${shareUrl}`,
      `📞 *Order Lines:* 0244122075 / 0260584440 • Nationwide Delivery`,
    ].join('\n');
  };

  const formatRichCardText = () => {
    return [
      `👞 B.E.C FOOTWEAR • CURATED PAIR 👞`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📦 PAIR: ${product.name}`,
      `🏷️ COLLECTION: ${product.category || 'Top Collection'}`,
      `📏 EU SIZE: ${selectedSize}`,
      `💰 PRICE: GH₵${product.price}`,
      `💬 NOTE: "${shortMessage}"`,
      ``,
      `🖼️ PREVIEW: ${absoluteImageUrl}`,
      `🔗 DIRECT LINK: ${shareUrl}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Nationwide Delivery Ghana • 0244122075 / 0260584440`,
    ].join('\n');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Product link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);

      trackPlausibleEvent('product_share_copy_link', {
        product_id: product.id,
        product_name: product.name,
      });
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleCopyRichCard = async () => {
    try {
      await navigator.clipboard.writeText(formatRichCardText());
      setCopiedCard(true);
      toast.success('Formatted footwear card copied!');
      setTimeout(() => setCopiedCard(false), 2500);

      trackPlausibleEvent('product_share_copy_card', {
        product_id: product.id,
        product_name: product.name,
      });
    } catch {
      toast.error('Failed to copy card.');
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(formatWhatsAppText())}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out ${product.name} (Size ${selectedSize} • GH₵${product.price}) at B.E.C Footwear! "${shortMessage}"`
  )}&url=${encodeURIComponent(shareUrl)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
    `👞 ${product.name} (Size ${selectedSize} • GH₵${product.price})\n"${shortMessage}"`
  )}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `B.E.C Footwear: ${product.name}`,
          text: `[EU ${selectedSize} • GH₵${product.price}] "${shortMessage}"`,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
        trackPlausibleEvent('product_share_native', {
          product_id: product.id,
          product_name: product.name,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#1E0F06]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#FAF4EC] border border-[#EAD8C0] text-[#3B2010] shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[2rem] p-5 sm:p-7 space-y-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAD8C0]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A2B18] flex items-center justify-center text-[#E5C9A8]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-base sm:text-lg font-serif italic font-bold text-[#3B2010] tracking-tight">
                Share Footwear Pair
              </h2>
              <p className="text-[10px] font-bold text-[#8C532B] uppercase tracking-widest">
                Includes Photo, EU Size, Price &amp; Message
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5EAD8] border border-[#EAD8C0] text-[#4A2B18] hover:bg-[#EAD8C0] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Visual Card Preview */}
        <div className="p-3.5 sm:p-4 bg-white border border-[#EAD8C0] rounded-2xl flex gap-4 items-center relative overflow-hidden group shadow-sm">
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-[#F5EAD8] overflow-hidden shrink-0 relative border border-[#EAD8C0]">
            <img
              src={firstImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-1 left-1 bg-[#4A2B18]/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-[#E5C9A8]">
              B.E.C Pair
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold text-[#4A2B18] bg-[#F5EAD8] px-2 py-0.5 rounded border border-[#EAD8C0] uppercase">
                {product.category || 'Top Collection'}
              </span>
              <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                In Stock
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#3B2010] truncate">{product.name}</h3>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-base sm:text-lg font-black text-[#3B2010] tabular-nums">
                GH₵{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-[#8C532B]/70 line-through tabular-nums">
                  GH₵{product.originalPrice}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#4A2B18] bg-[#F5EAD8] px-2 py-0.5 rounded border border-[#EAD8C0]">
              <Tag className="w-3 h-3 text-[#8C532B]" />
              <span className="tabular-nums">Selected Size: {selectedSize}</span>
            </div>
          </div>
        </div>

        {/* Size Selection Segment */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#5A331C] flex items-center justify-between">
              <span>Select EU Size to Highlight</span>
              <span className="text-[9px] text-[#8C532B] lowercase">tap to change</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer tabular-nums ${
                    selectedSize === sz
                      ? 'bg-[#4A2B18] text-[#FAF4EC] shadow-md border border-[#4A2B18]'
                      : 'bg-white text-[#5A331C] border border-[#EAD8C0] hover:border-[#8C532B]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Short Message Input & Presets */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#5A331C] flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-[#8C532B]" />
              <span>Personal Short Message</span>
            </label>
            <span className="text-[9px] font-semibold text-[#8C532B] tabular-nums">
              {shortMessage.length}/120 chars
            </span>
          </div>

          <textarea
            value={shortMessage}
            onChange={(e) => setShortMessage(e.target.value.slice(0, 120))}
            placeholder="Add a short note..."
            rows={2}
            className="w-full bg-white border border-[#EAD8C0] rounded-xl p-3 text-xs text-[#3B2010] placeholder:text-[#8C532B]/50 focus:outline-none focus:border-[#4A2B18] transition-all resize-none font-sans"
          />

          <div className="flex flex-wrap gap-1.5">
            {PRESET_MESSAGES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setShortMessage(preset)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer truncate max-w-full ${
                  shortMessage === preset
                    ? 'bg-[#4A2B18] text-[#FAF4EC] border-[#4A2B18]'
                    : 'bg-white text-[#5A331C] border-[#EAD8C0] hover:border-[#8C532B]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Link Input Box */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#5A331C]">
            Direct Pair Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-[#EAD8C0]">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2 text-[10px] font-mono text-[#5A331C] outline-none select-all overflow-hidden text-ellipsis"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-[#4A2B18] text-[#FAF4EC] hover:bg-[#3B2010] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="space-y-3 pt-2">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackPlausibleEvent('product_share_whatsapp', {
                product_id: product.id,
                product_name: product.name,
              })
            }
            className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-[#1E0F06] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
          >
            <WhatsAppIcon size={18} />
            <span>Share on WhatsApp (With Photo &amp; Specs)</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-3 px-3 bg-white hover:bg-[#F5EAD8] text-[#3B2010] border border-[#EAD8C0] font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#4A2B18]" />
              <span>Device Share</span>
            </button>

            <button
              type="button"
              onClick={handleCopyRichCard}
              className="py-3 px-3 bg-white hover:bg-[#F5EAD8] text-[#3B2010] border border-[#EAD8C0] font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              {copiedCard ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-[#8C532B]" />
              )}
              <span>{copiedCard ? 'Card Copied!' : 'Copy Rich Card'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1 text-[10px] font-bold text-[#8C532B]">
            <span>Also share via:</span>
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3B2010] transition-colors underline cursor-pointer"
            >
              X / Twitter
            </a>
            <span>•</span>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3B2010] transition-colors underline cursor-pointer"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShareModal;
