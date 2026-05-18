import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import OnboardingPage from '../pages/OnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import ChatPage from '../pages/ChatPage';
import MoodTrackerPage from '../pages/MoodTrackerPage';
import StressMeterPage from '../pages/StressMeterPage';
import AudioTerapiPage from '../pages/AudioTerapiPage';
import ArticlePage from '../pages/ArticlePage';
import ProfilePage from '../pages/ProfilePage';
import UpgradePage from '../pages/UpgradePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminPage from '../pages/AdminPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* Protected: harus login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/mood" element={<MoodTrackerPage />} />
          <Route path="/stress" element={<StressMeterPage />} />
          <Route path="/audio" element={<AudioTerapiPage />} />
          <Route path="/artikel" element={<ArticlePage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/upgrade" element={<UpgradePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
