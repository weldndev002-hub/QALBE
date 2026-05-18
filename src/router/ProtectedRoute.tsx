import { Navigate, Outlet } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="flex h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-primary-100 overflow-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 relative h-screen overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </div>
      
      {/* Global Bottom Navigation for Mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
