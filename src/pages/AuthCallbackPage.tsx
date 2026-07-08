import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Memproses...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase akan otomatis membaca token dari URL hash/query string
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          setStatus('success');
          setMessage('Berhasil masuk! Mengalihkan ke halaman utama...');
          setTimeout(() => navigate('/membership'), 2000);
        } else {
          // Coba exchange token dari URL
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );
          if (exchangeError) throw exchangeError;

          setStatus('success');
          setMessage('Berhasil masuk! Mengalihkan ke halaman utama...');
          setTimeout(() => navigate('/membership'), 2000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage('Gagal masuk. Silakan coba lagi.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center px-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-600 font-medium">{message}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
            <h1 className="text-xl font-bold text-neutral-800">Berhasil!</h1>
            <p className="text-neutral-500">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">❌</div>
            <h1 className="text-xl font-bold text-neutral-800">Gagal</h1>
            <p className="text-neutral-500">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
