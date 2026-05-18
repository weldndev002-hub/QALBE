import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Sparkles, Wind, Brain, MessageCircle, Moon, Sun, Coffee } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

const goals = [
  { id: 'stress', label: 'Mengelola stres & cemas', icon: Wind },
  { id: 'reflection', label: 'Refleksi diri harian', icon: Brain },
  { id: 'chat', label: 'Butuh teman cerita', icon: MessageCircle },
];

const times = [
  { id: 'morning', label: 'Pagi Hari', desc: 'Memulai hari dengan tenang', icon: Coffee },
  { id: 'afternoon', label: 'Siang Hari', desc: 'Jeda di tengah kesibukan', icon: Sun },
  { id: 'night', label: 'Malam Hari', desc: 'Refleksi sebelum tidur', icon: Moon },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nickname: '',
    goals: [] as string[],
    activeTime: ''
  });
  
  const navigate = useNavigate();
  const login = useAuthStore((state: any) => state.login);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((c) => c + 1);
    } else {
      // Simulasikan login & simpan data onboarding
      login({ name: formData.nickname || 'Ukhti', tier: 'premium' }, 'dummy-jwt-token');
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((c) => c - 1);
    } else {
      navigate('/');
    }
  };

  const toggleGoal = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(id) 
        ? prev.goals.filter((g) => g !== id)
        : [...prev.goals, id]
    }));
  };

  // Validasi tombol next
  const canProceed = () => {
    if (currentStep === 1) return formData.nickname.trim().length > 0;
    if (currentStep === 2) return formData.goals.length > 0;
    if (currentStep === 3) return formData.activeTime !== '';
    return true;
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans selection:bg-primary-100">
      {/* Top Navigation */}
      <header className="p-6 flex items-center justify-between z-10 relative">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        {/* Progress Indicator */}
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={clsx(
                "h-2 rounded-full transition-all duration-500",
                step === currentStep ? "w-8 bg-primary-600" : 
                step < currentStep ? "w-3 bg-primary-400" : "w-3 bg-neutral-200"
              )}
            />
          ))}
        </div>
        
        <div className="w-10" /> {/* Spacer untuk balance */}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 pb-24">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-display font-bold text-neutral-900 mb-3">Assalamu'alaikum</h1>
                <p className="text-neutral-600">Mari kita mulai perjalananmu. Boleh kami tahu namamu? Kamu bisa menggunakan nama anonim agar lebih nyaman.</p>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Nama panggilanmu..." 
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full bg-white border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 rounded-2xl py-4 px-6 text-lg font-medium text-neutral-900 transition-all outline-none placeholder:text-neutral-400"
                  onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
              <div className="mb-2">
                <h1 className="text-3xl font-display font-bold text-neutral-900 mb-3">Apa fokus utamamu?</h1>
                <p className="text-neutral-600">Pilih satu atau lebih agar Qalbie bisa menyesuaikan pengalaman yang tepat untukmu.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                {goals.map((goal) => {
                  const isSelected = formData.goals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={clsx(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                        isSelected 
                          ? "border-primary-500 bg-primary-50" 
                          : "border-neutral-200 bg-white hover:border-primary-300"
                      )}
                    >
                      <div className={clsx(
                        "w-12 h-12 flex items-center justify-center rounded-xl transition-colors",
                        isSelected ? "bg-primary-500 text-white" : "bg-neutral-100 text-neutral-500 group-hover:bg-primary-100 group-hover:text-primary-600"
                      )}>
                        <goal.icon size={24} />
                      </div>
                      <span className={clsx(
                        "flex-1 font-medium text-lg",
                        isSelected ? "text-primary-900" : "text-neutral-700"
                      )}>{goal.label}</span>
                      <div className={clsx(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary-500 border-primary-500" : "border-neutral-300"
                      )}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
              <div className="mb-2">
                <h1 className="text-3xl font-display font-bold text-neutral-900 mb-3">Kapan waktu terbaikmu?</h1>
                <p className="text-neutral-600">Kami akan mengingatkanmu untuk mengambil jeda sejenak di waktu ini.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                {times.map((time) => {
                  const isSelected = formData.activeTime === time.id;
                  return (
                    <button
                      key={time.id}
                      onClick={() => setFormData({ ...formData, activeTime: time.id })}
                      className={clsx(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                        isSelected 
                          ? "border-secondary-500 bg-secondary-50" 
                          : "border-neutral-200 bg-white hover:border-secondary-300"
                      )}
                    >
                      <div className={clsx(
                        "w-12 h-12 flex items-center justify-center rounded-xl transition-colors",
                        isSelected ? "bg-secondary-500 text-white" : "bg-neutral-100 text-neutral-500 group-hover:bg-secondary-100 group-hover:text-secondary-600"
                      )}>
                        <time.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className={clsx(
                          "font-medium text-lg",
                          isSelected ? "text-secondary-900" : "text-neutral-900"
                        )}>{time.label}</div>
                        <div className="text-sm text-neutral-500 mt-0.5">{time.desc}</div>
                      </div>
                      <div className={clsx(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "bg-secondary-500 border-secondary-500" : "border-neutral-300"
                      )}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Action Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-4 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
          >
            {currentStep === 3 ? "Mulai Menggunakan Qalbie" : "Lanjutkan"}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
