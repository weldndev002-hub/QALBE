import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Headphones, Activity, BookOpen, Quote, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';
import { useState } from 'react';

const emojis = [
  { label: 'Senang', emoji: '😊', color: 'bg-green-100 border-green-200 text-green-700' },
  { label: 'Biasa', emoji: '😐', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
  { label: 'Sedih', emoji: '😔', color: 'bg-blue-100 border-blue-200 text-blue-700' },
  { label: 'Marah', emoji: '😤', color: 'bg-red-100 border-red-200 text-red-700' },
  { label: 'Cemas', emoji: '😰', color: 'bg-purple-100 border-purple-200 text-purple-700' },
];

const shortcuts = [
  { title: 'Curhat AI', desc: 'Bicara tanpa dihakimi', icon: MessageCircle, link: '/chat', bg: 'bg-blue-50', text: 'text-blue-600' },
  { title: 'Audio Terapi', desc: 'Dzikir & Relaksasi', icon: Headphones, link: '/audio', bg: 'bg-primary-50', text: 'text-primary-600' },
  { title: 'Stress Meter', desc: 'Cek level stresmu', icon: Activity, link: '/stress', bg: 'bg-rose-50', text: 'text-rose-600' },
  { title: 'Artikel', desc: 'Wawasan psikologi islami', icon: BookOpen, link: '/artikel', bg: 'bg-secondary-50', text: 'text-secondary-600' },
];

export default function DashboardPage() {
  const { user } = useAuthStore() as any;
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto w-full min-h-screen px-4 pt-8 pb-10">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-6">
        
        {/* Header / Greeting */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium mb-1">Assalamu'alaikum,</p>
            <h1 className="text-2xl font-display font-bold text-neutral-900">{user?.name || 'Ukhti'}!</h1>
          </div>
          <Link to="/profil" className="w-12 h-12 bg-primary-100 text-primary-700 font-bold text-lg rounded-full flex items-center justify-center shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Link>
        </motion.div>

        {/* Daily Quote Card */}
        <motion.div variants={fadeUp} className="relative overflow-hidden bg-primary-600 rounded-3xl p-6 text-white shadow-lg shadow-primary-600/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Quote size={80} className="transform rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon />
              <span className="text-xs font-medium text-primary-100 tracking-wider uppercase">Inspirasi Hari Ini</span>
            </div>
            <p className="font-display text-xl leading-snug font-medium mb-3">
              "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya."
            </p>
            <p className="text-sm text-primary-200">Q.S. Al-Baqarah: 286</p>
          </div>
        </motion.div>

        {/* Mood Quick-Pick */}
        <motion.div variants={fadeUp} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Bagaimana perasaanmu?</h2>
            <Link to="/mood" className="text-xs text-primary-600 font-semibold hover:underline">Riwayat</Link>
          </div>
          <div className="flex justify-between gap-2">
            {emojis.map((mood) => (
              <button
                key={mood.label}
                onClick={() => setSelectedMood(mood.label)}
                className={clsx(
                  "flex flex-col items-center gap-2 transition-all p-2 rounded-2xl w-14",
                  selectedMood === mood.label 
                    ? `border-2 shadow-sm scale-110 ${mood.color}`
                    : "border-2 border-transparent hover:bg-neutral-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                )}
              >
                <span className="text-3xl filter drop-shadow-sm">{mood.emoji}</span>
              </button>
            ))}
          </div>
          {selectedMood && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 text-center">
               <p className="text-sm text-neutral-600 bg-neutral-50 py-2 rounded-xl border border-neutral-100">
                 Alhamdulillah. Tidak apa-apa merasa <strong className="text-neutral-900">{selectedMood}</strong> hari ini.
               </p>
             </motion.div>
          )}
        </motion.div>

        {/* Shortcuts / Fitur Utama */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Eksplorasi Qalbie</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => (
              <Link 
                key={shortcut.title} 
                to={shortcut.link}
                className={clsx(
                  "block p-5 rounded-3xl border border-neutral-100 shadow-sm transition-all hover:shadow-md group",
                  shortcut.bg
                )}
              >
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white shadow-sm", shortcut.text)}>
                  <shortcut.icon size={20} />
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">{shortcut.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{shortcut.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Upgrade Banner (Hanya terlihat jika user Free) */}
        {false && (
          <motion.div variants={fadeUp} className="mt-2 p-5 bg-gradient-to-r from-secondary-100 to-secondary-50 border border-secondary-200 rounded-3xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-secondary-900 text-sm mb-1">Upgrade ke Premium ✨</h3>
              <p className="text-xs text-secondary-700">Akses curhat AI tanpa batas & laporan emosi lengkap.</p>
            </div>
            <Link to="/upgrade" className="w-10 h-10 shrink-0 bg-secondary-600 text-white rounded-full flex items-center justify-center shadow-sm">
              <ChevronRight size={20} />
            </Link>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
