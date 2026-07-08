import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mendaftar dengan Google.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 font-sans">
      <header className="px-4 py-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-neutral-700 hover:bg-neutral-100">
          <ArrowLeft size={20} />
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-6 flex flex-col justify-center pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Buat Akun Baru</h1>
          <p className="text-neutral-500 mb-8">Bergabunglah dan temukan ruang aman untuk kesehatan mentalmu.</p>

          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="w-full space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border border-gray-200 text-gray-700 font-semibold text-[17px] py-4 rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
              {isLoading ? 'Memproses...' : 'Lanjutkan dengan Google'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600">
              Sudah punya akun? <Link to="/login" className="font-bold text-primary-600 hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
