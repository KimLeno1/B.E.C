import React, { useState } from 'react';
import { ArrowRight, Eye, X, Footprints } from 'lucide-react';
import { BEC_CONTACT } from '../constants';

interface HeroProps {
  onShopNow: () => void;
  onSelectCategory?: (category: string) => void;
}

const COLLECTION_SPOTLIGHTS = [
  {
    index: '01',
    name: 'All-terrain clogs',
    image: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
    caption: 'Khaki & Crimson Strap · Lugged EVA Outsole',
  },
  {
    index: '02',
    name: 'Studded slides',
    image: '/uploads/bec/bec_studded_slides_1795581066443.jpg',
    caption: 'Onyx Pyramid Studs · Walnut Stitched Footbed',
  },
  {
    index: '03',
    name: 'Classic slides',
    image: '/uploads/bec/bec_classic_slides_1795581065464.jpg',
    caption: 'Ivory Crest Emblem · Contoured Arch Support',
  },
  {
    index: '04',
    name: 'Double-strap sandals',
    image: '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg',
    caption: 'Cream & Tartan Plaid · Dual Buckle Fit',
  },
  {
    index: '05',
    name: 'Designer clogs',
    image: '/uploads/bec/bec_designer_clogs_1795581067141.jpg',
    caption: 'Obsidian Web Cutout · Convertible Heel Strap',
  },
  {
    index: '06',
    name: 'Double-band slippers',
    image: '/uploads/bec/bec_double_band_slippers_1795581068033.jpg',
    caption: 'Heritage Check & Star Medallion Craft',
  },
];

const Hero: React.FC<HeroProps> = ({ onShopNow, onSelectCategory }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  const activeCollection = COLLECTION_SPOTLIGHTS[activeIndex] || COLLECTION_SPOTLIGHTS[0];

  const handleCollectionClick = (collectionName: string) => {
    if (onSelectCategory) {
      onSelectCategory(collectionName);
    } else {
      onShopNow();
    }
  };

  return (
    <>
      <section className="bg-[#FAF4EC] border-b border-[#EAD8C0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch">
            {/* Left Editorial Anchor Panel */}
            <div className="lg:col-span-5 bg-[#4A2B18] text-[#FAF4EC] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 border border-[#3B2010]">
              <div className="space-y-4">
                <p className="text-xs font-medium text-[#E5C9A8] tracking-wide">
                  B.E.C Footwear · Ghana · Nationwide Delivery
                </p>

                <h1
                  className="font-serif italic font-black text-[#FAF4EC] leading-[1.02] tracking-tight"
                  style={{ fontSize: 'clamp(2.15rem, 3.6vw, 3.25rem)', textWrap: 'balance' }}
                >
                  Crafted Clogs, Slides &amp; Sandals.
                </h1>

                <p className="text-sm text-[#E5C9A8]/90 leading-relaxed max-w-md">
                  Explore our six signature silhouettes in EU 38–45—built for comfort from street to weekend, dispatched nationwide.
                </p>
              </div>

              {/* Numbered 6-Collection Index */}
              <div className="border-t border-[#FAF4EC]/15 pt-4">
                <p className="text-xs font-semibold text-[#E5C9A8] mb-2.5">
                  Our Top Collection
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-1">
                  {COLLECTION_SPOTLIGHTS.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onMouseEnter={() => setActiveIndex(idx)}
                        onFocus={() => setActiveIndex(idx)}
                        onClick={() => handleCollectionClick(item.name)}
                        className={`group flex items-center justify-between py-1.5 text-left text-sm transition-colors cursor-pointer border-b border-[#FAF4EC]/10 last:border-b-0 ${
                          isActive
                            ? 'text-[#FAF4EC] font-semibold'
                            : 'text-[#E5C9A8]/80 hover:text-[#FAF4EC]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs text-[#E5C9A8]/70 tabular-nums shrink-0">
                            {item.index}.
                          </span>
                          <span className="truncate">{item.name}</span>
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isActive
                              ? 'opacity-100 translate-x-0 text-[#E5C9A8]'
                              : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary CTA & Flyer Action */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={onShopNow}
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#FAF4EC] hover:bg-white text-[#261409] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowFlyerModal(true)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5C9A8] hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Official Flyer</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Footwear Showcase */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Primary Active Collection Frame */}
              <button
                type="button"
                onClick={() => handleCollectionClick(activeCollection.name)}
                className="group relative flex-1 min-h-[260px] sm:min-h-[360px] rounded-2xl overflow-hidden bg-[#F5EAD8] border border-[#EAD8C0] text-left cursor-pointer"
              >
                {!imgError[activeCollection.image] ? (
                  <img
                    src={activeCollection.image}
                    alt={activeCollection.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError((prev) => ({ ...prev, [activeCollection.image]: true }))}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#F5EAD8] text-[#4A2B18] p-6">
                    <Footprints className="w-10 h-10 mb-2 text-[#8C532B]" />
                    <span className="font-serif italic text-xl font-bold">{activeCollection.name}</span>
                  </div>
                )}

                {/* Measured Contrast Scrim */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1E0F06]/88 via-[#1E0F06]/42 to-transparent p-5 sm:p-6 flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#E5C9A8]">
                      Featured Collection · EU 38–45
                    </p>
                    <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#FAF4EC] leading-tight">
                      {activeCollection.name}
                    </h2>
                    <p className="text-xs text-[#E5C9A8]/90">
                      {activeCollection.caption}
                    </p>
                  </div>

                  <span className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF4EC] text-[#261409] text-xs font-bold group-hover:bg-white transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>

              {/* 6-Silhouette Thumbnail Switcher */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {COLLECTION_SPOTLIGHTS.map((tile, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={tile.name}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        setActiveIndex(idx);
                        handleCollectionClick(tile.name);
                      }}
                      className={`group rounded-xl overflow-hidden bg-[#FFFCF7] p-1 text-left transition-all cursor-pointer border ${
                        isActive
                          ? 'border-[#4A2B18] ring-1 ring-[#4A2B18]'
                          : 'border-[#EAD8C0] hover:border-[#8C532B]'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#F5EAD8]">
                        {!imgError[tile.image] ? (
                          <img
                            src={tile.image}
                            alt={tile.name}
                            referrerPolicy="no-referrer"
                            onError={() => setImgError((prev) => ({ ...prev, [tile.image]: true }))}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8C532B]">
                            <Footprints className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <p className="mt-1 px-0.5 text-[11px] font-semibold text-[#261409] truncate">
                        {tile.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Promotional Flyer Lightbox */}
      {showFlyerModal && (
        <div
          className="fixed inset-0 z-[260] bg-[#261409]/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowFlyerModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-[#FAF4EC] rounded-2xl p-3 border border-[#EAD8C0] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFlyerModal(false)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-[#4A2B18] text-[#FAF4EC] flex items-center justify-center shadow-lg hover:bg-[#261409] cursor-pointer"
              aria-label="Close flyer preview"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={BEC_CONTACT.flyerImage}
              alt="B.E.C Footwear Official Collection Flyer"
              referrerPolicy="no-referrer"
              className="w-full h-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;
