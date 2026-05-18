import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Activity, CheckCircle2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const QUESTIONS = [
  { id: 1, text: 'Dalam sebulan terakhir, seberapa sering kamu merasa kesal karena hal yang tak terduga?' },
  { id: 2, text: 'Seberapa sering kamu merasa tidak mampu mengendalikan hal penting dalam hidupmu?' },
  { id: 3, text: 'Seberapa sering kamu merasa gugup dan penuh tekanan (stres)?' },
  { id: 4, text: 'Seberapa sering kamu merasa yakin terhadap kemampuanmu menangani masalah pribadi?' },
  { id: 5, text: 'Seberapa sering kamu merasa marah karena hal-hal di luar kendalimu?' },
];

const OPTIONS = [
  { label: 'Tidak Pernah', value: 0 },
  { label: 'Jarang', value: 1 },
  { label: 'Kadang-kadang', value: 2 },
  { label: 'Sering', value: 3 },
  { label: 'Sangat Sering', value: 4 },
];

export default function StressMeterPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelectOption = (value: number) => {
    const newAnswers = { ...answers, [currentIdx]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(c => c + 1);
      } else {
        setShowResult(true);
      }
    }, 400); // Jeda sebentar agar efek klik terlihat
  };

  const calculateScore = () => {
    // Total skor maks: 5 pertanyaan x 4 poin = 20 poin. Dikonversi ke skala 100.
    const rawScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const percentage = Math.round((rawScore / (QUESTIONS.length * 4)) * 100);
    return percentage;
  };

  const getResultCategory = (score: number) => {
    if (score < 30) return { category: 'Rendah', color: 'text-green-500', bg: 'bg-green-50', desc: 'Alhamdulillah, kondisi mentalmu cukup stabil saat ini. Tetap jaga keseimbangan dan ibadahmu.' };
    if (score < 70) return { category: 'Sedang', color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Kamu sedang mengalami sedikit tekanan. Jangan lupa beri waktu untuk istirahat dan tarik napas panjang.' };
    return { category: 'Tinggi', color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Tingkat stresmu sedang tinggi. Ingatlah bahwa Allah selalu bersamamu. Disarankan untuk mendengarkan audio terapi atau curhat.' };
  };

  const fadeVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 pb-20 font-sans">
      <header className="bg-white px-4 py-4 sticky top-0 z-40 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg text-neutral-900">Stress Meter</h1>
        </div>
      </header>

      <main className="flex-1 max-w-md md:max-w-2xl mx-auto w-full p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key="quiz" initial="initial" animate="animate" exit="exit" variants={fadeVariants} className="w-full">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-neutral-500 mb-2">
                  <span>Pertanyaan {currentIdx + 1} dari {QUESTIONS.length}</span>
                  <span>{Math.round(((currentIdx) / QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentIdx) / QUESTIONS.length) * 100}%` }}></div>
                </div>
              </div>

              {/* Question */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug">
                  {QUESTIONS[currentIdx].text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value)}
                    className={clsx(
                      "w-full p-4 rounded-2xl border-2 text-left font-medium text-neutral-700 transition-all flex items-center justify-between group",
                      answers[currentIdx] === opt.value 
                        ? "border-primary-600 bg-primary-50 text-primary-700" 
                        : "border-neutral-200 bg-white hover:border-primary-300"
                    )}
                  >
                    <span>{opt.label}</span>
                    <div className={clsx(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      answers[currentIdx] === opt.value ? "border-primary-600 bg-primary-600" : "border-neutral-300"
                    )}>
                      {answers[currentIdx] === opt.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button 
                  onClick={() => currentIdx > 0 && setCurrentIdx(c => c - 1)}
                  className={clsx("flex items-center gap-2 font-medium transition-colors", currentIdx === 0 ? "text-transparent pointer-events-none" : "text-neutral-500 hover:text-neutral-800")}
                >
                  <ArrowLeft size={18} /> Sebelumnya
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial="initial" animate="animate" variants={fadeVariants} className="w-full text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 text-primary-600 rounded-full mb-6">
                <Activity size={40} />
              </div>
              
              <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">Hasil Evaluasi</h2>
              <p className="text-neutral-500 mb-8">Berdasarkan jawabanmu, berikut adalah kondisimu saat ini.</p>

              {(() => {
                const score = calculateScore();
                const result = getResultCategory(score);
                
                return (
                  <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm relative overflow-hidden text-center mb-6">
                    {/* Gauge Visual */}
                    <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f5f5f4" strokeWidth="10" />
                        <circle 
                          cx="50" cy="50" r="45" fill="none" 
                          stroke="currentColor" strokeWidth="10" 
                          strokeDasharray="283" strokeDashoffset={283 - (283 * score) / 100} 
                          className={result.color}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-display font-bold text-neutral-900">{score}</span>
                        <span className="text-xs font-bold text-neutral-400">/ 100</span>
                      </div>
                    </div>
                    
                    <div className={clsx("inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4", result.bg, result.color)}>
                      Level Stres {result.category}
                    </div>
                    
                    <p className="text-neutral-700 leading-relaxed mb-8">{result.desc}</p>
                    
                    <div className="space-y-4 text-left border-t border-neutral-100 pt-6">
                      <h3 className="font-bold text-neutral-900 text-sm">Rekomendasi Langkah:</h3>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-600">Ambil waktu jeda 10 menit untuk istirahat.</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-600">Dengarkan lantunan "Dzikir Penenang Hati" di menu Audio.</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-4">
                <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 rounded-full font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors">
                  Ke Dashboard
                </button>
                <button onClick={() => { setAnswers({}); setCurrentIdx(0); setShowResult(false); }} className="flex items-center justify-center gap-2 w-14 h-14 shrink-0 rounded-full font-bold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                  <RotateCcw size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
