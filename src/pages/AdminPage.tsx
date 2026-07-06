import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, LogOut, TrendingUp, Search, Plus, MoreVertical, Package, List, Settings, CheckCircle2, Shield, X, Edit, Trash2, ShieldAlert, FileText, Image, Video, Upload, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';
import * as adminService from '../services/adminService';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const swalCustom = Swal.mixin({
  customClass: {
    popup: 'rounded-[24px] font-sans p-6',
    title: 'text-xl font-bold text-slate-850',
    htmlContainer: 'text-sm text-neutral-500',
    confirmButton: 'bg-[#7e3188] hover:bg-[#682870] text-white px-6 py-2.5 rounded-xl text-sm font-bold mx-1 transition-colors',
    cancelButton: 'border border-neutral-200 text-neutral-600 px-6 py-2.5 rounded-xl text-sm font-bold mx-1 bg-white hover:bg-neutral-50 transition-colors'
  },
  buttonsStyling: false
});

const showSuccess = (title: string, text?: string) => {
  return swalCustom.fire({
    icon: 'success',
    title,
    text,
    iconColor: '#7e3188'
  });
};

const showError = (title: string, text?: string) => {
  return swalCustom.fire({
    icon: 'error',
    title,
    text,
    iconColor: '#dc2626'
  });
};

