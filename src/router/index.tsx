import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import OnboardingPage from '../pages/OnboardingPage';
import ProfilePage from '../pages/ProfilePage';
import MembershipPage from '../pages/MembershipPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminPage from '../pages/AdminPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* Protected: harus login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/profil" element={<ProfilePage />} />

          {/* Redirect halaman lama ke membership */}
          <Route path="/dashboard" element={<Navigate to="/membership" replace />} />
          <Route path="/chat" element={<Navigate to="/membership" replace />} />
          <Route path="/mood" element={<Navigate to="/membership" replace />} />
          <Route path="/stress" element={<Navigate to="/membership" replace />} />
          <Route path="/audio" element={<Navigate to="/membership" replace />} />
          <Route path="/artikel" element={<Navigate to="/membership" replace />} />
          <Route path="/upgrade" element={<Navigate to="/membership" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
