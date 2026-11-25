import React from 'react';
import { motion } from 'motion/react';
import { ViewState, CategoryInfo } from '../types';
import { APP_CATEGORIES } from '../constants';

interface CategoriesProps {
  categories: CategoryInfo[];
  onSelectCategory: (category: string) => void;
  onNavigate: (view: ViewState) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onSelectCategory, onNavigate }) => {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto space-y-8 pb-32">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <div className="inline-block bg-[#4A2B18] text-[#FAF4EC] px-3.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.22em]">
          B.E.C Footwear
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif italic text-[#3B2010]">
          Our Top <span className="text-[#8C532B] not-italic font-sans font-black">Collection</span>
        </h1>
        <p className="text-[#5A331C] text-xs sm:text-sm max-w-xl">
          All-terrain clogs, studded slides, classic slides, double-strap sandals, designer clogs, and double-band slippers with nationwide delivery across Ghana.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {APP_CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.06 }}
            onClick={() => {
              onSelectCategory(cat.id);
              onNavigate(ViewState.LOBBY);
            }}
            className="group relative h-56 sm:h-64 rounded-3xl overflow-hidden cursor-pointer border border-[#EAD8C0] hover:border-[#4A2B18] transition-all shadow-md hover:shadow-xl bg-[#4A2B18]"
          >
            <img
              src={cat.img}
              className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
              alt={cat.label}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#261409] via-[#3B2010]/45 to-transparent" />
            <div className="absolute inset-0 p-6 flex items-end justify-between">
              <div className="space-y-1.5">
                <h3 className="text-2xl font-serif italic text-[#FAF4EC] group-hover:text-[#E5C9A8] transition-colors">
                  {cat.label}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C9A8]" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#F5EAD8]">
                    Shop Collection
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.08, x: 4 }}
                className="w-11 h-11 rounded-full bg-[#FAF4EC] text-[#4A2B18] flex items-center justify-center shadow-lg transition-all"
              >
                <span className="text-lg font-bold">→</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Categories;

