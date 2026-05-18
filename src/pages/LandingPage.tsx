import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Headphones, MessageCircle, Activity, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-primary-100">
      {/* Navbar Minimalist */}
      <header className="sticky top-0 z-50 bg-neutral-50/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-display font-bold text-primary-600">QALBIE</div>
          <Link to="/onboarding" className="bg-primary-600 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm">
            Mulai Gratis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="max-w-6xl mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-12">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex-1 text-center lg:text-left z-10"
          >
            <motion.div variants={fadeUp} className="inline-block px-4 py-1.5 bg-secondary-100 text-secondary-600 font-medium rounded-full text-sm mb-6">
              Ruang Aman Muslimah ✨
            </motion.div>
            <motion.div variants={fadeUp}>
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-neutral-900 leading-tight mb-6">
                Temukan ketenangan di setiap <span className="text-primary-600">tarikan napasmu.</span>
              </h1>
            </motion.div>
            <motion.p variants={fadeUp} className="text-lg text-neutral-700 mb-8 max-w-lg mx-auto lg:mx-0">
              Qalbie adalah teman perjalanan mentalmu. Sebuah platform yang hangat dan spiritual untuk mendukung kesejahteraan mental Muslimah.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/onboarding" className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-full font-medium text-lg hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Mulai Perjalananmu
              </Link>
              <p className="mt-4 text-sm text-neutral-500">Gratis selamanya, tingkatkan kapan saja.</p>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full max-w-md lg:max-w-none relative z-10 mx-auto"
          >
            <div className="absolute inset-0 bg-primary-100 rounded-full blur-3xl opacity-50 transform -translate-y-10"></div>
            <img src="/hero-illustration.png" alt="Muslimah Illustration" className="w-full relative z-10 drop-shadow-2xl rounded-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-primary-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-primary-400/30">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-3xl font-display font-bold mb-1">10k+</div>
            <div className="text-primary-100 text-sm">Muslimah Bergabung</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-3xl font-display font-bold mb-1">4.9/5</div>
            <div className="text-primary-100 text-sm">Rating Kepuasan</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-3xl font-display font-bold mb-1">500+</div>
            <div className="text-primary-100 text-sm">Audio Terapi</div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-3xl font-display font-bold mb-1">24/7</div>
            <div className="text-primary-100 text-sm">Teman Curhat AI</div>
          </motion.div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-4">Fitur Utama Qalbie</h2>
          <p className="text-neutral-700 max-w-2xl mx-auto">Kami merancang fitur yang memahami kondisimu, menggabungkan psikologi dan nilai-nilai Islami secara harmonis.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: MessageCircle, title: "Teman Curhat AI", desc: "Teman bicara yang aman, rahasia, dan mendengarkan tanpa menghakimi.", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Heart, title: "Mood Tracker", desc: "Kenali emosimu setiap hari. Pahami pola perasaan dan stresmu.", color: "text-rose-500", bg: "bg-rose-50" },
            { icon: Headphones, title: "Audio Terapi", desc: "Dengarkan dzikir dan relaksasi untuk menenangkan jiwa yang lelah.", color: "text-primary-600", bg: "bg-primary-50" },
            { icon: Activity, title: "Stress Meter", desc: "Cek tingkat stres dan dapatkan rekomendasi langkah terbaik.", color: "text-secondary-600", bg: "bg-secondary-50" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.bg} ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Table */}
      <section className="bg-neutral-100 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-4">Investasi Untuk Hatimu</h2>
            <p className="text-neutral-700 max-w-2xl mx-auto">Pilih paket yang sesuai dengan kebutuhan perjalanan mentalmu.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Free */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Gratis</h3>
              <p className="text-neutral-500 text-sm mb-6">Mulai langkah pertamamu</p>
              <div className="text-4xl font-display font-bold mb-8">Rp 0<span className="text-lg text-neutral-500 font-sans font-normal">/bln</span></div>
              <ul className="space-y-4 mb-8">
                {["Curhat AI (3 pesan/hari)", "Mood Tracker dasar", "Preview Audio Terapi", "Akses artikel terbatas"].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-700 text-sm">
                    <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className="block w-full py-3 px-4 bg-primary-50 text-primary-600 font-medium text-center rounded-full hover:bg-primary-100 transition-colors">
                Mulai Sekarang
              </Link>
            </motion.div>

            {/* Basic */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-primary-600 rounded-3xl p-8 border border-primary-500 text-white transform md:-translate-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-secondary-400 text-secondary-900 text-xs font-bold px-4 py-1 rounded-bl-xl shadow-sm">POPULER</div>
              <h3 className="text-xl font-bold mb-2">Basic</h3>
              <p className="text-primary-100 text-sm mb-6">Dukungan intensif harian</p>
              <div className="text-4xl font-display font-bold mb-8">Rp 29k<span className="text-lg text-primary-200 font-sans font-normal">/bln</span></div>
              <ul className="space-y-4 mb-8">
                {["Curhat AI (50 pesan/hari)", "History & Chart Mood", "5 Audio Terapi Unggulan", "Analisa Stres bulanan"].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-white text-sm">
                    <CheckCircle2 size={18} className="text-secondary-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/upgrade" className="block w-full py-3 px-4 bg-secondary-400 text-secondary-900 font-bold text-center rounded-full hover:bg-secondary-500 transition-colors shadow-sm">
                Pilih Basic
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Premium</h3>
              <p className="text-neutral-500 text-sm mb-6">Akses penuh tanpa batas</p>
              <div className="text-4xl font-display font-bold mb-8">Rp 49k<span className="text-lg text-neutral-500 font-sans font-normal">/bln</span></div>
              <ul className="space-y-4 mb-8">
                {["Curhat AI Tanpa Batas", "Akses penuh Mood Tracker", "Semua koleksi Audio Terapi", "Laporan Psikologi detail"].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-700 text-sm">
                    <CheckCircle2 size={18} className="text-primary-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/upgrade" className="block w-full py-3 px-4 bg-primary-50 text-primary-600 font-medium text-center rounded-full hover:bg-primary-100 transition-colors">
                Pilih Premium
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 text-sm text-center border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display font-bold text-white">QALBIE</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
