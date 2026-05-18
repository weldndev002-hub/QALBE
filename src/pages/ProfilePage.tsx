import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { 
  Settings, 
  Bell, 
  Shield, 
  CircleHelp, 
  LogOut, 
  ChevronRight, 
  Crown, 
  User as UserIcon,
  Heart
} from 'lucide-react';
import clsx from 'clsx';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore() as any;
  const { clearSession } = useChatStore() as any;

  const isFreeTier = false; // Dibuka semua

  const handleLogout = () => {
    // Simulasi proses logout
    logout();
    clearSession(); // Bersihkan sesi chat
    navigate('/');
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const settingsMenu = [
    { icon: UserIcon, label: 'Edit Profil', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Bell, label: 'Notifikasi & Pengingat', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Shield, label: 'Privasi & Keamanan', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Heart, label: 'Preferensi Terapi', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: CircleHelp, label: 'Bantuan & Dukungan', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-[100px] font-sans selection:bg-primary-100">
      {/* Header Profile Area */}
      <div className="bg-primary-600 px-4 pt-12 pb-24 relative overflow-hidden rounded-b-[40px]">
        {/* Dekorasi Background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-12 -left-12 w-40 h-40 bg-secondary-400 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 max-w-md md:max-w-3xl mx-auto text-center">
          <h1 className="text-white font-display font-bold text-xl mb-6">Profil Saya</h1>
          
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl shadow-primary-900/20 mb-4 border-4 border-primary-100/30 text-3xl font-display font-bold text-primary-600">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{user?.name || 'Ukhti'}</h2>
          
          <div className="inline-flex items-center gap-1.5 bg-primary-500/50 backdrop-blur-sm border border-primary-400/50 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
            {isFreeTier ? 'Gratis' : user?.tier} Member
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md md:max-w-3xl mx-auto w-full px-4 -mt-16 relative z-20">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          
          {/* Upgrade Banner (Jika Free/Basic) */}
          {isFreeTier && (
            <motion.div variants={fadeUp} className="bg-white rounded-3xl p-1 shadow-sm border border-secondary-200 overflow-hidden">
              <div className="bg-gradient-to-r from-secondary-100 to-white rounded-[20px] p-5 relative overflow-hidden">
                <Crown className="absolute -right-4 -top-4 text-secondary-200 w-24 h-24 opacity-50 transform rotate-12" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={20} className="text-secondary-600" />
                    <h3 className="font-bold text-secondary-900">Upgrade ke Premium</h3>
                  </div>
                  <p className="text-sm text-secondary-800 mb-4 pr-10">
                    Buka semua fitur terkunci, termasuk history emosi lengkap & curhat tanpa batas.
                  </p>
                  <Link to="/upgrade" className="inline-block bg-secondary-600 text-white font-bold px-6 py-2 rounded-full text-sm hover:bg-secondary-700 transition-colors shadow-sm">
                    Lihat Paket
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pengaturan Menu */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-2">
              {settingsMenu.map((item, index) => (
                <button 
                  key={index}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-medium text-neutral-800">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-neutral-400 group-hover:text-neutral-600" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Lainnya / Logout */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-500 transition-transform group-hover:scale-110">
                  <LogOut size={20} />
                </div>
                <span className="font-medium text-red-600">Keluar (Logout)</span>
              </div>
            </button>
          </motion.div>

          <div className="text-center pb-6">
            <p className="text-xs text-neutral-400">Qalbie App v1.0.0</p>
            <p className="text-[10px] text-neutral-400 mt-1">Dibuat dengan ❤️ untuk Muslimah</p>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
