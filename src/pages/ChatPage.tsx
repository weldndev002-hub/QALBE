import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { Send, ArrowLeft, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import TierGate from '../components/ui/TierGate';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore() as any;
  const { messages, isLoading, dailyCount, sendMessage, setLoading, clearSession } = useChatStore() as any;
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maxMessages = Infinity; // Dibuka semua untuk sementara
  const isLimitReached = dailyCount >= maxMessages;

  // Auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom() }, [messages, isLoading]);

  // Pesan sambutan awal jika kosong
  useEffect(() => {
    if (messages.length === 0) {
      sendMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Assalamu'alaikum, ${user?.name || 'Sobat'}. Aku Qalbie, teman curhatmu hari ini. Ada yang ingin kamu ceritakan atau rasakan saat ini? Jangan khawatir, obrolan ini aman dan rahasia.`,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLimitReached || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };
    
    sendMessage(userMsg);
    setInputText('');
    setLoading(true);

    // Update daily count (simulasi)
    useChatStore.setState((state: any) => ({ dailyCount: state.dailyCount + 1 }));

    // Simulasi respons AI yang penuh empati
    setTimeout(() => {
      const aiResponses = [
        "Aku mengerti perasaanmu. Tidak apa-apa merasa lelah, kamu sudah berusaha sangat keras.",
        "Terima kasih sudah berbagi denganku. Percayalah, setelah kesulitan pasti ada kemudahan (Q.S. Al-Insyirah).",
        "Wajar jika kamu merasa seperti itu. Coba ambil napas dalam-dalam. Apakah ada hal kecil yang bisa membuatmu merasa sedikit lebih baik hari ini?",
        "Subhanallah, kamu sangat kuat bisa melewati ini semua. Aku di sini siap mendengarkan apapun keluh kesahmu."
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      sendMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }, 1500 + Math.random() * 1000); // 1.5 - 2.5s delay
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 pb-20 font-sans">
      {/* App Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg text-neutral-900 leading-tight">Qalbie AI</h1>
            <div className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
              <Shield size={12} />
              <span>Aman & Rahasia</span>
            </div>
          </div>
        </div>
        
        {/* Limit Counter */}
        {maxMessages !== Infinity && (
          <div className="text-right">
            <div className="text-xs text-neutral-500 font-medium">Sisa Pesan</div>
            <div className={clsx("font-bold text-sm", isLimitReached ? "text-red-500" : "text-neutral-900")}>
              {maxMessages - dailyCount} <span className="text-neutral-400 font-normal">/ {maxMessages}</span>
            </div>
          </div>
        )}
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6 flex flex-col">
          
          <div className="text-center pb-4">
            <div className="inline-block bg-neutral-200/50 text-neutral-500 text-xs px-3 py-1 rounded-full">
              Percakapan dimulai hari ini
            </div>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg: any) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={clsx(
                  "flex max-w-[85%]",
                  msg.role === 'user' ? "self-end justify-end" : "self-start justify-start"
                )}
              >
                <div className={clsx(
                  "px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-primary-600 text-white rounded-br-sm" 
                    : "bg-white text-neutral-800 border border-neutral-100 rounded-bl-sm"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex self-start justify-start max-w-[85%]"
            >
              <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm border border-neutral-100 shadow-sm flex items-center gap-1.5">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-primary-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-primary-400 rounded-full" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-neutral-200 px-4 py-3 pb-8">
        <div className="max-w-3xl mx-auto">
          {isLimitReached ? (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
              <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
              <h3 className="text-red-800 font-bold mb-1">Batas Harian Tercapai</h3>
              <p className="text-red-600 text-sm mb-3">Kamu sudah mengirim 3 pesan hari ini. Yuk upgrade untuk cerita lebih banyak tanpa batas.</p>
              <button onClick={() => navigate('/upgrade')} className="bg-red-600 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-red-700 transition-colors">
                Upgrade ke Premium
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-neutral-100 rounded-3xl p-1.5 border border-neutral-200 focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/10 transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Ceritakan perasaanmu hari ini..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 min-h-[48px] max-h-[120px] text-[15px] outline-none"
                rows={1}
              />
              <button 
                type="submit" 
                disabled={!inputText.trim() || isLoading}
                className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white disabled:opacity-50 disabled:bg-neutral-300 disabled:text-neutral-500 transition-colors shadow-sm"
              >
                <Send size={20} className="ml-1" />
              </button>
            </form>
          )}
          <div className="text-center mt-3">
            <button onClick={clearSession} className="text-[11px] text-neutral-400 font-medium flex items-center justify-center gap-1 mx-auto hover:text-neutral-600 transition-colors">
              <CheckCircle2 size={12} />
              Akhiri & Simpan Sesi Curhat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
