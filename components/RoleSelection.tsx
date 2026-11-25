import React from 'react';
import { ViewState } from '../types';

interface RoleSelectionProps {
  onSelect: (role: 'ADMIN' | 'SUPPLIER' | 'MARKETING') => void;
  onCancel: () => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-black text-white font-mono flex items-center justify-center p-6 overflow-y-auto">
      {/* Background Matrix/Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      ></div>

      <div className="w-full max-w-5xl space-y-10 relative z-10 animate-in fade-in zoom-in-95 duration-700 text-center my-auto py-8">
        <div className="space-y-3">
          <div className="inline-block px-6 py-2 border border-[#3b82f6]/30 rounded-full bg-black/50 backdrop-blur-md mb-2">
            <span className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.4em]">Organization Hub</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.25em] italic">Staff Portals</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black">Select authorized terminal to proceed</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Administrator Card */}
          <button 
            onClick={() => onSelect('ADMIN')}
            className="group relative bg-zinc-950 border border-white/5 p-8 sm:p-10 rounded-[3rem] hover:border-[#00ff41]/50 transition-all duration-500 text-left overflow-hidden shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[12rem] font-black group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none text-[#00ff41]">A</div>
            <div className="relative z-10 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#00ff41]/10 flex items-center justify-center text-3xl border border-[#00ff41]/20 group-hover:bg-[#00ff41]/20 transition-all">🧠</div>
              <div>
                <h3 className="text-2xl font-serif italic text-white group-hover:text-[#00ff41] transition-colors">Administrator</h3>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-2 font-black leading-relaxed">System Master & Store Governance</p>
              </div>
            </div>
            <div className="relative z-10 text-[8px] text-zinc-600 uppercase tracking-widest pt-6 border-t border-white/5 mt-4">Access: Master Admin</div>
          </button>

          {/* Marketing Team Card */}
          <button 
            onClick={() => onSelect('MARKETING')}
            className="group relative bg-zinc-950 border border-white/5 p-8 sm:p-10 rounded-[3rem] hover:border-[#3b82f6]/50 transition-all duration-500 text-left overflow-hidden shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[12rem] font-black group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none text-[#3b82f6]">M</div>
            <div className="relative z-10 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#3b82f6]/10 flex items-center justify-center text-3xl border border-[#3b82f6]/20 group-hover:bg-[#3b82f6]/20 transition-all">📢</div>
              <div>
                <h3 className="text-2xl font-serif italic text-white group-hover:text-[#3b82f6] transition-colors">Marketing Team</h3>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-2 font-black leading-relaxed">Drops, Campaigns & Ad Studio</p>
              </div>
            </div>
            <div className="relative z-10 text-[8px] text-zinc-600 uppercase tracking-widest pt-6 border-t border-white/5 mt-4">Controlled by: Admin</div>
          </button>

          {/* Supplier Portal Card */}
          <button 
            onClick={() => onSelect('SUPPLIER')}
            className="group relative bg-zinc-950 border border-white/5 p-8 sm:p-10 rounded-[3rem] hover:border-[#f59e0b]/50 transition-all duration-500 text-left overflow-hidden shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[12rem] font-black group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none text-[#f59e0b]">S</div>
            <div className="relative z-10 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#f59e0b]/10 flex items-center justify-center text-3xl border border-[#f59e0b]/20 group-hover:bg-[#f59e0b]/20 transition-all">🏭</div>
              <div>
                <h3 className="text-2xl font-serif italic text-white group-hover:text-[#f59e0b] transition-colors">Supplier Portal</h3>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-2 font-black leading-relaxed">Inventory & Supply Ingestion</p>
              </div>
            </div>
            <div className="relative z-10 text-[8px] text-zinc-600 uppercase tracking-widest pt-6 border-t border-white/5 mt-4">Access: Verified Supplier</div>
          </button>
        </div>

        <button 
          onClick={onCancel}
          className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-[0.4em] font-black pt-6 transition-colors"
        >
          ← Disconnect From Terminal
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
