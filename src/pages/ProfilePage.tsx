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
  Heart,
  Calendar,
  Zap
} from 'lucide-react';
import clsx from 'clsx';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore() as any;
  const { clearSession } = useChatStore() as any;

  const isFreeTier = user?.tier === 'Free' || !user?.tier;

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
    { icon: Bell, label: 'Notifikasi & Pengingat', color: 'text-warning', bg: 'bg-yellow-50' },
    { icon: Shield, label: 'Privasi & Keamanan', color: 'text-success', bg: 'bg-green-50' },
    { icon: Heart, label: 'Preferensi Terapi', color: 'text-primary-500', bg: 'bg-primary-50' },
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
            {isFreeTier ? 'Free' : user?.tier} Member
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md md:max-w-3xl mx-auto w-full px-4 -mt-16 relative z-20">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          
          {/* Info Membership Saya */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100 relative overflow-hidden">
            <h3 className="font-bold text-neutral-900 mb-4">Info Membership Saya</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Crown size={24} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Paket Aktif</p>
                  <p className="font-bold text-lg text-neutral-900">{isFreeTier ? 'Free' : user?.tier}</p>
                </div>
              </div>
              <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                Aktif
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Calendar size={16} className="text-neutral-400" />
                <span>Mulai: <span className="font-medium text-neutral-900">01 Jun 2026</span></span>
              </div>
              {!isFreeTier && (
                <>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar size={16} className="text-neutral-400" />
                    <span>Berakhir: <span className="font-medium text-neutral-900">01 Jul 2026</span></span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500">Sisa Waktu</span>
                      <span className="font-bold text-primary-600">30 Hari</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link to="/upgrade" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Zap size={18} />
              {isFreeTier ? 'Upgrade Paket' : 'Perpanjang Paket'}
            </Link>
          </motion.div>

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
            <p className="text-xs text-neutral-400">PWA Membership App v1.1.0</p>
            <p className="text-[10px] text-neutral-400 mt-1">Sistem Manajemen Membership</p>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
