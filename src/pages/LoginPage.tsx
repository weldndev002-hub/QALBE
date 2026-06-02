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

    // Daftar email admin khusus yang diizinkan untuk bypass/auto-inject
    const allowedAdminEmails = ['carx2254@gmail.com', 'acepali2253@gmail.com', 'admin@qalbie.id'];

    if (allowedAdminEmails.includes(email.toLowerCase()) && password === 'Test1234.') {
      const userData = {
        id: 'mock-admin-id-' + email.split('@')[0],
        name: 'Admin ' + email.split('@')[0],
        email: email,
        tier: 'Premium',
      };
      login(userData, 'mock-admin-token', 'super_admin');
      navigate('/admin');
      setIsLoading(false);
      return;
    }

    try {
      let authData;
      let authError;

      // Coba masuk (sign in) terlebih dahulu
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        authData = data;
        authError = error;
      } catch (err: any) {
        authError = err;
      }

      // Daftar email admin khusus yang diizinkan untuk bypass/auto-inject
      const allowedAdminEmails = ['carx2254@gmail.com', 'acepali2253@gmail.com', 'admin@qalbie.id'];

      // Jika gagal login dan email termasuk dalam daftar admin khusus, lakukan registrasi otomatis (inject)
      if (authError && allowedAdminEmails.includes(email)) {
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: 'Admin Qalbie' }
            }
          });
          
          if (!signUpError && signUpData.user) {
            // Jika berhasil registrasi, coba login kembali
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ email, password });
            authData = retryData;
            authError = retryError;
          } else {
            // Jika sign up gagal, gunakan error aslinya
            if (signUpError) authError = signUpError;
          }
        } catch (signUpErr: any) {
          authError = signUpErr;
        }
      }

      if (authError) throw authError;
      if (!authData || !authData.user || !authData.session) {
        throw new Error('Gagal memproses session login.');
      }

      const userId = authData.user.id;

      // Fetch role dari user_roles table dengan fallback jika tabel belum ada
      let role = 'user';
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (!roleError && roleData) {
          role = roleData.role;
        } else {
          if (allowedAdminEmails.includes(email)) {
            role = 'super_admin';
          }
        }
      } catch (err) {
        if (allowedAdminEmails.includes(email)) {
          role = 'super_admin';
        }
      }

      const userData = {
        id: userId,
        name: authData.user.user_metadata?.full_name || email.split('@')[0],
        email: authData.user.email,
        tier: 'Free',
      };

      login(userData, authData.session.access_token, role);

      if (role === 'super_admin' || role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
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
