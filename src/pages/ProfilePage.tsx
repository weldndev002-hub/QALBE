import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { getMemberDetail } from '../services/adminService';
import { supabase } from '../lib/supabase';
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
  Zap,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  Info,
  X
} from 'lucide-react';
import clsx from 'clsx';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, login, token, role } = useAuthStore() as any;
  const { clearSession } = useChatStore() as any;

  const [membershipDetail, setMembershipDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Profil
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // State Edit Profil
  const [editName, setEditName] = useState(user?.name || '');
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  
  // State Hapus Akun
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State Toggles
  const [toggles, setToggles] = useState({
    privacyHistory: true,
    privacyAnalytics: false,
    notifPush: true,
    notifWhatsApp: true,
    notifEmail: false,
    autoRenew: true,
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // State Custom Alert
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '' });

  useEffect(() => {
    if (user?.id) {
      getMemberDetail(user.id).then((detail) => {
        if (detail?.membership?.tier) {
          setMembershipDetail(detail.membership);
          // Sinkronkan tier terbaru ke authStore jika berbeda
          if (user.tier !== detail.membership.tier.name) {
            login({ ...user, tier: detail.membership.tier.name }, token, role);
          }
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const activeTierName = membershipDetail?.tier?.name || user?.tier || 'Free';
  const isFreeTier = activeTierName === 'Free' || activeTierName === 'Gratis';

  const handleLogout = () => {
    // Simulasi proses logout
    logout();
    clearSession(); // Bersihkan sesi chat
    navigate('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSaving(true);
    setEditMessage({ type: '', text: '' });

    try {
      // 1. Update nama di public.profiles
      if (editName && editName !== user.name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: editName })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        // Update di auth.users (meta_data)
        await supabase.auth.updateUser({
          data: { full_name: editName }
        });

        // Update zustand store
        login({ ...user, name: editName }, token, role);
      }

      // 2. Update password jika diisi
      if (editPassword) {
        if (editPassword.length < 6) {
          throw new Error('Password minimal 6 karakter');
        }
        const { error: passError } = await supabase.auth.updateUser({
          password: editPassword
        });
        if (passError) throw passError;
      }

      setEditMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setEditPassword('');
      setTimeout(() => {
        setActiveModal(null);
        setEditMessage({ type: '', text: '' });
      }, 2000);
    } catch (err: any) {
      setEditMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Memanggil fungsi RPC di Supabase untuk menghapus data auth
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;

      // Sukses hapus, keluarkan user
      logout();
      clearSession();
      navigate('/');
    } catch (err: any) {
      setEditMessage({ type: 'error', text: 'Gagal menghapus akun: ' + err.message });
      setCustomAlert({
        isOpen: true,
        type: 'alert',
        title: 'Gagal Menghapus Akun',
        message: err.message
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    setCustomAlert({
      isOpen: true,
      type: 'confirm',
      title: 'Batalkan Langganan',
      message: 'Apakah Anda yakin ingin membatalkan perpanjangan otomatis untuk paket ini?',
      onConfirm: () => {
        setToggles(prev => ({ ...prev, autoRenew: false }));
        setTimeout(() => {
          setCustomAlert({
            isOpen: true,
            type: 'alert',
            title: 'Berhasil',
            message: 'Perpanjangan otomatis telah dibatalkan. Paket Anda akan tetap aktif hingga masa berlakunya habis.'
          });
        }, 300);
      }
    });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const settingsMenu = [
    { id: 'editProfile', icon: UserIcon, label: 'Edit Profil', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'notifications', icon: Bell, label: 'Notifikasi & Pengingat', color: 'text-warning', bg: 'bg-yellow-50' },
    { id: 'privacy', icon: Shield, label: 'Privasi & Keamanan', color: 'text-success', bg: 'bg-green-50' },
    { id: 'preferences', icon: Heart, label: 'Preferensi Terapi', color: 'text-primary-500', bg: 'bg-primary-50' },
    { id: 'help', icon: CircleHelp, label: 'Bantuan & Dukungan', color: 'text-purple-500', bg: 'bg-purple-50' },
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
            {activeTierName} Member
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-md md:max-w-3xl mx-auto w-full px-4 -mt-16 relative z-20">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          
          {/* Info Membership Saya */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100 relative overflow-hidden">
            <h3 className="font-bold text-neutral-900 mb-4">Info Membership Saya</h3>
            
            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Crown size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Paket Aktif</p>
                      <p className="font-bold text-lg text-neutral-900">{activeTierName}</p>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                    {membershipDetail?.status === 'active' ? 'Aktif' : isFreeTier ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar size={16} className="text-neutral-400" />
                    <span>Mulai: <span className="font-medium text-neutral-900">
                      {membershipDetail?.started_at ? new Date(membershipDetail.started_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </span></span>
                  </div>
                  
                  {!isFreeTier && membershipDetail?.expires_at && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar size={16} className="text-neutral-400" />
                        <span>Berakhir: <span className="font-medium text-neutral-900">
                          {new Date(membershipDetail.expires_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span></span>
                      </div>
                      <div className="pt-2">
                        {(() => {
                          const now = new Date();
                          const exp = new Date(membershipDetail.expires_at);
                          const start = new Date(membershipDetail.started_at || Date.now());
                          const diffTime = exp.getTime() - now.getTime();
                          const totalTime = exp.getTime() - start.getTime();
                          
                          let remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          if (remainingDays < 0) remainingDays = 0;
                          
                          let percent = ((totalTime - diffTime) / totalTime) * 100;
                          if (percent > 100) percent = 100;
                          if (percent < 0) percent = 0;

                          return (
                            <>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-neutral-500">Sisa Waktu</span>
                                <span className="font-bold text-primary-600">{remainingDays} Hari</span>
                              </div>
                              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-neutral-900">Perpanjangan Otomatis</p>
                          <p className="text-xs text-neutral-500">Otomatis perpanjang paket</p>
                        </div>
                        <button onClick={() => handleToggle('autoRenew')} className="outline-none">
                          {toggles.autoRenew ? (
                            <ToggleRight size={32} className="text-primary-500 transition-colors" />
                          ) : (
                            <ToggleLeft size={32} className="text-neutral-300 transition-colors" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            <Link to="/upgrade" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3">
              <Zap size={18} />
              {isFreeTier ? 'Upgrade Paket' : 'Perpanjang Paket'}
            </Link>
            
            {!isFreeTier && (
              <button 
                onClick={handleCancelSubscription}
                className="w-full bg-white text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl border border-red-100 transition-colors text-sm"
              >
                Batalkan Langganan
              </button>
            )}
          </motion.div>

          {/* Pengaturan Menu */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-2">
              {settingsMenu.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveModal(item.id)}
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

      {/* Modal Container */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg text-neutral-900">
                {settingsMenu.find(m => m.id === activeModal)?.label || 'Pengaturan'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto overflow-x-hidden p-5 flex-1 custom-scrollbar">
              
              {/* EDIT PROFIL MODAL */}
              {activeModal === 'editProfile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
              {editMessage.text && (
                <div className={clsx(
                  "p-3 rounded-xl text-sm font-medium",
                  editMessage.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}>
                  {editMessage.text}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">Ganti Password <span className="text-neutral-400 font-normal">(Opsional)</span></label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Shield size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder="Kosongkan jika tidak ingin ganti"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                ) : 'Simpan Perubahan'}
              </button>
            </form>
            )}

            {/* BANTUAN & DUKUNGAN MODAL */}
              {activeModal === 'help' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <CircleHelp size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-1">Pusat Bantuan Qalbie</h4>
                      <p className="text-sm text-neutral-600">Tim dukungan kami siap membantu menjawab pertanyaan Anda 24/7 (khusus Premium) atau pada jam kerja.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <a href="mailto:support@qalbie.id" className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"><Mail size={16} /></div>
                      <div>
                        <p className="font-bold text-sm text-neutral-900">Email Support</p>
                        <p className="text-xs text-neutral-500">support@qalbie.id</p>
                      </div>
                    </a>
                    
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-green-300 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Phone size={16} /></div>
                      <div>
                        <p className="font-bold text-sm text-neutral-900">WhatsApp Support</p>
                        <p className="text-xs text-neutral-500">Tersedia untuk pengguna Pro & Premium</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* PRIVASI & KEAMANAN MODAL */}
              {activeModal === 'privacy' && (
                <div className="space-y-5">
                  <div className="bg-green-50 p-4 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-1">Ruang Aman 100%</h4>
                      <p className="text-sm text-neutral-600">Data percakapan Anda dengan AI dienkripsi secara aman dan tidak dapat dibaca oleh pihak ketiga.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-neutral-900">Riwayat Terapi Tersimpan</p>
                        <p className="text-xs text-neutral-500">Simpan otomatis progres terapi</p>
                      </div>
                      <button onClick={() => handleToggle('privacyHistory')} className="outline-none">
                        {toggles.privacyHistory ? (
                          <ToggleRight size={32} className="text-primary-500 transition-colors" />
                        ) : (
                          <ToggleLeft size={32} className="text-neutral-300 transition-colors" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-neutral-900">Bagikan Analitik Anonim</p>
                        <p className="text-xs text-neutral-500">Bantu kami meningkatkan AI</p>
                      </div>
                      <button onClick={() => handleToggle('privacyAnalytics')} className="outline-none">
                        {toggles.privacyAnalytics ? (
                          <ToggleRight size={32} className="text-primary-500 transition-colors" />
                        ) : (
                          <ToggleLeft size={32} className="text-neutral-300 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-neutral-100">
                    {!isDeleting ? (
                      <button 
                        onClick={() => setIsDeleting(true)}
                        className="text-sm text-red-500 font-bold hover:text-red-600 transition-colors"
                      >
                        Hapus Akun & Semua Data Saya
                      </button>
                    ) : (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-3">
                        <p className="text-sm text-red-800 font-bold">Peringatan: Tindakan ini permanen!</p>
                        <p className="text-xs text-red-600">Semua riwayat, paket aktif, dan profil akan terhapus tak bersisa. Ketik <strong>HAPUS</strong> untuk melanjutkan.</p>
                        <input 
                          type="text" 
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Ketik HAPUS"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-red-200 outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setIsDeleting(false);
                              setDeleteConfirmText('');
                            }}
                            className="flex-1 py-2 bg-white text-neutral-600 text-sm font-bold rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                          >
                            Batal
                          </button>
                          <button 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'HAPUS' || deleteLoading}
                            className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 flex items-center justify-center transition-colors"
                          >
                            {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : 'Hapus Permanen'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NOTIFIKASI & PENGINGAT MODAL */}
              {activeModal === 'notifications' && (
                <div className="space-y-5">
                  <div className="bg-yellow-50 p-4 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-1">Pengingat Terapi</h4>
                      <p className="text-sm text-neutral-600">Atur notifikasi agar Anda tidak terlewat sesi terapi maupun target dzikir harian.</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-neutral-900">Pengingat Sesi AI</p>
                        <p className="text-xs text-neutral-500">Notifikasi push harian</p>
                      </div>
                      <button onClick={() => handleToggle('notifPush')} className="outline-none">
                        {toggles.notifPush ? (
                          <ToggleRight size={32} className="text-primary-500 transition-colors" />
                        ) : (
                          <ToggleLeft size={32} className="text-neutral-300 transition-colors" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-neutral-900">Notifikasi WhatsApp</p>
                        <p className="text-xs text-neutral-500">Update penting via WhatsApp</p>
                      </div>
                      <button onClick={() => handleToggle('notifWhatsApp')} className="outline-none">
                        {toggles.notifWhatsApp ? (
                          <ToggleRight size={32} className="text-primary-500 transition-colors" />
                        ) : (
                          <ToggleLeft size={32} className="text-neutral-300 transition-colors" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-neutral-900">Email Promosi</p>
                        <p className="text-xs text-neutral-500">Diskon dan info paket terbaru</p>
                      </div>
                      <button onClick={() => handleToggle('notifEmail')} className="outline-none">
                        {toggles.notifEmail ? (
                          <ToggleRight size={32} className="text-primary-500 transition-colors" />
                        ) : (
                          <ToggleLeft size={32} className="text-neutral-300 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PREFERENSI TERAPI MODAL */}
              {activeModal === 'preferences' && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mb-4">
                    <Info size={32} />
                  </div>
                  <h4 className="font-bold text-lg text-neutral-900 mb-2">Segera Hadir</h4>
                  <p className="text-sm text-neutral-500">Fitur kustomisasi persona AI dan metode konseling sedang dalam tahap pengembangan.</p>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {customAlert.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center"
          >
            <div className={clsx(
              "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
              customAlert.title.toLowerCase().includes('berhasil') ? "bg-green-100 text-green-600" :
              customAlert.title.toLowerCase().includes('gagal') ? "bg-red-100 text-red-600" :
              "bg-primary-100 text-primary-600"
            )}>
              {customAlert.title.toLowerCase().includes('berhasil') ? <Shield size={32} /> :
               customAlert.title.toLowerCase().includes('gagal') ? <X size={32} /> :
               <Info size={32} />}
            </div>
            
            <h3 className="font-bold text-xl text-neutral-900 mb-2">{customAlert.title}</h3>
            <p className="text-sm text-neutral-600 mb-6">{customAlert.message}</p>
            
            <div className="flex gap-3">
              {customAlert.type === 'confirm' && (
                <button 
                  onClick={() => setCustomAlert(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Batal
                </button>
              )}
              <button 
                onClick={() => {
                  setCustomAlert(prev => ({ ...prev, isOpen: false }));
                  if (customAlert.onConfirm) customAlert.onConfirm();
                }}
                className={clsx(
                  "flex-1 py-3 text-white font-bold rounded-xl transition-colors shadow-md",
                  customAlert.title.toLowerCase().includes('gagal') ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" :
                  "bg-primary-600 hover:bg-primary-700 shadow-primary-500/20"
                )}
              >
                {customAlert.type === 'confirm' ? 'Ya, Lanjutkan' : 'Mengerti'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
