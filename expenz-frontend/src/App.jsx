// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import './i18n';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AppLayout from './components/layout/AppLayout';

// ─── Page title map ─────────────────────────────────────────
const PAGE_TITLES = {
  '/login': 'Login — Expenz',
  '/register': 'Create Account — Expenz',
  '/dashboard': 'Dashboard — Expenz',
  '/expenses': 'Expenses — Expenz',
  '/income': 'Income — Expenz',
  '/budget': 'Budget — Expenz',
  '/reports': 'Reports — Expenz',
  '/settings': 'Settings — Expenz',
};

const DEFAULT_TITLE = 'Expenz - Smart Finance Manager';

// ─── Document title hook ────────────────────────────────────
const useDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const title = PAGE_TITLES[path] || DEFAULT_TITLE;
    document.title = title;
  }, [location.pathname]);
};

// ─── Route guards ───────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Router with title watcher ──────────────────────────────
function AppRoutes() {
  useDocumentTitle();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="income" element={<Income />} />
        <Route path="budget" element={<Budget />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ─── App root ───────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;