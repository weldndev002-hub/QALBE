import { Link, useLocation } from 'react-router-dom';
import { Home, AudioLines, Newspaper, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] z-50">
      <div className="flex justify-around items-center px-2 h-[80px] pb-safe relative">
        <Link to="/dashboard" className={clsx("flex flex-col items-center gap-[6px] w-16 h-full justify-center relative transition-colors", location.pathname.startsWith('/dashboard') ? "text-[#7e3188]" : "text-[#D8A6C9] hover:text-[#7e3188]")}>
          {location.pathname.startsWith('/dashboard') && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[5px] bg-[#7e3188] rounded-b-md"></div>}
          <Home size={26} fill={location.pathname.startsWith('/dashboard') ? "currentColor" : "none"} strokeWidth={location.pathname.startsWith('/dashboard') ? 1.5 : 2} />
          <span className={clsx("text-[11px]", location.pathname.startsWith('/dashboard') ? "font-bold" : "font-medium")}>Home</span>
        </Link>
        <Link to="/audio" className={clsx("flex flex-col items-center gap-[6px] w-16 h-full justify-center relative transition-colors", location.pathname.startsWith('/audio') ? "text-[#7e3188]" : "text-[#D8A6C9] hover:text-[#7e3188]")}>
          {location.pathname.startsWith('/audio') && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[5px] bg-[#7e3188] rounded-b-md"></div>}
          <AudioLines size={26} strokeWidth={2.5} />
          <span className={clsx("text-[11px]", location.pathname.startsWith('/audio') ? "font-bold" : "font-medium")}>Audio</span>
        </Link>
        <Link to="/artikel" className={clsx("flex flex-col items-center gap-[6px] w-16 h-full justify-center relative transition-colors", location.pathname.startsWith('/artikel') ? "text-[#7e3188]" : "text-[#D8A6C9] hover:text-[#7e3188]")}>
          {location.pathname.startsWith('/artikel') && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[5px] bg-[#7e3188] rounded-b-md"></div>}
          <Newspaper size={26} strokeWidth={2.5} />
          <span className={clsx("text-[11px]", location.pathname.startsWith('/artikel') ? "font-bold" : "font-medium")}>Content</span>
        </Link>
        <Link to="/profil" className={clsx("flex flex-col items-center gap-[6px] w-16 h-full justify-center relative transition-colors", location.pathname.startsWith('/profil') ? "text-[#7e3188]" : "text-[#D8A6C9] hover:text-[#7e3188]")}>
          {location.pathname.startsWith('/profil') && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[5px] bg-[#7e3188] rounded-b-md"></div>}
          <User size={26} fill={location.pathname.startsWith('/profil') ? "currentColor" : "none"} strokeWidth={location.pathname.startsWith('/profil') ? 1.5 : 2} />
          <span className={clsx("text-[11px]", location.pathname.startsWith('/profil') ? "font-bold" : "font-medium")}>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
