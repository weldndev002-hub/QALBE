import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, Send, Smile, PlayCircle, Star, TreePine, UserCircle2, MessageCircle, Home, AudioLines, Newspaper, User, BookOpenText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePWA } from '../hooks/usePWA';
import clsx from 'clsx';

export default function DashboardPage() {
  const { user } = useAuthStore() as any;
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWA();

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 font-sans">
      
      {/* --- Bagian Atas --- */}
      <div className="shrink-0 w-full relative bg-neutral-50">
        {/* Pink Background behind header and top half of card */}
        <div className="absolute top-0 left-0 right-0 bottom-10 bg-primary-100"></div>
        
        <div className="relative max-w-md md:max-w-lg mx-auto w-full z-10">
          {/* Top Bar - hide on desktop since Sidebar shows brand */}
          <header className="px-6 py-5 flex items-center justify-between md:hidden">
            <div className="flex-shrink-0">
              <img src="/LOGO%20SVG/QALBIE%20VERTIKAL%20PINK.svg" alt="Qalbie Logo" className="h-8" />
            </div>
            <div className="flex items-center gap-3 text-primary-700">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors">
                <Bell size={22} strokeWidth={2.5} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors">
                <Settings size={22} strokeWidth={2.5} />
              </button>
            </div>
          </header>

          {/* Desktop header */}
          <header className="hidden md:flex px-6 pt-8 pb-4 items-center justify-between">
            <h1 className="text-2xl font-bold text-[#681D5E]">Dashboard</h1>
            <div className="flex items-center gap-3 text-primary-700">
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors">
                <Bell size={22} strokeWidth={2.5} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors">
                <Settings size={22} strokeWidth={2.5} />
              </button>
            </div>
          </header>
          
          <div className="px-5 pb-2">
            {/* Main Card (Hai, Sarah) */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-[32px] p-5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)]">
              <div className="flex items-start gap-4 mb-5">
                {/* Avatar Placeholder */}
                <div className="w-16 h-16 rounded-full bg-[#7e3188] flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Sarah'}&backgroundColor=7e3188`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-1">Hai, {user?.name || 'Sarah'}!</h2>
                  <p className="text-sm text-neutral-800 leading-tight">
                    yuk cerita tentang hari ini,<br />
                    gimana keadaan mu?
                  </p>
                </div>
              </div>

              {/* Chat Input Pill */}
              <div className="bg-primary-100 border border-primary-400/30 rounded-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-primary-200 transition-colors" onClick={() => navigate('/chat')}>
                <span className="text-sm text-neutral-800 font-medium ml-2">Mulai obrolan...</span>
                <Send size={20} className="text-primary-700" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- Bagian Bawah Bisa di-Scroll (Scrollable) --- */}
      <main className="flex-1 overflow-y-auto hide-scrollbar w-full relative z-0">
        <div className="max-w-md md:max-w-lg mx-auto w-full flex flex-col min-h-full">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col flex-1">
            
            {/* Install PWA Banner */}
            {isInstallable && (
              <div className="px-5 pt-4">
                <motion.div 
                  variants={fadeUp} 
                  className="bg-gradient-to-r from-primary-600 to-[#7e3188] rounded-[24px] p-5 text-white shadow-md flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-sm leading-snug">Qalbie Lebih Praktis di Ponsel</h3>
                    <p className="text-[11px] text-primary-100 mt-1 leading-normal">
                      Install aplikasi Qalbie sekarang untuk akses instan langsung dari layar utama hp-mu.
                    </p>
                  </div>
                  <button 
                    onClick={installApp}
                    className="bg-white text-[#7e3188] hover:bg-neutral-50 px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-colors shadow-sm"
                  >
                    Install
                  </button>
                </motion.div>
              </div>
            )}

            {/* Mood Tracker Section (Wrapped in White Card) */}
            <div className="px-5 pt-4 pb-6">
              <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-[22px] font-bold text-[#681D5E]">Mood Tracker</h2>
                  <Link to="/mood" className="text-[11px] font-semibold text-[#681D5E] hover:underline">Selengkapnya&gt;</Link>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Keadaanmu Card */}
                  <div className="bg-primary-100 rounded-[24px] p-5 flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-sm text-neutral-900 leading-tight mb-4">Keadaanmu<br/>Hari ini</h3>
                    <div className="text-primary-700">
                      <Smile size={56} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Stress Meter Card */}
                  <div className="bg-primary-100 rounded-[24px] p-4 flex flex-col justify-between">
                    <div className="text-center">
                      <h3 className="font-bold text-sm text-neutral-900 mb-1">Stress Mater</h3>
                      <p className="text-[10px] text-neutral-800 leading-tight mb-3">Cek tingkat stress anda<br/>(Tes Singkat)</p>
                    </div>
                    
                    {/* 5 Color Bar */}
                    <div className="flex gap-1 w-full h-3 mb-4">
                      <div className="flex-1 bg-red-500 rounded-sm"></div>
                      <div className="flex-1 bg-orange-400 rounded-sm"></div>
                      <div className="flex-1 bg-yellow-400 rounded-sm"></div>
                      <div className="flex-1 bg-green-400 rounded-sm"></div>
                      <div className="flex-1 bg-emerald-600 rounded-sm"></div>
                    </div>

                    <Link to="/stress" className="w-full bg-[#7e3188] hover:bg-[#682870] text-white text-xs font-bold py-2.5 rounded-xl text-center transition-colors">
                      Cek Sekarang
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Audio Terapi Section (Pink Background) */}
            <div className="flex-1 bg-primary-100 rounded-t-[32px] px-5 pt-6 pb-12">
              <motion.div variants={fadeUp}>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-[22px] font-bold text-[#681D5E]">Audio Terapi</h2>
                  <Link to="/audio" className="text-[11px] font-semibold text-[#681D5E] hover:underline">Selengkapnya&gt;</Link>
                </div>

                {/* Removed negative margin so the items aren't too close to the screen edge */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar px-1">
                  {/* Dzikir */}
                  <div className="snap-start shrink-0 w-28 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-neutral-50">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white mb-3 shadow-inner">
                      <BookOpenText size={24} />
                    </div>
                    <span className="font-bold text-[13px] text-neutral-900">Dzikir</span>
                  </div>
                  
                  {/* Motivasi */}
                  <div className="snap-start shrink-0 w-28 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-sm border border-neutral-100">
                    <div className="w-12 h-12 text-primary-500 flex items-center justify-center mb-3">
                      <Star size={36} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-[13px] text-neutral-900">Motivasi</span>
                  </div>

                  {/* Suara Alam */}
                  <div className="snap-start shrink-0 w-28 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-sm border border-neutral-100">
                    <div className="w-12 h-12 text-primary-500 flex items-center justify-center mb-3">
                      <TreePine size={36} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-[13px] text-neutral-900 text-center leading-tight">Suara Alam</span>
                  </div>

                  {/* Reflection */}
                  <div className="snap-start shrink-0 w-28 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-sm border border-neutral-100">
                    <div className="w-12 h-12 text-primary-500 flex items-center justify-center mb-3">
                      <UserCircle2 size={36} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-[13px] text-neutral-900">Reflection</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Floating Action Button (FAB) Chat - only visible on mobile */}
      <div className="fixed bottom-[95px] right-6 z-40 md:hidden">
        <button 
          onClick={() => navigate('/chat')}
          className="w-[64px] h-[64px] bg-[#7e3188] hover:bg-[#682870] text-white flex items-center justify-center shadow-[0_8px_16px_rgba(126,49,136,0.4)] transition-transform hover:scale-105"
          style={{ borderRadius: '32px 32px 6px 32px' }}
        >
          <img src="/LOGO%20SVG/QALBIE%20ICON%20WHITE.svg" alt="Chat" className="w-8 h-8 object-contain" />
        </button>
      </div>


      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 12px);
        }
      `}</style>
    </div>
  );
}
