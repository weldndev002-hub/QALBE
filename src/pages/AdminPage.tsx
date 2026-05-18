import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, Activity, LogOut, TrendingUp, ShieldAlert, FileText, Search, Plus, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore() as any;
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'Kelola Pengguna', icon: Users },
    { id: 'transactions', label: 'Transaksi', icon: DollarSign },
    { id: 'content', label: 'Konten Audio & Artikel', icon: FileText },
    { id: 'moderation', label: 'Moderasi AI', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white tracking-tight">QALBIE <span className="text-primary-400">Admin</span></h1>
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
          {activeTab === 'transactions' && <TransactionsTab key="transactions" />}
          {activeTab === 'content' && <ContentTab key="content" />}
          {activeTab === 'moderation' && <ModerationTab key="moderation" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ================= KOMPONEN TAB =================

function DashboardTab() {
  const statCards = [
    { title: 'Total Pengguna', value: '1,248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12% bulan ini' },
    { title: 'Pendapatan (Bulan Ini)', value: 'Rp 14.5M', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+5% bulan ini' },
    { title: 'Sesi Chat Aktif', value: '342', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-100', trend: 'Sedang berlangsung' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Ringkasan performa platform hari ini.</p>
        </div>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          Hari ini: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} /> Naik
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1 mb-2">{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.trend}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function UsersTab() {
  const users = [
    { name: 'Nabila', email: 'nabila@example.com', tier: 'Premium', join: '12 Mei 2026', status: 'Aktif' },
    { name: 'Aisyah', email: 'aisyah@example.com', tier: 'Basic', join: '10 Mei 2026', status: 'Aktif' },
    { name: 'Putri', email: 'putri.k@example.com', tier: 'Gratis', join: '08 Mei 2026', status: 'Aktif' },
    { name: 'Fatimah', email: 'fati@example.com', tier: 'Gratis', join: '01 Mei 2026', status: 'Suspend' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kelola Pengguna</h2>
          <p className="text-slate-500 text-sm mt-1">Manajemen basis data pengguna terdaftar.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari nama atau email..." className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 w-64" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4 font-medium">Nama Pengguna</th>
              <th className="px-6 py-4 font-medium">Paket Langganan</th>
              <th className="px-6 py-4 font-medium">Bergabung</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase", u.tier === 'Premium' ? "bg-secondary-100 text-secondary-700" : u.tier === 'Basic' ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-600")}>
                    {u.tier}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{u.join}</td>
                <td className="px-6 py-4">
                  <span className={clsx("px-2 py-1 rounded-md text-xs font-medium border", u.status === 'Aktif' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-slate-400 hover:text-primary-600"><MoreVertical size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function TransactionsTab() {
  const trans = [
    { id: 'TRX-9921', user: 'Nabila', amount: 'Rp 49.000', method: 'GoPay', status: 'Berhasil', date: 'Hari Ini, 10:45' },
    { id: 'TRX-9920', user: 'Aisyah', amount: 'Rp 29.000', method: 'Bank Transfer', status: 'Berhasil', date: 'Kemarin, 14:20' },
    { id: 'TRX-9919', user: 'Dian', amount: 'Rp 49.000', method: 'ShopeePay', status: 'Pending', date: 'Kemarin, 09:10' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Data Transaksi</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4 font-medium">ID Transaksi</th>
              <th className="px-6 py-4 font-medium">Pengguna</th>
              <th className="px-6 py-4 font-medium">Nominal & Metode</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {trans.map((t, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{t.id}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{t.user}</td>
                <td className="px-6 py-4">
                  <div className="font-bold">{t.amount}</div>
                  <div className="text-xs text-slate-500">{t.method}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={clsx("inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border", t.status === 'Berhasil' ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                    {t.status === 'Berhasil' ? <CheckCircle2 size={12} /> : <Activity size={12} />} {t.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ContentTab() {
  const contents = [
    { id: 'C-001', title: 'Dzikir Pagi Penenang Hati', type: 'Audio', category: 'Dzikir', tier: 'Gratis', date: '12 Mei 2026', views: '1.2K' },
    { id: 'C-002', title: 'Refleksi: Melepaskan Beban', type: 'Audio', category: 'Refleksi', tier: 'Premium', date: '10 Mei 2026', views: '840' },
    { id: 'C-003', title: 'Mengatasi Rasa Cemas di Tempat Kerja', type: 'Artikel', category: 'Karier', tier: 'Gratis', date: '05 Mei 2026', views: '2.5K' },
    { id: 'C-004', title: 'Suara Alam & Hujan Tropis', type: 'Audio', category: 'Alam', tier: 'Premium', date: '01 Mei 2026', views: '500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Konten</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola Audio Terapi dan Artikel Edukasi.</p>
        </div>
        <button className="bg-primary-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-primary-700 shadow-sm transition-all">
          <Plus size={18} /> Tambah Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4 font-medium">Judul Konten</th>
              <th className="px-6 py-4 font-medium">Tipe</th>
              <th className="px-6 py-4 font-medium">Kategori</th>
              <th className="px-6 py-4 font-medium">Akses</th>
              <th className="px-6 py-4 font-medium">Diputar/Dibaca</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {contents.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 line-clamp-1">{c.title}</div>
                  <div className="text-xs text-slate-500 mt-1">Diupload: {c.date}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("inline-flex px-2.5 py-1 rounded-md text-xs font-bold border", c.type === 'Audio' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200")}>
                     {c.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">
                  {c.category}
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", c.tier === 'Premium' ? "bg-secondary-100 text-secondary-700" : "bg-slate-100 text-slate-600")}>
                    {c.tier}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                  {c.views}x
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary-600 transition-colors p-1"><MoreVertical size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ModerationTab() {
  const flags = [
    { user: 'Anonim #401', issue: 'Indikasi Self-Harm', aiResponse: 'Intervensi darurat, memberikan kontak hotline pencegahan bunuh diri (119 ext 8).', status: 'Aman' },
    { user: 'Anonim #392', issue: 'Pertanyaan Medis Kritis', aiResponse: 'Menolak memberikan resep obat, menyarankan dokter klinis.', status: 'Aman' },
    { user: 'Anonim #104', issue: 'Prompt Injection', aiResponse: 'AI menolak instruksi untuk mengabaikan prompt dasar islami.', status: 'Perlu Review' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Moderasi & Keamanan AI</h2>
      
      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
        <ShieldAlert size={20} className="mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">Sistem Deteksi Anomali Aktif</p>
          <p>Terdapat 1 percakapan yang ditandai (flagged) memerlukan review manual dari administrator hari ini.</p>
        </div>
      </div>

      <div className="space-y-4">
        {flags.map((f, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-800">{f.issue}</span>
                <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", f.status === 'Aman' ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700")}>{f.status}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Terdeteksi pada interaksi {f.user}</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="font-medium">Tindakan AI:</span> {f.aiResponse}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {f.status === 'Perlu Review' ? (
                <>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-200">Abaikan</button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700">Tinjau Transkrip</button>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">Diselesaikan otomatis</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
