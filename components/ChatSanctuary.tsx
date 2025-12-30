
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../types';
import { knowledgeEngine } from '../geminiService';

declare global {
  interface Window {
    katex: any;
  }
}

interface ChatSanctuaryProps {
  lang: Language;
}

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const BlockCopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-indigo-400 transition-all border border-white/5 backdrop-blur-sm"
      title={`Copy ${label || 'Content'}`}
    >
      <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copied' : label || 'Copy'}</span>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-3 end-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-indigo-400 transition-all border border-white/5 opacity-0 group-hover/msg:opacity-100 backdrop-blur-sm z-10`}
      title="Copy Answer"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

const ChatSanctuary: React.FC<ChatSanctuaryProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMath = (tex: string, isBlock: boolean) => {
    try {
      if (window.katex) {
        const html = window.katex.renderToString(tex, {
          displayMode: isBlock,
          throwOnError: false
        });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <span>{tex}</span>;
    } catch (e) {
      console.error("Math rendering error", e);
      return <span>{tex}</span>;
    }
  };

  const highlightCode = (code: string) => {
    let html = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Syntax highlighting logic
    html = html.replace(/(["'`])(.*?)\1/g, '<span class="token-string">$1$2$1</span>');
    html = html.replace(/(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g, '<span class="token-comment">$1</span>');
    
    const keywords = /\b(const|let|var|function|return|if|else|for|while|import|from|export|class|extends|await|async|try|catch|def|elif|yield|with|as|lambda|type|int|float|str|bool|list|dict|set|print|break|continue|pass|None|True|False)\b/g;
    html = html.replace(keywords, '<span class="token-keyword">$1</span>');
    
    html = html.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
    html = html.replace(/\b([a-zA-Z_]\w*)(?=\s*\()/g, '<span class="token-function">$1</span>');
    html = html.replace(/(\+|-|\*|\/|%=|==|!=|&gt;=|&lt;=|&amp;&amp;|\|\||!|=)/g, '<span class="token-operator">$1</span>');

    return html;
  };

  const formatText = (text: string) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);
    
    return parts.map((part, pIdx) => {
      if (pIdx % 2 === 1) {
        const lines = part.trim().split('\n');
        const firstLine = lines[0].toLowerCase();
        const isLangTag = /^[a-z0-9#+]+$/.test(firstLine);
        const language = isLangTag ? firstLine : '';
        const codeContent = isLangTag ? lines.slice(1).join('\n') : part.trim();

        return (
          <div key={`code-${pIdx}`} className="code-sanctuary group/code" dir="ltr">
            <div className="code-header">
              <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{language || 'code'}</span>
              <BlockCopyButton text={codeContent} label="Copy" />
            </div>
            <div className="code-content">
              <pre className="whitespace-pre"><code dangerouslySetInnerHTML={{ __html: highlightCode(codeContent) }}></code></pre>
            </div>
          </div>
        );
      }

      const blockMathParts = part.split(/(\$\$.*?\$\$)/gs);
      
      return blockMathParts.map((blockPart, bIdx) => {
        if (blockPart.startsWith('$$') && blockPart.endsWith('$$')) {
          const tex = blockPart.slice(2, -2);
          return (
            <div key={`block-${pIdx}-${bIdx}`} className="relative group/math">
              <div className="absolute top-2 end-2 opacity-0 group-hover/math:opacity-100 transition-opacity z-10">
                <BlockCopyButton text={tex} label="LaTeX" />
              </div>
              <div className="katex-display">{renderMath(tex, true)}</div>
            </div>
          );
        }

        return blockPart.split('\n').map((line, i) => {
          if (!line.trim()) return <br key={`br-${pIdx}-${bIdx}-${i}`} />;
          
          const hasArabic = /[\u0600-\u06FF]/.test(line);

          if (line.trim().startsWith('###')) {
            return (
              <h3 
                key={`h3-${pIdx}-${bIdx}-${i}`} 
                dir="auto"
                className={`text-xl md:text-2xl font-black text-indigo-400 mt-8 mb-4 tracking-tighter border-b border-indigo-500/10 pb-2 ${hasArabic ? 'arabic-text' : ''}`}
              >
                {line.replace('###', '').trim()}
              </h3>
            );
          }
          
          const inlineMathParts = line.split(/(\$.*?\$)/g);
          
          return (
            <p 
              key={`p-${pIdx}-${bIdx}-${i}`} 
              dir="auto"
              className={`mb-4 text-[16px] leading-[1.7] text-slate-200 ${hasArabic ? 'arabic-text' : ''}`}
            >
              {inlineMathParts.map((mathPart, mIdx) => {
                if (mathPart.startsWith('$') && mathPart.endsWith('$')) {
                  const tex = mathPart.slice(1, -1);
                  return <React.Fragment key={mIdx}>{renderMath(tex, false)}</React.Fragment>;
                }

                const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g;
                const subParts = mathPart.split(boldItalicRegex);
                
                return subParts.map((sPart, index) => {
                  if (index % 2 === 1) {
                    return (
                      <span key={index} className="font-bold italic text-white bg-indigo-500/10 px-1 rounded-sm">
                        {sPart}
                      </span>
                    );
                  }
                  return sPart;
                });
              })}
            </p>
          );
        });
      });
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const userMsg: ChatMessage = { role: 'user', text: currentInput, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const modelMsgPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsgPlaceholder]);

      let fullResponse = '';
      const stream = knowledgeEngine.sendMessageStream(currentInput);
      
      for await (const chunk of stream) {
        if (chunk) {
          fullResponse += chunk;
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = { ...updated[updated.length - 1], text: fullResponse };
            }
            return updated;
          });
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: "Analysis stream interrupted." };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[700px] max-w-6xl mx-auto glass-card rounded-[40px] p-2 md:p-6 mb-20 font-sans shadow-2xl">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-10 py-10 px-6 md:px-12 no-scrollbar scroll-smooth mb-6 min-h-[500px]"
      >
        {messages.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-40 py-10 animate-enter" dir="auto">
            <div className="p-8 rounded-full bg-indigo-500/5 mb-6 border border-indigo-500/10 shadow-inner">
               <svg className="w-16 h-16 text-indigo-400/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.5em] text-indigo-400">
               {lang === Language.AR ? "بروتوكول التحليل جاهز" : "Analysis Protocol Ready"}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-enter`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-lg group-hover:scale-110 transition-transform ${
                msg.role === 'user' ? 'bg-indigo-600/20 border-indigo-500/20' : 'bg-slate-800/80 border-white/5'
              }`}>
                {msg.role === 'user' ? (
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <div className="w-3 h-3 bg-indigo-500 rounded-sm animate-pulse"></div>
                )}
              </div>
              <div className={`flex flex-col max-w-[95%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-3 px-1" dir="auto">
                  {msg.role === 'user' ? (lang === Language.EN ? 'Researcher' : 'الباحث') : (lang === Language.EN ? 'The Sanctuary' : 'المعرفة')}
                </div>
                <div 
                  className={`relative px-7 py-5 rounded-[28px] shadow-xl group/msg transition-all w-full ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600/10 text-white border border-indigo-500/20' 
                      : 'bg-white/5 text-slate-100 border border-white/5'
                  }`}
                  dir="auto"
                >
                  {msg.role === 'model' && msg.text && <CopyButton text={msg.text} />}
                  <div className="whitespace-pre-wrap">{formatText(msg.text)}</div>
                  {msg.role === 'model' && isLoading && i === messages.length - 1 && msg.text === '' && (
                    <div className="flex space-x-2 py-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="w-full pt-4 px-4 md:px-8 pb-8">
        <div className="relative max-w-5xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-[32px] blur opacity-10 group-focus-within:opacity-40 transition duration-700"></div>
          <div className="relative flex items-end bg-[#0a0f1d] border border-white/5 rounded-[28px] shadow-3xl transition-all focus-within:border-indigo-500/40 group-hover:border-white/10 overflow-hidden pr-2">
            <textarea
              rows={1}
              value={input}
              dir="auto"
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={lang === Language.EN ? "Direct inquiry to the source..." : "وجه استفساراً مباشراً للمصدر..."}
              className="flex-1 bg-transparent py-5 px-8 text-white placeholder-white/20 focus:outline-none text-[16px] font-medium resize-none"
              style={{ overflow: 'hidden' }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="mb-2 p-4 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-2xl transition-all disabled:opacity-5 disabled:grayscale shrink-0"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 4L20 20L12 16L4 20L12 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
            <span>Cognitive Mirroring Active</span>
            <div className="w-1.5 h-1.5 bg-indigo-500/20 rounded-full"></div>
            <span>Knowledge AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSanctuary;
