import { useEffect } from 'react';
import AppRouter from './router';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { getCurrentUserRole } from './services/adminService';

function App() {
  const { login, logout } = useAuthStore() as any;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const role = await getCurrentUserRole(session.user);
          login(session.user, session.access_token, role);
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [login, logout]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <AppRouter />
    </div>
  );
}

export default App;
