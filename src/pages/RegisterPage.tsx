import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore() as any;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Setelah mendaftar, arahkan ke onboarding untuk melengkapi profil
    login({ name: name, tier: 'premium' }, 'dummy-jwt-token');
    navigate('/onboarding');
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">Nama Panggilan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 pl-11 pr-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                  placeholder="Ukhti"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 pl-11 pr-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                  placeholder="ukhti@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 pl-11 pr-12 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none transition-all"
                  placeholder="Minimal 8 karakter"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-full mt-6 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
              Daftar Sekarang
            </button>
          </form>

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
