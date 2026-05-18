import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Heart, Headphones, User, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore() as any;
  const { clearSession } = useChatStore() as any;

  const tabs = [
    { name: 'Beranda', path: '/dashboard', icon: Home },
    { name: 'Curhat AI', path: '/chat', icon: MessageCircle },
    { name: 'Mood Tracker', path: '/mood', icon: Heart },
    { name: 'Audio Terapi', path: '/audio', icon: Headphones },
    { name: 'Profil', path: '/profil', icon: User },
  ];

  const handleLogout = () => {
    logout();
    clearSession();
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-neutral-200 h-screen sticky top-0 shrink-0">
      <div className="p-8 pb-4">
        <Link to="/dashboard" className="text-3xl font-display font-bold text-primary-600 tracking-tight">QALBIE</Link>
        <p className="text-sm text-neutral-500 mt-1">Ruang Aman Muslimah</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={clsx(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium text-[15px]",
                isActive 
                  ? "bg-primary-50 text-primary-600 shadow-sm" 
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {tab.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
         <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 w-full text-left rounded-2xl transition-all font-medium text-red-600 hover:bg-red-50">
            <LogOut size={22} />
            Keluar Akun
         </button>
      </div>
    </aside>
  );
}
