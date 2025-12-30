import React from 'react';
import { ViewState, Language } from './types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  hasPdf: boolean;
  isOpen: boolean;
  toggle: () => void;
  onNewSession: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, lang, setLang, hasPdf, isOpen, toggle, onNewSession }) => {
  const NavItem = ({ view, label, icon, disabled = false }: { view: ViewState, label: string, icon: React.ReactNode, disabled?: boolean }) => (
    <button
      onClick={() => !disabled && setView(view)}
      disabled={disabled}
      className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
          : 'text-white/40 hover:text-white hover:bg-white/5'
      } ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
    >
      <div className={`${currentView === view ? 'text-white' : 'text-indigo-400/70'}`}>{icon}</div>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );

  return (
    <aside 
      className={`w-64 h-screen fixed left-0 top-0 glass-card border-r border-white/5 flex flex-col z-50 bg-[#060a14]/95 backdrop-blur-2xl transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <button 
        onClick={toggle}
        className="absolute -right-12 top-8 p-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-r-xl border border-l-0 border-white/5 backdrop-blur-xl group transition-all"
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="p-8">
        <div className="flex items-center space-x-4 mb-10 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-2xl blue-glow group-hover:scale-110 transition-transform">K</div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">Knowledge</span>
        </div>

        <button
          onClick={onNewSession}
          className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl mb-8 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all group"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-black tracking-tight uppercase">New Session</span>
        </button>

        <nav className="space-y-3">
          <NavItem 
            view="main" 
            label="Research Home" 
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
          />
          <NavItem 
            view="pdf" 
            label="Full Manuscript" 
            disabled={!hasPdf}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
          />
          <div className="pt-10 pb-4 px-5 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Resources</div>
          <NavItem 
            view="about" 
            label="About Terminal" 
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
          />
          <NavItem 
            view="help" 
            label="Help & FAQ" 
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
          />
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5 space-y-6">
        <div>
          <div className="mb-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Research Language</div>
          <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setLang(Language.EN)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${lang === Language.EN ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang(Language.AR)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${lang === Language.AR ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
            >
              AR
            </button>
          </div>
        </div>
        
        <div className="text-[9px] font-medium text-white/20 text-center leading-relaxed italic border-t border-white/5 pt-4 px-2">
          {lang === Language.EN 
            ? "Technology developed and trained by Knowledge AI team as a Large Language Model using Deep Learning."
            : "تقنية مطورة ومدربة من فريق Knowledge AI كنموذج لغوي ضخم بتقنية الDeep Learning"}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
