import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pastikan aplikasi tidak crash saat proses build jika env belum diset dengan sempurna,
// Tetapi akan memberikan error saat mencoba digunakan.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Konfigurasi Supabase tidak ditemukan. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diset di dalam file .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder_anon_key'
);
