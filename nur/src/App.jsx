import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Quran from '@/pages/Quran';
import Duas from '@/pages/Duas';
import Qibla from '@/pages/Qibla';
import Media from '@/pages/Media';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import AsmaulHusna from '@/pages/AsmaulHusna';
import ProtectedRoute from '@/components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Telegram WebApp initialization and theme setup
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      try {
        tg.enableClosingConfirmation();
      } catch (e) {
        console.warn("Could not enable closing confirmation", e);
      }
      
      // Update theme header & background to match emerald dark theme
      try {
        tg.setHeaderColor?.('#064e3b'); // Emerald-900 / Emerald dark
        tg.setBackgroundColor?.('#030712'); // Slate-950 background
      } catch (e) {
        console.warn("Could not set header/bg colors", e);
      }
    }
  }, []);

  // Sync Telegram WebApp Back Button with React Router navigation
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const isRoot = location.pathname === '/' || 
                   location.pathname === '/quran' || 
                   location.pathname === '/duas' || 
                   location.pathname === '/media' || 
                   location.pathname === '/qibla' || 
                   location.pathname === '/profile';

    if (isRoot) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      const handleBack = () => {
        if (location.pathname.startsWith('/quran/')) {
          navigate('/quran');
        } else {
          navigate(-1);
        }
      };
      tg.BackButton.onClick(handleBack);

      return () => {
        tg.BackButton.offClick(handleBack);
      };
    }
  }, [location, navigate]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public Auth Routes (Redirected directly to home as login is bypassed) */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/" replace />} />
      <Route path="/reset-password" element={<Navigate to="/" replace />} />

      {/* Protected Routes inside Layout */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/quran/:surahNumber" element={<Quran />} />
          <Route path="/duas" element={<Duas />} />
          <Route path="/media" element={<Media />} />
          <Route path="/qibla" element={<Qibla />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/asma-ul-husna" element={<AsmaulHusna />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
