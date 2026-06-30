import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { TableSkeleton } from './components/ui/AsyncStates.jsx';
import { ToastViewport } from './components/ui/ToastViewport.jsx';
import { AppShell } from './layouts/AppShell.jsx';
import { PublicLayout } from './layouts/PublicLayout.jsx';

const lazyPage = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const LandingPage = lazyPage(() => import('./pages/LandingPage.jsx'), 'LandingPage');
const LoginPage = lazyPage(() => import('./pages/AuthPages.jsx'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./pages/AuthPages.jsx'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(() => import('./pages/AuthPages.jsx'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyPage(() => import('./pages/AuthPages.jsx'), 'ResetPasswordPage');
const DashboardPage = lazyPage(() => import('./pages/DashboardPage.jsx'), 'DashboardPage');
const ResourcePage = lazyPage(() => import('./pages/ResourcePages.jsx'), 'ResourcePage');
const SettingsPage = lazyPage(() => import('./pages/ResourcePages.jsx'), 'SettingsPage');
const ProfilePage = lazyPage(() => import('./pages/ResourcePages.jsx'), 'ProfilePage');
const NotificationsPage = lazyPage(() => import('./pages/ResourcePages.jsx'), 'NotificationsPage');
const NotFoundPage = lazyPage(() => import('./pages/ResourcePages.jsx'), 'NotFoundPage');

function RouteFallback() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TableSkeleton rows={6} columns={4} />
    </div>
  );
}

function App() {
  return (
    <>
      <ToastViewport />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/doctors" element={<ResourcePage type="doctors" />} />
              <Route path="/patients" element={<ResourcePage type="patients" />} />
              <Route path="/appointments" element={<ResourcePage type="appointments" />} />
              <Route path="/medical-records" element={<ResourcePage type="records" />} />
              <Route path="/billing" element={<ResourcePage type="billing" />} />
              <Route path="/payments" element={<ResourcePage type="payments" />} />
              <Route path="/medicines" element={<ResourcePage type="medicines" />} />
              <Route path="/departments" element={<ResourcePage type="departments" />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/activity-logs" element={<ResourcePage type="activity" />} />
            </Route>
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
