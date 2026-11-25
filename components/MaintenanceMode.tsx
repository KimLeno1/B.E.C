import React from 'react';
import { motion } from 'motion/react';
import { Shield, Hammer, Clock, Lock } from 'lucide-react';

interface MaintenanceModeProps {
  onAdminAccess?: () => void;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ onAdminAccess }) => {
  const [clickCount, setClickCount] = React.useState(0);

  const handleShieldClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 15) {
      onAdminAccess?.();
      setClickCount(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#1E0F06] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8C532B]/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-2xl w-full text-center space-y-10">
        {/* Icon Cluster */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative inline-block"
        >
          <div className="w-28 h-28 bg-[#4A2B18] border border-[#E5C9A8]/30 rounded-[2.2rem] flex items-center justify-center relative z-10 shadow-2xl">
            <Hammer className="w-11 h-11 text-[#E5C9A8] animate-bounce" />
          </div>
          <div
            onClick={handleShieldClick}
            className="absolute -top-3 -right-3 w-11 h-11 bg-[#261409] border border-[#E5C9A8]/30 rounded-2xl flex items-center justify-center z-20 shadow-xl cursor-pointer active:scale-95 transition-transform"
          >
            <Shield className="w-5 h-5 text-[#E5C9A8]" />
          </div>
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.08, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute inset-0 border border-[#E5C9A8]/25 rounded-[2.8rem] -m-4"
          />
        </motion.div>

        {/* Messaging */}
        <div className="space-y-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl md:text-6xl font-serif italic text-[#FAF4EC] tracking-tight"
          >
            Store Refresh in Progress
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="space-y-3"
          >
            <p className="text-xs font-bold text-[#E5C9A8]/80 uppercase tracking-[0.25em] max-w-md mx-auto leading-relaxed">
              B.E.C Footwear is restocking fresh clogs, slides, sandals &amp; slippers. Call or WhatsApp 0244122075 or
              0260584440 to place an order right away.
            </p>
          </motion.div>
        </div>

        {/* Status Pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { label: 'Storefront', value: 'UPDATING', icon: <Lock className="w-3.5 h-3.5" /> },
            { label: 'WhatsApp Desk', value: '0244122075', icon: <Clock className="w-3.5 h-3.5" /> },
            { label: 'Delivery', value: 'NATIONWIDE', icon: <Shield className="w-3.5 h-3.5" /> },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#261409] border border-[#E5C9A8]/20 px-5 py-3 rounded-2xl flex items-center gap-2.5"
            >
              <span className="text-[#E5C9A8]">{item.icon}</span>
              <span className="text-[9px] font-black text-[#E5C9A8]/70 uppercase tracking-widest">{item.label}:</span>
              <span className="text-[9px] font-black text-[#FAF4EC] uppercase tracking-widest tabular-nums">
                {item.value}
              </span>
            </div>
          ))}
        </motion.div>

        <div className="pt-8 border-t border-[#E5C9A8]/15">
          <div className="text-[10px] font-black text-[#E5C9A8]/60 uppercase tracking-[0.45em]">
            B.E.C Footwear • Nationwide Delivery
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
