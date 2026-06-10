import { useEffect } from 'react';
import AppRouter from './router';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { getCurrentUserRole } from './services/adminService';

function App() {
  const { login, logout, role: currentRole } = useAuthStore() as any;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const dbRole = await getCurrentUserRole(session.user);
          const finalRole = dbRole || currentRole || 'user';
          
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Sobat',
            avatar: session.user.user_metadata?.avatar_url,
          };
          login(userData, session.access_token, finalRole);
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
