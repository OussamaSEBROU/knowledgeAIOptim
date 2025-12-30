
import React, { useState, useCallback, useEffect } from 'react';
import { Axiom, PDFData, ViewState, Language } from './types';
import { knowledgeEngine } from './geminiService';
import AxiomCard from './components/AxiomCard';
import ChatSanctuary from './components/ChatSanctuary';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [pdf, setPdf] = useState<PDFData | null>(null);
  const [axioms, setAxioms] = useState<Axiom[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('main');
  const [lang, setLang] = useState<Language>(Language.EN);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const resetSession = useCallback(() => {
    setPdf(null);
    setAxioms([]);
    setIsSynthesizing(false);
    setError(null);
    setView('main');
  }, []);

  useEffect(() => {
    if (pdf) {
      const updateAxioms = async () => {
        setIsSynthesizing(true);
        try {
          await knowledgeEngine.startChatSession(pdf, lang);
          const result = await knowledgeEngine.synthesizeAxioms(pdf, lang);
          setAxioms(result);
        } catch (err) {
          console.error("Language switch synthesis failed", err);
        } finally {
          setIsSynthesizing(false);
        }
      };
      updateAxioms();
    }
  }, [lang]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError("Please upload a valid PDF document.");
      return;
    }

    setIsSynthesizing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const blob = new Blob([new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)))], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      const pdfData: PDFData = {
        name: file.name,
        base64: base64,
        mimeType: file.type,
        blobUrl: blobUrl
      };

      setPdf(pdfData);

      try {
        await knowledgeEngine.startChatSession(pdfData, lang);
        const result = await knowledgeEngine.synthesizeAxioms(pdfData, lang);
        setAxioms(result);
      } catch (err) {
        console.error(err);
        setError("The synthesis process encountered an error. Please try again.");
      } finally {
        setIsSynthesizing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [lang]);

  const renderContent = () => {
    if (view === 'pdf' && pdf?.blobUrl) {
      return (
        <div className="w-full h-[85vh] glass-card rounded-[40px] overflow-hidden border-white/5 shadow-2xl animate-enter">
          <iframe src={pdf.blobUrl} className="w-full h-full" title="PDF Viewer" />
        </div>
      );
    }

    if (view === 'about') {
      return (
        <div className="max-w-3xl glass-card p-12 rounded-[40px] space-y-6 animate-enter mx-auto">
          <h2 className="text-3xl font-black text-white italic tracking-tighter">About the Research Sanctuary</h2>
          <p className="leading-relaxed text-slate-300 text-lg font-medium">
            Knowledge AI is an elite research terminal engineered for structural extraction of axiomatic wisdom.
            It utilizes a sophisticated large language model developed and trained by the Knowledge AI team using Deep Learning technology to parse manuscripts and synthesize their intellectual core.
          </p>
          <div className="pt-6 border-t border-white/5 text-[10px] font-mono text-white/20 tracking-[0.5em]">
            OPERATIONAL BUILD 2025.02 // BY OUSSAMA SEBROU
          </div>
        </div>
      );
    }

    if (view === 'help') {
      return (
        <div className="max-w-3xl glass-card p-12 rounded-[40px] space-y-8 animate-enter mx-auto">
          <h2 className="text-3xl font-black text-white italic tracking-tighter">Protocol & Support</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-indigo-400 mb-2 uppercase tracking-wide">Synthesized Truths</h3>
              <p className="text-slate-400 leading-relaxed text-sm">Upload a document to receive exactly six core conceptual pillars. Flip cards to reveal profound definitions.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-indigo-400 mb-2 uppercase tracking-wide">The Interrogation Terminal</h3>
              <p className="text-slate-400 leading-relaxed text-sm">Use the chat sanctuary below to engage in deep dialogue with the document's inherent logic.</p>
            </div>
          </div>
        </div>
      );
    }

    if (!pdf) {
      return (
        <div className="w-full max-w-2xl text-center mx-auto mt-12 animate-enter">
          <div className="glass-card p-16 rounded-[64px] border-dashed border-2 border-indigo-500/20 hover:border-indigo-500/40 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <label className="cursor-pointer relative z-10 block">
              <div className="mb-10 flex justify-center">
                <div className="p-8 bg-indigo-600/10 rounded-full group-hover:scale-110 transition-transform duration-700 shadow-3xl border border-white/5">
                  <svg className="w-16 h-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-black mb-4 text-white tracking-tighter">Initiate Wisdom Extraction</h2>
              <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed text-base font-medium italic">Upload your manuscript to begin the deep analysis protocol.</p>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} />
              <div className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black transition-all inline-block blue-glow text-lg tracking-tighter uppercase">
                Browse Files
              </div>
            </label>
          </div>
          {error && <p className="mt-8 text-red-400 font-bold px-6 py-3 bg-red-400/10 rounded-2xl inline-block border border-red-400/20 text-sm">{error}</p>}
        </div>
      );
    }

    if (isSynthesizing) {
      return (
        <div className="flex flex-col items-center justify-center space-y-10 py-32 mx-auto animate-enter">
          <div className="relative">
            <div className="w-24 h-24 border-[3px] border-indigo-500/10 border-t-indigo-500 border-solid rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-white mb-2 italic tracking-tighter uppercase">Deconstructing Stylometry...</h3>
            <p className="text-white/20 italic tracking-[0.6em] text-[10px] uppercase font-bold">Structural Semantic Integration</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-24 pb-32 animate-enter">
        <section className="text-left w-full max-w-6xl mx-auto">
          <div className="border-l-[6px] border-indigo-600 pl-8 mb-16">
            <h2 className={`text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter ${lang === Language.AR ? 'arabic-text' : ''}`}>
              {lang === Language.EN ? 'Conceptual Axioms' : 'المسلّمات المعرفية'}
            </h2>
            <p className={`text-slate-500 italic text-xl font-medium ${lang === Language.AR ? 'arabic-text' : ''}`}>
              {lang === Language.EN 
                ? `Extracted Wisdom: ${pdf.name}` 
                : `الحكمة المستخلصة: ${pdf.name}`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12" dir={lang === Language.AR ? 'rtl' : 'ltr'}>
            {axioms.map((axiom, idx) => (
              <AxiomCard key={`${idx}-${lang}`} axiom={axiom} index={idx} />
            ))}
          </div>
        </section>

        <section className="w-full max-w-6xl mx-auto pt-24 border-t border-white/5 relative">
           <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-white/5 font-black text-6xl md:text-7xl uppercase tracking-[0.3em] pointer-events-none select-none">INTERROGATE</div>
           <ChatSanctuary key={`chat-${lang}`} lang={lang} />
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#060a14] flex overflow-hidden">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        lang={lang} 
        setLang={setLang} 
        hasPdf={!!pdf}
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewSession={resetSession}
      />

      <main 
        className={`flex-1 min-h-screen relative flex flex-col items-center pt-16 pb-4 px-6 md:px-12 w-full overflow-y-auto overflow-x-hidden transition-all duration-700 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}
      >
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-8 left-8 z-[110] p-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-2xl transition-all border border-indigo-500/20 backdrop-blur-3xl group shadow-2xl"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        )}

        <div className="fixed top-[-40%] left-[-20%] w-[120%] h-[120%] bg-indigo-600/5 blur-[250px] rounded-full pointer-events-none -z-10"></div>
        <div className="fixed bottom-[-40%] right-[-20%] w-[120%] h-[120%] bg-blue-600/5 blur-[250px] rounded-full pointer-events-none -z-10"></div>

        <header className="text-center mb-16 w-full relative max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-[10px] md:text-[12px] font-black text-indigo-400/50 uppercase tracking-[0.8em] mb-4 animate-pulse">
            ELITE RESEARCH TERMINAL
          </div>
          <h1 className="text-4xl md:text-7xl hero-title italic mb-4 select-none leading-[0.9] pb-2">
            KNOWLEDGE AI
          </h1>
          <div className={`text-sm md:text-base text-white/40 tracking-widest font-bold uppercase flex flex-col items-center gap-1 ${lang === Language.AR ? 'arabic-text' : ''}`}>
             <span className="text-[10px] opacity-60">An Extension of the 5minute Paper Project</span>
          </div>
          
          {(!pdf || isSynthesizing) && (
            <div className="mt-12 glass-card p-6 rounded-[32px] border-indigo-500/20 max-w-2xl bg-indigo-500/5 border animate-enter">
              <p className={`text-xs md:text-sm text-indigo-200/70 italic leading-relaxed ${lang === Language.AR ? 'arabic-text' : ''}`}>
                {lang === Language.AR 
                  ? "تنبيه: يجب قراءة الملف وفهمه جيداً قبل استخدام هذه الأداة. هذه المنصة لا تعوض بأي حال عن القراءة المباشرة، وإنما تعمل على تنظيم الأفكار، تسهيل الوصول للمحتوى، وتوليد عصف ذهني معرفي حول بنية النص."
                  : "Disclaimer: The document must be read and understood thoroughly before using this tool. This platform does not replace direct reading; it is designed to organize thoughts, facilitate content access, and provide intellectual brainstorming based on the text's inherent structure."}
              </p>
            </div>
          )}
        </header>

        <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
          {renderContent()}
        </div>

        <footer className="mt-24 py-16 w-full text-center border-t border-white/5 bg-[#060a14]/90 backdrop-blur-3xl shrink-0">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-[11px] font-black text-indigo-400/30 uppercase tracking-[0.7em] hover:text-indigo-400 transition-colors cursor-default">
              Developed by <span className="text-white font-black">Oussama SEBROU</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
