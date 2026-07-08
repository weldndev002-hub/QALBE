import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const emailNorm = email.trim().toLowerCase();

    // ── HANYA carx2254@gmail.com yang mendapat akses Super Admin (MOCK) ──
    if (emailNorm === 'carx2254@gmail.com' && password === 'Test1234.') {
      const userData = {
        id: 'mock-admin-id-carx',
        name: 'Super Admin',
        email: email.trim(),
        tier: 'Premium',
      };
      login(userData, 'mock-admin-token', 'super_admin');
      navigate('/admin');
      setIsLoading(false);
      return;
    }

    // ── Login Admin dengan Supabase ──
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (!data.user || !data.session) throw new Error('Gagal memproses session login.');

      const userData = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || email.trim().split('@')[0],
        email: data.user.email,
        tier: 'Free',
      };

      // Role check is done in App.tsx / AdminPage.tsx anyway, but we log them in
      login(userData, data.session.access_token, 'admin');
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg('Akses ditolak. Periksa kembali kredensial Admin Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 font-sans relative overflow-hidden">
      {/* Dark mode background effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-primary-600/10 rounded-full blur-3xl"></div>
      
      <main className="flex-1 w-full max-w-md mx-auto px-8 flex flex-col justify-center relative z-10 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 shadow-lg">
            <ShieldAlert size={32} className="text-primary-400" />
          </div>

          <div className="flex flex-col items-center text-center mb-10 w-full">
            <h1 className="text-2xl font-bold text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-400 text-sm">Masuk menggunakan kredensial administrator</p>
          </div>

          {errorMsg && (
            <div className="w-full mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="w-full space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-500"
                  placeholder="Email Admin"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock size={20} />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-500"
                  placeholder="Kata Sandi"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? 'Memproses...' : 'Login Admin'}
            </button>
          </form>

          <button 
            onClick={() => navigate('/login')}
            className="mt-8 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Kembali ke halaman utama
          </button>
        </motion.div>
      </main>
    </div>
  );
}
