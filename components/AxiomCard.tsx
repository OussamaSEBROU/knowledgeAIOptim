
import React from 'react';
import { Axiom } from '../types';

interface AxiomCardProps {
  axiom: Axiom;
  index: number;
}

const AxiomCard: React.FC<AxiomCardProps> = ({ axiom, index }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  // Detect if content contains Arabic for specific font styling
  const hasArabic = /[\u0600-\u06FF]/.test(axiom.title + axiom.definition);

  return (
    <div 
      className="group perspective-2000 w-full h-80 md:h-96 cursor-pointer font-sans"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-1000 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front - Structured Axiom Title */}
        <div 
          className="absolute inset-0 backface-hidden glass-card p-6 md:p-10 flex flex-col items-center text-center rounded-[48px] border-white/5 border bg-[#0d1425]/40 hover:bg-[#111a31]/60 transition-all shadow-2xl overflow-hidden"
        >
          <div className="text-indigo-400 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] mb-6 md:mb-10 opacity-50 group-hover:opacity-100 transition-opacity shrink-0">
            AXIOM {String(index + 1).padStart(2, '0')}
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden px-2">
            <h3 
              dir="auto"
              className={`text-xl md:text-2xl lg:text-3xl font-black text-white leading-[1.2] tracking-tighter break-words max-h-full overflow-hidden text-ellipsis italic ${hasArabic ? 'arabic-text' : ''}`}
            >
              {axiom.title}
            </h3>
          </div>

          <div className="mt-auto pt-8 flex space-x-3 opacity-20 group-hover:opacity-60 transition-all shrink-0">
            <div className="w-5 h-1.5 bg-indigo-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <div className="w-5 h-1.5 bg-indigo-500 rounded-full"></div>
          </div>
        </div>

        {/* Back - Scholarly Axiomatic Definition */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 glass-card p-6 md:p-10 flex flex-col rounded-[48px] border-indigo-500/20 border bg-[#0d1425] shadow-inner overflow-hidden"
        >
          <div className="flex-1 w-full flex items-center justify-center overflow-y-auto no-scrollbar py-4 px-2">
            <p 
              dir="auto"
              className={`text-sm md:text-lg text-indigo-100 italic font-medium leading-relaxed tracking-tight text-center ${hasArabic ? 'arabic-text' : ''}`}
            >
              "{axiom.definition}"
            </p>
          </div>
          
          <div className="mt-4 pt-6 border-t border-white/5 w-full text-center shrink-0">
             <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Verified Conceptual Pillar</div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default AxiomCard;
