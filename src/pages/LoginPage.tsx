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
    <div className="flex flex-col min-h-screen bg-primary-100 font-sans relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[40%] bg-primary-400 rounded-[100%] opacity-80" style={{ borderBottomLeftRadius: '50%', borderBottomRightRadius: '100%' }}></div>
      <div className="absolute top-[-15%] right-[-10%] w-[80%] h-[35%] bg-primary-400 rounded-full opacity-80"></div>
      
      <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[30%] bg-primary-400 rounded-full opacity-80"></div>
      <div className="absolute bottom-[-15%] right-[-20%] w-[100%] h-[40%] bg-primary-400 rounded-[100%] opacity-80" style={{ borderTopLeftRadius: '100%' }}></div>

      <main className="flex-1 w-full max-w-md mx-auto px-8 flex flex-col justify-center relative z-10 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          
          {/* Logo */}
          <div className="flex items-center justify-center mb-10 relative">
            <div className="relative flex items-center justify-center text-primary-600">
               <img src="/LOGO%20SVG/QALBIE%20VERTIKAL%20PINK.svg" alt="Qalbie Logo" className="h-16" />
            </div>
          </div>

          {errorMsg && (
            <div className="w-full mb-6 bg-red-50/90 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium z-10 backdrop-blur-sm shadow-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2 pl-2">Email/Nomor Telepon</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-300">
                  <Mail size={20} fill="currentColor" className="text-neutral-300" />
                </div>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#7e3188]/30 transition-all font-medium text-neutral-800"
                  placeholder=""
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2 pl-2">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-300">
                  <Lock size={20} fill="currentColor" className="text-neutral-300" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white rounded-full py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#7e3188]/30 transition-all font-medium text-neutral-800"
                  placeholder=""
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-300 hover:text-neutral-500 transition-colors"
                >
                  {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link to="#" className="text-sm font-bold text-neutral-900 hover:underline">Lupa Kata Sandi?</Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#7e3188] text-white font-semibold text-lg py-3.5 rounded-full mt-4 hover:bg-[#682870] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-900">
              Tidak Memiliki Akun? <Link to="/register" className="font-bold hover:underline">Daftar sekarang</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