const showConfirm = (title: string, text?: string) => {
  return swalCustom.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    iconColor: '#eab308'
  });
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout, role, isAuthenticated } = useAuthStore() as any;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        if (!isAuthenticated) {
          if (isMounted) navigate('/login');
          return;
        }
        
        // Fast path: jika local role sudah admin, izinkan langsung render
        if (role === 'admin' || role === 'super_admin') {
          if (isMounted) {
            setIsAuthorized(true);
            setIsChecking(false);
          }
          return;
        }
        
        // Timeout 2 detik untuk menghindari hanging jika supabase error
        const rolePromise = adminService.getCurrentUserRole().catch(() => null);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
        
        let actualRole = await Promise.race([rolePromise, timeoutPromise]);
        
        if (!isMounted) return;

        if (actualRole === 'user' || !actualRole) {
          if (role === 'admin' || role === 'super_admin') {
            actualRole = role;
          }
        }

        if (actualRole !== 'admin' && actualRole !== 'super_admin') {
          navigate('/dashboard');
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        if (isMounted) {
          if (role === 'admin' || role === 'super_admin') {
            setIsAuthorized(true);
          } else {
            navigate('/dashboard');
          }
        }
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };
    checkAuth();
    
    return () => { isMounted = false; };
  }, [isAuthenticated, role, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans flex-col gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="text-neutral-500 text-sm">Memverifikasi akses Admin...</p>
        <button 
          onClick={() => { setIsChecking(false); setIsAuthorized(true); }}
          className="mt-4 text-xs text-neutral-400 hover:text-[#7e3188] underline transition-colors"
        >
          Paksa Masuk (Bypass)
        </button>
      </div>
    );
  }
  
  if (!isAuthorized) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Member', icon: Users },
    { id: 'packages', label: 'Paket Membership', icon: Package },
    { id: 'features', label: 'Master Fitur', icon: List },
    { id: 'contents', label: 'Konten', icon: FileText },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Super Admin */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <Shield className="text-primary-400" size={24} />
          <h1 className="text-xl font-bold text-white tracking-tight">Super <span className="text-primary-400">Admin</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left",
                activeTab === item.id 
                  ? "bg-primary-600 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              <span className="leading-tight">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 hover:bg-red-500/10 text-red-400 px-4 py-3 rounded-xl font-medium w-full transition-colors">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
          {activeTab === 'users' && <UsersTab key="users" />}
          {activeTab === 'packages' && <PackagesTab key="packages" />}
          {activeTab === 'features' && <FeaturesTab key="features" />}
          {activeTab === 'contents' && <ContentsTab key="contents" />}
          {activeTab === 'settings' && <SettingsTab key="settings" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ================= KOMPONEN TAB =================

function DashboardTab() {
  const [stats, setStats] = useState<adminService.AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAdminStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { title: 'Total Member', value: stats?.totalMembers ?? '-', icon: Users, color: 'text-primary-600', bg: 'bg-primary-100', trend: `${stats?.newThisMonth ?? 0} baru bulan ini` },
    { title: 'Member/Premium Aktif', value: stats?.activePremium ?? '-', icon: CheckCircle2, color: 'text-[#7e3188]', bg: 'bg-purple-100', trend: 'Berlangganan berbayar' },
    { title: 'Expired dalam 7 Hari', value: stats?.expiringIn7Days ?? '-', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'Perlu follow-up' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Overview Dashboard</h2>
          <p className="text-neutral-500 text-sm mt-1">Ringkasan performa membership platform.</p>
        </div>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg border border-neutral-200 shadow-sm">
          Hari ini: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <h3 className="text-neutral-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold text-neutral-900 mt-1 mb-2">{stat.value}</p>
              <p className="text-xs text-neutral-400">{stat.trend}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<adminService.MemberWithDetails[]>([]);
  const [tiers, setTiers] = useState<adminService.MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<adminService.MemberWithDetails | null>(null);
  const [history, setHistory] = useState<adminService.MembershipHistory[]>([]);
  const [updatingTier, setUpdatingTier] = useState<number>(1);
  const [duration, setDuration] = useState<number>(1); // months
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { user: currentAdmin } = useAuthStore() as any;

  const fetchUsers = () => {
    setLoading(true);
    adminService.getMembers({ search }).then(data => {
      setUsers(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    adminService.getTiers().then(setTiers).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenManageModal = async (u: adminService.MemberWithDetails) => {
    setSelectedUser(u);
    setUpdatingTier(u.membership?.tier_id || tiers[0]?.id || 1);
    setDuration(1);
    setNotes('');
    try {
      const hist = await adminService.getMemberHistory(u.id);
      setHistory(hist);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminService.updateMemberTier(
        selectedUser.id,
        updatingTier,
        duration === 0 ? null : duration,
        notes || 'Manual update via admin dashboard',
        currentAdmin?.id || ''
      );
      showSuccess('Berhasil!', 'Berhasil mengubah paket membership!');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      showError('Gagal!', 'Gagal mengubah paket: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    const result = await showConfirm('Konfirmasi Suspend', 'Apakah anda yakin ingin men-suspend member ini?');
    if (!result.isConfirmed) return;
    setActionLoading(true);
    try {
      await adminService.suspendMember(selectedUser.id, currentAdmin?.id || '', notes || 'Suspended by admin');
      showSuccess('Berhasil!', 'Member berhasil di-suspend!');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      showError('Gagal!', 'Gagal men-suspend: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminService.activateMember(selectedUser.id, currentAdmin?.id || '');
      showSuccess('Berhasil!', 'Member berhasil diaktifkan kembali!');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      showError('Gagal!', 'Gagal mengaktifkan: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedUser) return;
    const result = await showConfirm(
      'Hapus Member',
      'PERINGATAN: Menghapus member akan menghapus semua profil dan data permanen. Lanjutkan?'
    );
    if (!result.isConfirmed) return;
    setActionLoading(true);
    try {
      await adminService.deleteMember(selectedUser.id);
      showSuccess('Berhasil!', 'Member berhasil dihapus!');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      showError('Gagal!', 'Gagal menghapus member: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Manajemen Member</h2>
          <p className="text-neutral-500 text-sm mt-1">Kelola tier dan status membership pengguna.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari nama..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 w-64" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider border-b border-neutral-200">
                <th className="px-6 py-4 font-medium">Nama Member</th>
                <th className="px-6 py-4 font-medium">Paket Langganan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Berakhir Pada</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-neutral-500">Tidak ada data member.</td></tr>
              ) : (
                users.map((u, i) => {
                  const tierName = u.membership?.tier?.name || 'Free';
                  const status = u.membership?.status || 'active';
                  const expires = u.membership?.expires_at ? new Date(u.membership.expires_at).toLocaleDateString('id-ID') : '-';
                  
                  return (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-900">{u.full_name || 'Tanpa Nama'}</div>
                        <div className="text-xs text-neutral-500">{u.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          tierName.toLowerCase() === 'premium' ? "bg-primary-100 text-primary-700" :
                          tierName.toLowerCase() === 'pro' ? "bg-secondary-100 text-secondary-600" :
                          tierName.toLowerCase() === 'basic' ? "bg-orange-100 text-orange-700" :
                          "bg-neutral-100 text-neutral-600"
                        )}>
                          {tierName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-1 rounded-md text-xs font-medium border capitalize", 
                          status === 'active' ? "bg-green-50 text-green-700 border-green-200" : 
                          status === 'expired' ? "bg-red-50 text-red-700 border-red-200" : 
                          "bg-yellow-50 text-yellow-700 border-yellow-200"
                        )}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{expires}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleOpenManageModal(u)}
                          className="text-[#7e3188] hover:text-[#682870] font-semibold text-xs border border-purple-200 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Kelola
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MANAGE USER MODAL --- */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-[#7e3188]" size={22} />
                  <h3 className="font-bold text-lg text-slate-800">Kelola Akun & Membership</h3>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* User Details */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-neutral-500 block">Nama Lengkap</span>
                    <span className="font-bold text-neutral-900">{selectedUser.full_name || 'Tanpa Nama'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 block">User ID</span>
                    <span className="font-mono text-xs block truncate">{selectedUser.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 block">Status Membership Saat Ini</span>
                    <span className="font-semibold capitalize text-neutral-800">{selectedUser.membership?.status || 'active'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 block">Paket Saat Ini</span>
                    <span className="font-semibold text-neutral-800">{selectedUser.membership?.tier?.name || 'Free'}</span>
                  </div>
                </div>

                {/* Form Update Paket */}
                <form onSubmit={handleUpdateTierSubmit} className="space-y-4">
                  <h4 className="font-bold text-sm text-neutral-700">Ubah Paket / Assign Manual</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Pilih Paket Tier</label>
                      <select 
                        value={updatingTier}
                        onChange={(e) => setUpdatingTier(Number(e.target.value))}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500"
                      >
                        {tiers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} (Level {t.level})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">Durasi Langganan</label>
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500"
                      >
                        <option value={1}>1 Bulan</option>
                        <option value={3}>3 Bulan</option>
                        <option value={6}>6 Bulan</option>
                        <option value={12}>1 Tahun</option>
                        <option value={0}>Selamanya (Free / Custom)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Catatan / Alasan</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tuliskan catatan perpanjangan atau alasan..."
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500 h-20"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="bg-[#7e3188] hover:bg-[#682870] text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      Update Paket
                    </button>
                  </div>
                </form>

                {/* Status Actions */}
                <div className="pt-4 border-t border-neutral-100">
                  <h4 className="font-bold text-sm text-neutral-700 mb-2">Tindakan Cepat Status</h4>
                  <div className="flex gap-2">
                    {selectedUser.membership?.status === 'suspended' ? (
                      <button 
                        onClick={handleActivate} 
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        Aktifkan Kembali
                      </button>
                    ) : (
                      <button 
                        onClick={handleSuspend} 
                        disabled={actionLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        Suspend Member
                      </button>
                    )}

                    <button 
                      onClick={handleDeleteMember}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 ml-auto disabled:opacity-50"
                    >
                      <Trash2 size={16} /> Hapus Akun
                    </button>
                  </div>
                </div>

                {/* History Logs */}
                <div className="pt-4 border-t border-neutral-100">
                  <h4 className="font-bold text-sm text-neutral-700 mb-2">Log Riwayat Membership</h4>
                  <div className="bg-neutral-50 rounded-xl border border-neutral-200 max-h-[150px] overflow-y-auto text-xs">
                    {history.length === 0 ? (
                      <div className="p-4 text-center text-neutral-400">Belum ada riwayat aktivitas.</div>
                    ) : (
                      <div className="divide-y divide-neutral-200">
                        {history.map((h, i) => (
                          <div key={i} className="p-3 flex justify-between items-start gap-4">
                            <div>
                              <div className="font-bold text-slate-800 capitalize">{h.change_type}</div>
                              <div className="text-neutral-500 text-[10px]">Dari: {h.from_tier?.name || '-'} → Ke: {h.to_tier?.name || '-'}</div>
                              {h.reason && <div className="text-neutral-600 mt-1 italic">"{h.reason}"</div>}
                            </div>
                            <div className="text-right flex-shrink-0 text-neutral-400 text-[10px]">
                              {new Date(h.created_at).toLocaleString('id-ID')}
                              {h.changed_by_profile && <div className="font-medium text-slate-700">Oleh: {h.changed_by_profile.full_name}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PackagesTab() {
  const [packages, setPackages] = useState<adminService.MembershipTier[]>([]);
  const [globalFeatures, setGlobalFeatures] = useState<adminService.Feature[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [editingPackage, setEditingPackage] = useState<Partial<adminService.MembershipTier> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPackages = () => {
    setLoading(true);
    Promise.all([adminService.getTiers(), adminService.getFeatures()])
      .then(([tiersData, featuresData]) => {
        setPackages(tiersData);
        setGlobalFeatures(featuresData.filter(f => f.is_active));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPackage({
      name: '',
      slug: '',
      level: 1,
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      features: [],
      is_active: true
    });
  };

  const handleToggleActive = async (pkg: adminService.MembershipTier) => {
    try {
      await adminService.toggleTierStatus(pkg.id, !pkg.is_active);
      fetchPackages();
    } catch (e: any) {
      showError('Gagal!', 'Gagal mengubah status paket: ' + e.message);
    }
  };

  const handleDeletePkg = async (id: number) => {
    const result = await showConfirm('Hapus Paket', 'Apakah anda yakin ingin menghapus paket ini?');
    if (!result.isConfirmed) return;
    try {
      await adminService.deleteTier(id);
      fetchPackages();
    } catch (e: any) {
      showError('Gagal!', 'Gagal menghapus paket: ' + e.message);
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setActionLoading(true);
    try {
      const payload: any = {
        name: editingPackage.name || '',
        slug: editingPackage.slug || (editingPackage.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
        level: Number(editingPackage.level) || 0,
        description: editingPackage.description || '',
        price_monthly: Number(editingPackage.price_monthly) || 0,
        price_yearly: Number(editingPackage.price_yearly) || 0,
        features: Array.isArray(editingPackage.features) ? editingPackage.features : [],
        is_active: editingPackage.is_active ?? true
      };

      if (editingPackage.id) {
        await adminService.updateTier(editingPackage.id, payload);
        showSuccess('Berhasil!', 'Berhasil memperbarui paket!');
      } else {
        await adminService.createTier(payload);
        showSuccess('Berhasil!', 'Berhasil membuat paket baru!');
      }
      setEditingPackage(null);
      fetchPackages();
    } catch (e: any) {
      showError('Gagal!', 'Gagal menyimpan paket: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Paket Membership</h2>
          <p className="text-neutral-500 text-sm mt-1">Konfigurasi tier dan harga paket.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#7e3188] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-[#682870] shadow-sm transition-all"
        >
          <Plus size={18} /> Buat Paket Baru
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full text-center py-8 text-neutral-500">Belum ada data paket.</div>
          ) : packages.map((pkg, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-neutral-900">{pkg.name}</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setEditingPackage(pkg)}
                      className="text-neutral-400 hover:text-[#7e3188] p-1"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeletePkg(pkg.id)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#7e3188] mb-1">Rp {pkg.price_monthly.toLocaleString('id-ID')}<span className="text-sm text-neutral-400 font-normal">/bln</span></p>
                <p className="text-sm text-neutral-500 mb-6 line-clamp-3">{pkg.description || 'Tidak ada deskripsi'}</p>
              </div>
              
              <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-xs font-medium text-neutral-500">Status Paket</span>
                <div 
                  onClick={() => handleToggleActive(pkg)}
                  className={clsx("w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200", pkg.is_active ? "bg-[#7e3188]" : "bg-neutral-300")}
                >
                  <div className={clsx("absolute top-1 bg-white w-3 h-3 rounded-full transition-all duration-200", pkg.is_active ? "right-1" : "left-1")}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CREATE / EDIT PACKAGE MODAL --- */}
      <AnimatePresence>
        {editingPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">{editingPackage.id ? 'Edit Paket Membership' : 'Buat Paket Baru'}</h3>
                <button onClick={() => setEditingPackage(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Nama Paket</label>
                    <input 
                      type="text" 
                      required
                      value={editingPackage.name || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                      placeholder="e.g. Premium Premium"
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Slug</label>
                    <input 
                      type="text" 
                      value={editingPackage.slug || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, slug: e.target.value })}
                      placeholder="e.g. premium-tier"
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Level (0-3)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      max={3}
                      value={editingPackage.level ?? 1}
                      onChange={(e) => setEditingPackage({ ...editingPackage, level: Number(e.target.value) })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Harga Bulanan</label>
                    <input 
                      type="number" 
                      required
                      value={editingPackage.price_monthly ?? 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price_monthly: Number(e.target.value) })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Harga Tahunan</label>
                    <input 
                      type="number" 
                      required
                      value={editingPackage.price_yearly ?? 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price_yearly: Number(e.target.value) })}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Deskripsi</label>
                  <textarea 
                    value={editingPackage.description || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500 h-20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2 pl-1">Fitur yang Dapat Diakses</label>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 space-y-2.5 max-h-[160px] overflow-y-auto">
                    {globalFeatures.map((feat) => {
                      const currentFeatures = editingPackage.features || [];
                      const isChecked = currentFeatures.includes(feat.key) || currentFeatures.includes(feat.label);
                      
                      const handleToggleFeature = () => {
                        let newFeatures: string[] = [];
                        const hasKey = currentFeatures.includes(feat.key);
                        const hasLabel = currentFeatures.includes(feat.label);
                        
                        if (hasKey || hasLabel) {
                          newFeatures = currentFeatures.filter(f => f !== feat.key && f !== feat.label);
                        } else {
                          newFeatures = [...currentFeatures, feat.key];
                        }
                        
                        setEditingPackage({
                          ...editingPackage,
                          features: newFeatures
                        });
                      };

                      return (
                        <div key={feat.id} className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-b-0">
                          <div className="pr-4">
                            <span className="text-sm font-semibold text-neutral-800 block leading-tight">{feat.label}</span>
                            <span className="text-[10px] text-neutral-500 block mt-0.5 leading-snug">{feat.description || 'Tidak ada deskripsi'}</span>
                          </div>
                          <div 
                            onClick={handleToggleFeature}
                            className={clsx("w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 shrink-0", isChecked ? "bg-[#7e3188]" : "bg-neutral-300")}
                          >
                            <div className={clsx("absolute top-[3px] bg-white w-[14px] h-[14px] rounded-full transition-all duration-200", isChecked ? "right-1" : "left-1")}></div>
                          </div>
                        </div>
                      );
                    })}
                    {globalFeatures.length === 0 && (
                      <div className="text-xs text-neutral-400 text-center py-4">Belum ada master fitur aktif.</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-neutral-600">Aktifkan Paket Langsung</span>
                  <input 
                    type="checkbox" 
                    checked={editingPackage.is_active ?? true}
                    onChange={(e) => setEditingPackage({ ...editingPackage, is_active: e.target.checked })}
                    className="w-5 h-5 accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingPackage(null)}
                    className="border border-neutral-200 text-neutral-600 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="bg-[#7e3188] hover:bg-[#682870] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeaturesTab() {
  const [features, setFeatures] = useState<adminService.Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFeature, setEditingFeature] = useState<Partial<adminService.Feature> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFeatures = () => {
    setLoading(true);
    adminService.getFeatures().then(data => {
      setFeatures(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleOpenCreate = () => {
    setEditingFeature({
      key: '',
      label: '',
      description: '',
      category: 'access',
      input_type: 'toggle',
      sort_order: 0,
      is_active: true
    });
  };

  const handleToggleActive = async (f: adminService.Feature) => {
    try {
      await adminService.toggleFeatureStatus(f.id, !f.is_active);
      fetchFeatures();
    } catch (e: any) {
      showError('Gagal!', 'Gagal mengubah status fitur: ' + e.message);
    }
  };

  const handleDeleteFeature = async (id: number) => {
    const result = await showConfirm('Hapus Fitur', 'Apakah anda yakin ingin menghapus fitur master ini?');
    if (!result.isConfirmed) return;
    try {
      await adminService.deleteFeature(id);
      fetchFeatures();
    } catch (e: any) {
      showError('Gagal!', 'Gagal menghapus fitur: ' + e.message);
    }
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;
    setActionLoading(true);
    try {
      const payload: any = {
        key: editingFeature.key || (editingFeature.label || '').toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label: editingFeature.label || '',
        description: editingFeature.description || '',
        category: editingFeature.category || 'access',
        input_type: editingFeature.input_type || 'toggle',
        sort_order: Number(editingFeature.sort_order) || 0,
        is_active: editingFeature.is_active ?? true
      };

      if (editingFeature.id) {
        await adminService.updateFeature(editingFeature.id, payload);
        showSuccess('Berhasil!', 'Berhasil memperbarui fitur!');
      } else {
        await adminService.createFeature(payload);
        showSuccess('Berhasil!', 'Berhasil menambahkan fitur baru!');
      }
      setEditingFeature(null);
      fetchFeatures();
    } catch (e: any) {
      showError('Gagal!', 'Gagal menyimpan fitur: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Master Fitur</h2>
          <p className="text-neutral-500 text-sm mt-1">Daftar fitur yang dapat di-assign ke paket membership.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#7e3188] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-[#682870] shadow-sm transition-all"
        >
          <Plus size={18} /> Tambah Fitur
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider border-b border-neutral-200">
                <th className="px-6 py-4 font-medium">Nama Fitur</th>
                <th className="px-6 py-4 font-medium">Status Global</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {features.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-neutral-500">Belum ada master fitur.</td></tr>
              ) : (
                features.map((f, i) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-800">{f.label}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-md text-xs font-medium border", 
                        f.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-neutral-100 text-neutral-500 border-neutral-200"
                      )}>
                        {f.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => setEditingFeature(f)}
                          className="text-neutral-400 hover:text-[#7e3188] p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(f)}
                          className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                            f.is_active ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          )}
                        >
                          {f.is_active ? 'Matikan' : 'Aktifkan'}
                        </button>
                        <button 
                          onClick={() => handleDeleteFeature(f.id)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- CREATE / EDIT FEATURE MODAL --- */}
      <AnimatePresence>
        {editingFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">{editingFeature.id ? 'Edit Fitur Master' : 'Tambah Fitur Master Baru'}</h3>
                <button onClick={() => setEditingFeature(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveFeature} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Fitur</label>
                  <input 
                    type="text" 
                    required
                    value={editingFeature.label || ''}
                    onChange={(e) => setEditingFeature({ ...editingFeature, label: e.target.value })}
                    placeholder="Contoh: Akses Basic Chat AI"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <div>
                    <span className="text-sm font-bold text-neutral-800 block">Status Fitur</span>
                    <span className="text-xs text-neutral-500">Aktifkan untuk menampilkan fitur ini</span>
                  </div>
                  <div 
                    onClick={() => setEditingFeature({ ...editingFeature, is_active: !(editingFeature.is_active ?? true) })}
                    className={clsx("w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 shrink-0", (editingFeature.is_active ?? true) ? "bg-[#7e3188]" : "bg-neutral-300")}
                  >
                    <div className={clsx("absolute top-1 bg-white w-4 h-4 rounded-full transition-all duration-200", (editingFeature.is_active ?? true) ? "right-1" : "left-1")}></div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingFeature(null)}
                    className="border border-neutral-200 text-neutral-600 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="bg-[#7e3188] hover:bg-[#682870] text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SettingsTab() {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    adminService.getAppSettings()
      .then(data => {
        setEmail(data.support_email);
        setWhatsapp(data.support_whatsapp);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await adminService.updateAppSettings({ support_email: email, support_whatsapp: whatsapp });
      setMessage({ type: 'success', text: 'Pengaturan berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan pengaturan' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Pengaturan Platform</h2>
      
      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm max-w-xl">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Pusat Bantuan & Dukungan</h3>
          
          {message.text && (
            <div className={clsx(
              "p-4 rounded-xl mb-4 text-sm font-semibold border",
              message.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            )}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider pl-1">Email Support</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: support@qalbie.id"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-200" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider pl-1">Link / Nomor WhatsApp Support</label>
              <input 
                type="text" 
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: https://wa.me/6281234567890 atau 6281234567890"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-200" 
              />
              <span className="text-[10px] text-neutral-400 pl-1 mt-1 block">Masukkan link WhatsApp lengkap atau nomor telepon dengan kode negara (contoh: 62812xxx)</span>
            </div>
            
            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-[#7e3188] hover:bg-[#682870] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all"
              >
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}

function ContentsTab() {
  const [contents, setContents] = useState<adminService.AdminContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [editingContent, setEditingContent] = useState<Partial<adminService.AdminContent> | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchContents = () => {
    setLoading(true);
    adminService.getAdminContents().then(data => {
      setContents(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleOpenCreate = () => {
    setEditingContent({
      title: '',
      body: '',
      media_url: '',
      media_type: 'image'
    });
    setUploadFile(null);
    setPreviewUrl(null);
  };

  const handleOpenEdit = (content: adminService.AdminContent) => {
    setEditingContent(content);
    setUploadFile(null);
    setPreviewUrl(content.media_url);
  };

  const handleDeleteContent = async (id: number) => {
    const result = await showConfirm('Hapus Konten', 'Apakah anda yakin ingin menghapus konten ini?');
    if (!result.isConfirmed) return;
    try {
      await adminService.deleteAdminContent(id);
      showSuccess('Berhasil', 'Konten berhasil dihapus');
      fetchContents();
    } catch (e: any) {
      showError('Gagal', 'Gagal menghapus konten: ' + e.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      if (file.type.startsWith('video/')) {
        setEditingContent(prev => ({ ...prev, media_type: 'video' }));
      } else {
        setEditingContent(prev => ({ ...prev, media_type: 'image' }));
      }
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContent) return;
    setActionLoading(true);

    try {
      let finalMediaUrl = editingContent.media_url;

      if (uploadFile) {
        finalMediaUrl = await adminService.uploadAdminContentMedia(uploadFile);
      }

      const payload = {
        title: editingContent.title || '',
        body: editingContent.body || '',
        media_url: finalMediaUrl || null,
        media_type: finalMediaUrl ? (editingContent.media_type || 'image') : null
      };

      if (editingContent.id) {
        await adminService.updateAdminContent(editingContent.id, payload);
        showSuccess('Berhasil!', 'Konten berhasil diperbarui!');
      } else {
        await adminService.createAdminContent(payload);
        showSuccess('Berhasil!', 'Konten baru berhasil ditambahkan!');
      }

      setEditingContent(null);
      fetchContents();
    } catch (err: any) {
      showError('Gagal!', 'Gagal menyimpan konten: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Manajemen Konten</h2>
          <p className="text-neutral-500 text-sm mt-1">Kelola konten, foto, dan video untuk halaman admin.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#7e3188] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-[#682870] shadow-sm transition-all"
        >
          <Plus size={18} /> Tambah Konten
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : contents.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-neutral-200 text-center shadow-sm">
            <FileText className="mx-auto text-neutral-300 mb-3" size={48} />
            <p className="text-neutral-500 font-medium">Belum ada konten yang dibuat.</p>
          </div>
        ) : (
          contents.map(content => (
            <div key={content.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
              {content.media_url ? (
                <div className="aspect-video w-full bg-neutral-100 relative group">
                  {content.media_type === 'video' ? (
                    <>
                      <video src={content.media_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="text-white opacity-80" size={32} />
                      </div>
                    </>
                  ) : (
                    <img src={content.media_url} alt={content.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold uppercase backdrop-blur-sm">
                    {content.media_type}
                  </div>
                </div>
              ) : (
                <div className="aspect-video w-full bg-neutral-50 flex items-center justify-center">
                  <FileText className="text-neutral-300" size={32} />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-neutral-900 text-lg mb-2 line-clamp-1">{content.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-3 mb-4 flex-1 whitespace-pre-wrap">{content.body}</p>
                <div className="flex justify-between items-center pt-4 border-t border-neutral-100 mt-auto">
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {new Date(content.created_at).toLocaleDateString('id-ID')}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEdit(content)} className="p-1.5 text-neutral-400 hover:text-[#7e3188] transition-colors bg-neutral-50 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteContent(content.id)} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors bg-neutral-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {editingContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="text-[#7e3188]" size={22} />
                  <h3 className="font-bold text-lg text-slate-800">{editingContent.id ? 'Edit Konten' : 'Buat Konten Baru'}</h3>
                </div>
                <button onClick={() => setEditingContent(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveContent} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider pl-1">Judul Konten</label>
                  <input 
                    type="text" 
                    required
                    value={editingContent.title || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                    placeholder="Masukkan judul..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider pl-1">Isi Teks / Deskripsi</label>
                  <textarea 
                    value={editingContent.body || ''}
                    onChange={(e) => setEditingContent({ ...editingContent, body: e.target.value })}
                    placeholder="Tuliskan isi konten..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-200 h-32"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider pl-1">Media (Foto/Video)</label>
                  
                  {previewUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center mb-3 group">
                      {editingContent.media_type === 'video' ? (
                        <video src={previewUrl} controls className="max-h-64 object-contain w-full" />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="max-h-64 object-contain w-full" />
                      )}
                      
                      <button 
                        type="button"
                        onClick={() => {
                          setUploadFile(null);
                          setPreviewUrl(null);
                          setEditingContent({ ...editingContent, media_url: null, media_type: null });
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors">
                      <Upload className="mx-auto text-neutral-400 mb-3" size={32} />
                      <p className="text-sm font-medium text-neutral-600 mb-1">Klik untuk mengunggah foto atau video</p>
                      <p className="text-xs text-neutral-400 mb-4">Format: JPG, PNG, MP4, WebM (Max 50MB)</p>
                      <label className="bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm cursor-pointer hover:bg-neutral-50 inline-block">
                        Pilih File
                        <input 
                          type="file" 
                          accept="image/*,video/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-neutral-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingContent(null)}
                    className="border border-neutral-200 text-neutral-600 px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-neutral-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="bg-[#7e3188] hover:bg-[#682870] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Menyimpan...' : 'Simpan Konten'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
