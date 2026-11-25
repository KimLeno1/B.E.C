import React, { useState } from 'react';
import { getImageUrl } from '../lib/imageUtils';
import { Product } from '../types';
import { ShoppingBag, Check, Bell, Loader2, Heart } from 'lucide-react';
import LazyImage from './LazyImage';
import WaitlistModal from './WaitlistModal';
import { triggerHaptic } from '../lib/haptics';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, colorVariant?: { main: string; secondary: string }) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  saleTimerEnd?: number | null;
  onToggleCompare?: (product: Product) => void;
  isComparing?: boolean;
  onQuickBuy?: (product: Product) => void;
  recommendationReason?: string;
  onDislike?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  recommendationReason,
  onDislike,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColorVariant, setSelectedColorVariant] = useState<{ main: string; secondary: string } | undefined>(
    product.colorVariants?.[0]
  );
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const isOutOfStock = !product.inStock || product.stockCount === 0;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleCardClick = () => {
    triggerHaptic('selection');
    onClick(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('like');
    onToggleWishlist(product);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      triggerHaptic('selection');
      setIsWaitlistOpen(true);
      return;
    }

    const hasMultipleSizes = product.sizes && product.sizes.length > 1;
    if (hasMultipleSizes && !showSizeModal) {
      triggerHaptic('selection');
      setShowSizeModal(true);
      return;
    }

    executeAddToCart();
  };

  const executeAddToCart = (sizeToUse?: string) => {
    const finalSize = sizeToUse || selectedSize;
    setIsAdding(true);
    triggerHaptic('selection');

    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      triggerHaptic('success');
      onAddToCart(product, finalSize, selectedColorVariant);

      setTimeout(() => {
        setIsAdded(false);
        setShowSizeModal(false);
      }, 1000);
    }, 350);
  };

  return (
    <>
      <article className="group relative flex flex-col h-full bg-[#FFFCF7] border border-[#EAD8C0] rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-[#4A2B18]/40 transition-all duration-200">
        {/* Product Image (4:3 Footwear Framing) */}
        <div
          onClick={handleCardClick}
          className="relative aspect-[4/3] w-full bg-[#F5EAD8] overflow-hidden cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={`View details for ${product.name}`}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
          {product.video ? (
            <video
              src={`${product.video}#t=1`}
              poster={product.image && !product.image.includes('placeholder') ? getImageUrl(product.image) : undefined}
              preload="metadata"
              muted
              playsInline
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <LazyImage
              src={getImageUrl(product.image || (product.images && product.images.length > 0 ? product.images[0] : ''))}
              alt={product.name}
              containerClassName="w-full h-full"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
            />
          )}

          <div className="absolute top-1.5 right-1.5 z-10">
            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label={isWishlisted ? 'Remove from saved items' : 'Save item'}
              className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center cursor-pointer group/wish"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isWishlisted
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/95 text-[#5A331C] hover:text-rose-500 border border-[#EAD8C0]'
                }`}
              >
                <Heart
                  size={15}
                  className={`transition-transform duration-200 group-hover/wish:scale-110 ${
                    isWishlisted ? 'fill-white stroke-white' : ''
                  }`}
                />
              </div>
            </button>
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#FAF4EC]/75 flex items-center justify-center p-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A2B18] bg-[#FAF4EC] px-3 py-1 rounded-md border border-[#EAD8C0]">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1 p-4 justify-between gap-3">
          <div onClick={handleCardClick} className="cursor-pointer space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-[#7C5A43]">
              <span className="truncate font-medium">{product.category}</span>
              {!isOutOfStock && product.stockCount <= 5 && (
                <span className="text-amber-800 font-semibold shrink-0 tabular-nums">
                  {product.stockCount <= 2 ? `${product.stockCount} left` : 'Low stock'}
                </span>
              )}
            </div>

            <h3 className="text-[15px] font-serif italic text-[#261409] font-semibold line-clamp-2 min-h-[2.625rem] leading-snug group-hover:text-[#4A2B18] transition-colors">
              {product.name}
            </h3>

            {recommendationReason && (
              <div className="flex items-center justify-between gap-1 text-xs text-[#7C5A43]">
                <span className="truncate">{recommendationReason}</span>
                {onDislike && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('selection');
                      onDislike(product);
                    }}
                    title="Dismiss recommendation"
                    aria-label="Dismiss recommendation"
                    className="min-w-[24px] min-h-[24px] flex items-center justify-center text-[#8C532B] hover:text-rose-600 text-xs rounded hover:bg-[#F5EAD8] transition-colors shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-[#EAD8C0]/70">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-mono font-bold text-[#261409] tabular-nums">
                  GH₵{product.price}
                </span>
                {hasDiscount && (
                  <span className="text-xs font-mono text-[#8E6D55] line-through tabular-nums">
                    GH₵{product.originalPrice}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="text-xs font-mono font-semibold text-[#8C532B] tabular-nums">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {isOutOfStock ? (
              <button
                type="button"
                onClick={handleAddClick}
                className="w-full min-h-[44px] h-11 rounded-lg border border-[#EAD8C0] bg-[#FAF4EC] text-[#4A2B18] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#F5EAD8] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Bell size={14} className="text-[#4A2B18]" />
                <span>Notify Restock</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                disabled={isAdding}
                aria-label={`Add ${product.name} to bag`}
                className={`w-full min-h-[44px] h-11 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : isAdding
                    ? 'bg-[#3B2010] text-[#F5EAD8]'
                    : 'bg-[#4A2B18] hover:bg-[#261409] text-[#FAF4EC]'
                }`}
              >
                {isAdding ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-[#F5EAD8]" />
                    <span>Adding...</span>
                  </>
                ) : isAdded ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Quick EU Size Selection Modal */}
      {showSizeModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-[#261409]/60 backdrop-blur-2xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowSizeModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#FFFCF7] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl border border-[#EAD8C0] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EAD8C0]">
              <div>
                <h4 className="text-sm font-bold text-[#261409]">Select EU Footwear Size</h4>
                <p className="text-xs text-[#7C5A43]">{product.name}</p>
              </div>
              <button
                onClick={() => setShowSizeModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#4A2B18] hover:bg-[#EAD8C0] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    executeAddToCart(size);
                  }}
                  className={`min-h-[44px] h-11 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border tabular-nums ${
                    selectedSize === size
                      ? 'bg-[#4A2B18] text-[#FAF4EC] border-[#4A2B18]'
                      : 'bg-[#FAF4EC] text-[#4A2B18] border-[#EAD8C0] hover:border-[#4A2B18]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {product.colorVariants && product.colorVariants.length > 1 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-[#8C532B]">Colorway</span>
                <div className="flex gap-2">
                  {product.colorVariants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColorVariant(v)}
                      className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform ${
                        selectedColorVariant?.main === v.main ? 'border-[#4A2B18] scale-105' : 'border-[#EAD8C0]'
                      }`}
                      style={{ background: `linear-gradient(135deg, ${v.main} 50%, ${v.secondary} 50%)` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <WaitlistModal
        product={product}
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        initialSize={selectedSize}
      />
    </>
  );
};

export default ProductCard;
