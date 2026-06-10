import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const emailNorm = email.trim().toLowerCase();

    // ── HANYA carx2254@gmail.com yang mendapat akses Super Admin ──
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

    // ── Semua akun lain → login biasa via Supabase, role selalu user ──
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Pesan error lebih ramah untuk email belum diverifikasi
        if (error.message.toLowerCase().includes('email not confirmed')) {
          throw new Error('Email kamu belum diverifikasi. Silakan cek kotak masuk (atau folder Spam) dan klik link verifikasi yang dikirim saat daftar.');
        }
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Gagal memproses session login.');
      }

      const userData = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || email.trim().split('@')[0],
        email: data.user.email,
        tier: 'Free',
      };

      login(userData, data.session.access_token, 'user');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5F8] font-sans relative overflow-hidden">
      {/* Soft Background Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-pink-300/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-purple-300/20 rounded-full blur-3xl opacity-60"></div>

      <main className="flex-1 w-full max-w-md mx-auto px-8 flex flex-col justify-center relative z-10 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          
          <div className="flex flex-col items-center text-center mb-10 w-full">
            <h1 className="text-3xl font-display font-extrabold text-[#1E293B] mb-3 leading-tight">
              Masuk dan temukan <br/>
              <span className="text-[#FF5D8F]">ketenanganmu</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">Masuk untuk melanjutkan perjalanan bersama Qalbie</p>
          </div>

          {errorMsg && (
            <div className="w-full mb-6 bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white rounded-full py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-[#FF5D8F]/50 transition-all font-medium text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] placeholder:text-slate-400"
                  placeholder="Email atau Nomor Telepon"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white rounded-full py-4 pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-[#FF5D8F]/50 transition-all font-medium text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] placeholder:text-slate-400"
                  placeholder="Kata Sandi"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-[#FF5D8F] transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right pt-1 pb-4">
              <Link to="#" className="text-sm font-bold text-slate-500 hover:text-[#FF5D8F] transition-colors">Lupa Kata Sandi?</Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#FF5D8F] text-white font-bold text-[17px] py-4 rounded-full hover:bg-[#F04A7D] transition-all shadow-[0_8px_20px_rgba(255,93,143,0.3)] disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Belum punya akun? <Link to="/register" className="font-bold text-[#FF5D8F] hover:underline">Daftar sekarang</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
