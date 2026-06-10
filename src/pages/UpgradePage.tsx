import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldCheck, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';

export default function UpgradePage() {
  const navigate = useNavigate();
  const { user, login, token } = useAuthStore() as any;
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Rp 29.000',
      period: '/ bulan',
      desc: 'Cocok untuk dukungan intensif harian.',
      color: 'bg-secondary-600 border-secondary-500 text-white',
      btnColor: 'bg-white text-secondary-900 hover:bg-secondary-50',
      popular: true,
      features: ['Curhat AI (50 pesan/hari)', 'History & Chart Mood', '5 Audio Terapi Unggulan', 'Analisa Stres Bulanan']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'Rp 49.000',
      period: '/ bulan',
      desc: 'Akses penuh tanpa batas selamanya.',
      color: 'bg-white border-neutral-200 text-neutral-900',
      btnColor: 'bg-primary-600 text-white hover:bg-primary-700',
      popular: false,
      features: ['Curhat AI Tanpa Batas', 'Akses Penuh Mood Tracker', 'Semua Koleksi Audio Terapi', 'Laporan Psikologi Detail']
    }
  ];

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);
    
    // Simulasi Midtrans Payment Gateway (Loading)
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      // Update akun lokal menjadi premium/basic
      login({ ...user, tier: planId }, token || 'dummy-jwt-token');
      
      // Arahkan ke dashboard setelah 2 detik
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 2500);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 font-sans">
      <header className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-40 border-b border-neutral-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700 mr-3">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-neutral-900">Pilih Paket Berlangganan</h1>
      </header>

      <main className="flex-1 max-w-md md:max-w-4xl mx-auto w-full p-4 md:p-8">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">Pembayaran Berhasil!</h2>
              <p className="text-neutral-600 mb-8">Alhamdulillah. Status member Anda telah diperbarui menjadi {selectedPlan === 'basic' ? 'Basic' : 'Premium'}.</p>
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-xs text-neutral-400 mt-4">Mengalihkan ke Dashboard...</p>
            </motion.div>
          ) : (
            <motion.div key="pricing" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              <div className="text-center mb-10 mt-4">
                <Crown className="mx-auto text-secondary-500 mb-4" size={40} />
                <h2 className="text-3xl font-display font-bold text-neutral-900 mb-3">Investasi Untuk Hatimu</h2>
                <p className="text-neutral-600 text-sm max-w-md mx-auto">Dapatkan pendampingan emosional tanpa batas untuk ketenangan jiwa seutuhnya.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
                {plans.map((plan) => (
                  <motion.div key={plan.id} variants={fadeUp} className={clsx("rounded-3xl p-6 md:p-8 border relative overflow-hidden shadow-sm", plan.color)}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-secondary-900 text-secondary-400 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl tracking-wider uppercase">
                        Paling Dipilih
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-display font-bold">{plan.price}</span>
                      <span className={clsx("text-sm", plan.popular ? "text-secondary-100" : "text-neutral-500")}>{plan.period}</span>
                    </div>
                    <p className={clsx("text-sm mb-6", plan.popular ? "text-secondary-100" : "text-neutral-600")}>{plan.desc}</p>
                    
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 size={18} className={clsx("shrink-0 mt-0.5", plan.popular ? "text-secondary-300" : "text-primary-600")} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isProcessing}
                      className={clsx("w-full py-3.5 rounded-full font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2", plan.btnColor, isProcessing && selectedPlan === plan.id && "opacity-70 pointer-events-none")}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                         "Pilih " + plan.name
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeUp} className="max-w-xl mx-auto flex items-center justify-center gap-3 text-center bg-green-50 text-green-700 px-4 py-3 rounded-2xl border border-green-100">
                <ShieldCheck size={20} className="shrink-0" />
                <span className="text-sm font-medium">Pembayaran aman dengan Midtrans Gateway. Bisa dibatalkan kapan saja tanpa syarat tersembunyi.</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
