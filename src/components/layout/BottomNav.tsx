import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Heart, Headphones, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const location = useLocation();
  const tabs = [
    { name: 'Beranda', path: '/dashboard', icon: Home },
    { name: 'Curhat', path: '/chat', icon: MessageCircle },
    { name: 'Mood', path: '/mood', icon: Heart },
    { name: 'Audio', path: '/audio', icon: Headphones },
    { name: 'Profil', path: '/profil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-2 px-4 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={clsx(
                "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors",
                isActive ? "text-primary-600" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <div className={clsx(
                "flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-colors",
                isActive ? "bg-primary-50" : ""
              )}>
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
