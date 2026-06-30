import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ToastViewport } from './components/ui/ToastViewport.jsx';
import { AppShell } from './layouts/AppShell.jsx';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPages.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import {
  NotFoundPage,
  NotificationsPage,
  ProfilePage,
  ResourcePage,
  SettingsPage
} from './pages/ResourcePages.jsx';

function App() {
  return (
    <>
      <ToastViewport />
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
    </>
  );
}

export default App;
