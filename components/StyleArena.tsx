
import React, { useState } from 'react';

interface ArenaEntry {
  id: string;
  user: string;
  avatar: string;
  outfitImg: string;
}

const MOCK_ENTRIES: ArenaEntry[] = [
  { id: 'e1', user: 'Kojo_Step', avatar: '👤', outfitImg: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg' },
  { id: 'e2', user: 'Ama_Slide', avatar: '👤', outfitImg: '/uploads/bec/bec_studded_slides_1795581066443.jpg' },
  { id: 'e3', user: 'Kwame_Lux', avatar: '👤', outfitImg: '/uploads/bec/bec_designer_clogs_1795581067141.jpg' }
];

interface StyleArenaProps {
  onVote: (entryId: string, score: number) => void;
  onExit: () => void;
}

const StyleArena: React.FC<StyleArenaProps> = ({ onVote, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votesCount, setVotesCount] = useState(0);

  const handleVoteAction = (score: number) => {
    onVote(MOCK_ENTRIES[currentIndex].id, score);
    setVotesCount(prev => prev + 1);
    if (currentIndex < MOCK_ENTRIES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back for demo
    }
  };

  const entry = MOCK_ENTRIES[currentIndex];

  return (
    <div className="fixed inset-0 z-[80] bg-[#FAF4EC] flex flex-col animate-in fade-in duration-500">
      <header className="px-6 py-6 border-b border-[#EAD8C0] flex justify-between items-center">
        <div className="flex flex-col">
           <h2 className="text-xl font-serif italic text-[#261409]">B.E.C Style Arena</h2>
           <span className="text-[8px] font-black text-[#8C532B] uppercase tracking-widest">B.E.C Footwear Showcase</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-[#F5EAD8] px-4 py-2 rounded-xl text-[10px] font-black uppercase text-[#5A331C] border border-[#EAD8C0]">
              Votes Today: <span className="text-[#261409] font-bold">{votesCount}</span>
           </div>
           <button onClick={onExit} className="w-10 h-10 rounded-full bg-[#F5EAD8] border border-[#EAD8C0] text-[#4A2B18] flex items-center justify-center hover:bg-[#EAD8C0] transition-colors">✕</button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg relative aspect-[3/4] group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#4A2B18] to-[#8C532B] rounded-[3rem] blur opacity-15 group-hover:opacity-25 transition-opacity"></div>
          
          <div className="relative h-full w-full bg-[#FAF4EC] rounded-[3rem] border border-[#EAD8C0] overflow-hidden shadow-2xl">
            <img src={entry.outfitImg} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="B.E.C Footwear Showcase Entry" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#261409]/85 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-10 left-10 right-10 space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#261409]/80 flex items-center justify-center text-xl border border-[#E5C9A8]/30 text-[#FAF4EC] shadow-md">{entry.avatar}</div>
                  <div>
                    <div className="text-xl font-serif italic text-[#FAF4EC]">@{entry.user}</div>
                    <div className="text-[10px] font-black text-[#E5C9A8] uppercase tracking-widest">B.E.C Collector</div>
                  </div>
               </div>
            </div>

            {/* Voting Controls Overlay */}
            <div className="absolute inset-x-0 bottom-24 flex justify-center gap-12 px-10">
               <button 
                onClick={() => handleVoteAction(-1)}
                className="w-16 h-16 rounded-full bg-[#FAF4EC] border border-[#EAD8C0] flex items-center justify-center text-3xl shadow-2xl hover:bg-[#F5EAD8] transition-all active:scale-90"
               >
                 👎
               </button>
               <button 
                onClick={() => handleVoteAction(1)}
                className="w-16 h-16 rounded-full bg-[#4A2B18] text-[#FAF4EC] flex items-center justify-center text-3xl shadow-2xl hover:bg-[#3B2010] transition-all active:scale-90"
               >
                 🔥
               </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-[#5A331C] text-[10px] font-black uppercase tracking-[0.3em]">
         Swipe or tap to vote • Earn 20 points per session
      </footer>
    </div>
  );
};

export default StyleArena;
