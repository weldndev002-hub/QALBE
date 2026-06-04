import { Link, useLocation } from 'react-router-dom';
import { Package, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { to: '/membership', label: 'Paket', icon: Package },
    { to: '/profil', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] z-50">
      <div className="flex justify-around items-center px-2 h-[80px] pb-safe">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex flex-col items-center gap-[6px] w-24 h-full justify-center relative transition-colors',
                isActive ? 'text-[#7e3188]' : 'text-[#D8A6C9] hover:text-[#7e3188]'
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[5px] bg-[#7e3188] rounded-b-md" />
              )}
              <Icon
                size={26}
                fill={isActive && (label === 'Profil') ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 1.5 : 2}
              />
              <span className={clsx('text-[11px]', isActive ? 'font-bold' : 'font-medium')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
