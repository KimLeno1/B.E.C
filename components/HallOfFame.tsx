
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { databaseService } from '../services/databaseService';
import { Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const HallOfFame: React.FC = () => {
  const [rankedUsers, setRankedUsers] = useState<User[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setCardRef = (idx: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[idx] = el;
  };

  useEffect(() => {
    const fetchRankedUsers = async () => {
      setRankedUsers(await databaseService.getUsersRanked());
    };
    fetchRankedUsers();
  }, []);

  const shareRank = async (idx: number) => {
    const card = cardRefs.current[idx];
    if (card) {
      const canvas = await html2canvas(card);
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'rank.png', { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'My Rank at B.E.C Footwear',
          text: `Check out my rank at B.E.C Footwear: #${idx + 1}`
        });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'rank.png';
        link.click();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#261409] text-[#FAF4EC] pb-40 animate-in fade-in duration-1000">
      <header className="py-24 px-6 md:px-20 border-b border-[#E5C9A8]/15 bg-gradient-to-b from-[#3B2010]/60 to-transparent">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-[#E5C9A8] text-[8px] font-black text-[#261409] uppercase tracking-[0.5em]">
              Top_Collectors
            </div>
            <div className="h-px w-20 bg-[#E5C9A8]/30"></div>
          </div>
          <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-none">
            Hall of <span className="text-[#E5C9A8] not-italic font-sans">Fame</span>
          </h1>
          <p className="text-[#E5C9A8]/75 text-[10px] uppercase tracking-[0.4em] font-black max-w-md">
            Top collectors in the B.E.C Footwear community. Recognized for standout style and nationwide loyalty.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-20 py-20">
        <div className="grid gap-6">
          {rankedUsers.map((user, idx) => (
            <div 
              key={user.id}
              ref={setCardRef(idx)}
              className={`group relative flex items-center justify-between p-8 rounded-[2rem] border transition-all duration-500 ${
                idx === 0 ? 'bg-[#3B2010] border-[#E5C9A8]/50 scale-105 shadow-[0_0_50px_rgba(229,201,168,0.12)]' : 'bg-[#3B2010]/50 border-[#E5C9A8]/15 hover:border-[#E5C9A8]/40'
              }`}
            >
              <div className="flex items-center gap-10">
                <div className={`text-5xl font-serif italic transition-colors ${idx < 3 ? 'text-[#E5C9A8]' : 'text-[#8C532B] group-hover:text-[#E5C9A8]'}`}>
                  #{idx + 1}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border overflow-hidden ${
                    idx === 0 ? 'bg-[#E5C9A8] border-[#E5C9A8] text-[#261409]' : 'bg-[#4A2B18] border-[#E5C9A8]/20 text-[#FAF4EC]'
                  }`}>
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt={user.handle} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤'
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-black uppercase tracking-widest">{user.handle}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-black text-[#E5C9A8]/70 uppercase tracking-widest">{user.archetype}</span>
                      <div className="w-1 h-1 bg-[#8C532B] rounded-full"></div>
                      <span className="text-[9px] font-black text-[#E5C9A8] uppercase tracking-widest">Rank: {idx === 0 ? 'Legend' : 'Collector'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right space-y-1">
                  <div className="text-[10px] font-black text-[#E5C9A8]/60 uppercase tracking-widest">Reputation_Score</div>
                  <div className={`text-3xl font-mono ${idx === 0 ? 'text-[#E5C9A8]' : 'text-[#FAF4EC]'}`}>
                    {user.rep.toLocaleString()}
                  </div>
                </div>
                <button 
                  onClick={() => shareRank(idx)}
                  className="p-4 rounded-full bg-[#4A2B18] hover:bg-[#8C532B] text-[#E5C9A8] hover:text-[#FAF4EC] transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Decorative Elements */}
              {idx === 0 && (
                <div className="absolute -top-4 -right-4 bg-[#E5C9A8] text-[#261409] text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                  Current_Champion
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
