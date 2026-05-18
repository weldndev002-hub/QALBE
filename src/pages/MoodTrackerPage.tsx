import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store/authStore';
import { useMoodStore } from '../store/moodStore';
import { Lock, Calendar, Plus, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const EMOJIS = [
  { label: 'Senang', emoji: '😊', color: 'bg-green-100 border-green-200 text-green-700', value: 9 },
  { label: 'Biasa', emoji: '😐', color: 'bg-yellow-100 border-yellow-200 text-yellow-700', value: 6 },
  { label: 'Sedih', emoji: '😔', color: 'bg-blue-100 border-blue-200 text-blue-700', value: 3 },
  { label: 'Marah', emoji: '😤', color: 'bg-red-100 border-red-200 text-red-700', value: 2 },
  { label: 'Cemas', emoji: '😰', color: 'bg-purple-100 border-purple-200 text-purple-700', value: 4 },
];

const MOCK_CHART_DATA = [
  { date: 'Sen', score: 4, mood: 'Cemas' },
  { date: 'Sel', score: 6, mood: 'Biasa' },
  { date: 'Rab', score: 3, mood: 'Sedih' },
  { date: 'Kam', score: 5, mood: 'Biasa' },
  { date: 'Jum', score: 8, mood: 'Senang' },
  { date: 'Sab', score: 9, mood: 'Senang' },
  { date: 'Min', score: 9, mood: 'Senang' },
];

export default function MoodTrackerPage() {
  const { user } = useAuthStore() as any;
  const { todayMood, history, submitMood } = useMoodStore() as any;
  const [activeTab, setActiveTab] = useState<'input' | 'history'>('input');
  
  // Form State
  const [selectedEmoji, setSelectedEmoji] = useState<any>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [note, setNote] = useState('');

  const isFreeTier = false; // Dibuka semua untuk sementara

  const handleSave = () => {
    if (!selectedEmoji) return;
    
    const newMood = {
      id: Date.now(),
      emoji: selectedEmoji.emoji,
      label: selectedEmoji.label,
      intensity: isFreeTier ? selectedEmoji.value : intensity,
      note,
      date: new Date().toISOString()
    };
    
    submitMood(newMood);
    setActiveTab('history');
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-neutral-100">
          <p className="font-bold text-neutral-900 mb-1">{label}</p>
          <p className="text-primary-600 text-sm font-medium">
            Skor: {payload[0].value}/10
          </p>
          <p className="text-neutral-500 text-xs mt-1">
            Mood: {payload[0].payload.mood}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 pb-[80px] font-sans">
      {/* Header */}
      <header className="bg-white px-4 py-6 border-b border-neutral-100 sticky top-0 z-40">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-4">Mood Tracker</h1>
        
        {/* Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-full">
          <button
            onClick={() => setActiveTab('input')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2",
              activeTab === 'input' ? "bg-white text-primary-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <Plus size={16} /> Input Baru
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2",
              activeTab === 'history' ? "bg-white text-primary-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <Calendar size={16} /> Riwayat
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md md:max-w-3xl mx-auto w-full overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'input' ? (
            <motion.div key="input" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp} className="space-y-6">
              
              {todayMood && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm flex items-center justify-between">
                  <span>Kamu sudah mengisi jurnal hari ini!</span>
                  <span>{todayMood.emoji}</span>
                </div>
              )}

              {/* Step 1: Emoji Picker */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
                <h2 className="font-bold text-neutral-900 mb-1">1. Bagaimana perasaanmu?</h2>
                <p className="text-sm text-neutral-500 mb-4">Pilih emosi yang paling menggambarkan kondisimu saat ini.</p>
                <div className="flex justify-between gap-2">
                  {EMOJIS.map((mood) => (
                    <button
                      key={mood.label}
                      onClick={() => {
                        setSelectedEmoji(mood);
                        if(isFreeTier) setIntensity(mood.value); // set default intensity for free tier
                      }}
                      className={clsx(
                        "flex flex-col items-center gap-2 transition-all p-2 rounded-2xl w-14",
                        selectedEmoji?.label === mood.label 
                          ? `border-2 shadow-sm scale-110 ${mood.color}`
                          : "border-2 border-transparent hover:bg-neutral-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                      )}
                    >
                      <span className="text-3xl filter drop-shadow-sm">{mood.emoji}</span>
                      <span className="text-[10px] font-bold">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Intensity Slider (Locked for Free) */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden">
                {isFreeTier && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="text-secondary-500 mb-2" size={24} />
                    <p className="text-sm font-bold text-neutral-900">Skala Intensitas Terkunci</p>
                    <p className="text-xs text-neutral-600 mb-3">Tingkatkan ke Basic/Premium untuk melacak skala emosi 1-10.</p>
                    <Link to="/upgrade" className="bg-secondary-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                      Upgrade Sekarang
                    </Link>
                  </div>
                )}
                
                <h2 className="font-bold text-neutral-900 mb-1">2. Seberapa kuat emosi tersebut?</h2>
                <div className="flex justify-between text-xs font-bold text-neutral-400 mb-2 mt-4">
                  <span>Ringan (1)</span>
                  <span className="text-primary-600 text-lg">{intensity}</span>
                  <span>Sangat Kuat (10)</span>
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={intensity} 
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  disabled={isFreeTier}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
              </div>

              {/* Step 3: Note */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
                <h2 className="font-bold text-neutral-900 mb-1">3. Jurnal Singkat (Opsional)</h2>
                <p className="text-sm text-neutral-500 mb-4">Apa yang memicu perasaan tersebut?</p>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Hari ini aku merasa..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-sm focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none resize-none h-24"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={!selectedEmoji}
                className="w-full bg-primary-600 text-white font-bold py-4 rounded-full disabled:opacity-50 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
              >
                Simpan Jurnal Hari Ini
              </button>
            </motion.div>
          ) : (
            <motion.div key="history" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp} className="space-y-6">
              
              {/* Premium Chart Section */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden">
                {isFreeTier && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
                    <Lock className="text-primary-600 mb-2" size={32} />
                    <h3 className="font-bold text-neutral-900 mb-1">Grafik Mood Terkunci</h3>
                    <p className="text-sm text-neutral-600 mb-4">Lihat fluktuasi emosimu selama 7-30 hari terakhir dengan berlangganan Basic/Premium.</p>
                    <Link to="/upgrade" className="bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-sm">
                      Buka Fitur Grafik
                    </Link>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-neutral-900">Grafik 7 Hari Terakhir</h2>
                </div>
                
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} dy={10} />
                      <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#16a34a" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#16a34a', stroke: '#dcfce7', strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                <h2 className="font-bold text-neutral-900 px-1">Riwayat Jurnal</h2>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-sm">
                    Belum ada jurnal yang tersimpan.
                  </div>
                ) : (
                  history.map((entry: any) => (
                    <div key={entry.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-4">
                      <div className="text-4xl">{entry.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-neutral-900">{entry.label} <span className="text-neutral-400 font-normal text-xs ml-1">• Skor {entry.intensity}</span></h3>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        {entry.note ? (
                          <p className="text-sm text-neutral-600 line-clamp-2">{entry.note}</p>
                        ) : (
                          <p className="text-xs text-neutral-400 italic">Tidak ada catatan.</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
