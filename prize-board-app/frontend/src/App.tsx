import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/public/HomePage';
import { BoardListPage } from './pages/public/BoardListPage';
import { BoardDetailPage } from './pages/public/BoardDetailPage';
import { PaymentConfirmationPage } from './pages/public/PaymentConfirmationPage';
import { TermsPage } from './pages/public/TermsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { DashboardPage } from './pages/user/DashboardPage';
import { ReferralPage } from './pages/user/ReferralPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminBoardListPage } from './pages/admin/AdminBoardListPage';
import { AdminBoardCreatePage } from './pages/admin/AdminBoardCreatePage';
import { AdminBoardDetailPage } from './pages/admin/AdminBoardDetailPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPaymentLogsPage } from './pages/admin/AdminPaymentLogsPage';
import { AdminEntryLogsPage } from './pages/admin/AdminEntryLogsPage';

const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/boards" element={<BoardListPage />} />
      <Route path="/boards/:id" element={<BoardDetailPage />} />
      <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />
      <Route path="/terms" element={<TermsPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="user">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/referrals"
        element={
          <ProtectedRoute role="user">
            <ReferralPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute role="user">
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/boards"
        element={
          <ProtectedRoute role="admin">
            <AdminBoardListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/boards/new"
        element={
          <ProtectedRoute role="admin">
            <AdminBoardCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/boards/:id"
        element={
          <ProtectedRoute role="admin">
            <AdminBoardDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute role="admin">
            <AdminPaymentLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/entries"
        element={
          <ProtectedRoute role="admin">
            <AdminEntryLogsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default App;
