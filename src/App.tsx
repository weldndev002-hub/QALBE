import { useEffect } from 'react';
import AppRouter from './router';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { getCurrentUserRole } from './services/adminService';

function App() {
  const { login, logout, setInitialized, isInitialized } = useAuthStore() as any;

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const role = await getCurrentUserRole();
          if (mounted) login(session.user, session.access_token, role);
        }
      } catch (e) {
        console.error('Session error:', e);
      } finally {
        if (mounted) setInitialized(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user && mounted) {
          const role = await getCurrentUserRole();
          if (mounted) login(session.user, session.access_token, role);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) logout();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [login, logout, setInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-[#7e3188] font-bold">
        <span className="animate-pulse">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <AppRouter />
    </div>
  );
}

export default App;
