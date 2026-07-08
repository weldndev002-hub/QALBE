import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
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
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
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
            <p className="text-sm font-medium text-slate-500">
              Belum punya akun? <Link to="/register" className="font-bold text-[#FF5D8F] hover:underline">Daftar sekarang</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
