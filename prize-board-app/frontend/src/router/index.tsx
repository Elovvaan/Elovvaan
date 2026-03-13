import { createBrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminBoardCreatePage } from '../pages/admin/AdminBoardCreatePage';
import { AdminBoardDetailPage } from '../pages/admin/AdminBoardDetailPage';
import { AdminBoardListPage } from '../pages/admin/AdminBoardListPage';
import { AdminEntryLogsPage } from '../pages/admin/AdminEntryLogsPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminPaymentLogsPage } from '../pages/admin/AdminPaymentLogsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { BoardDetailPage } from '../pages/public/BoardDetailPage';
import { EntryPurchasePage } from '../pages/public/EntryPurchasePage';
import { HomePage } from '../pages/public/HomePage';
import { PaymentConfirmationPage } from '../pages/public/PaymentConfirmationPage';
import { TermsPage } from '../pages/public/TermsPage';
import { DashboardPage } from '../pages/user/DashboardPage';
import { NotificationsPage } from '../pages/user/NotificationsPage';
import { ReferralPage } from '../pages/user/ReferralPage';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    {children}
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout><HomePage /></RootLayout>,
  },
  { path: '/boards/:boardId', element: <RootLayout><BoardDetailPage /></RootLayout> },
  { path: '/boards/:boardId/enter', element: <RootLayout><EntryPurchasePage /></RootLayout> },
  { path: '/payment-confirmation', element: <RootLayout><PaymentConfirmationPage /></RootLayout> },
  { path: '/terms', element: <RootLayout><TermsPage /></RootLayout> },
  { path: '/login', element: <RootLayout><LoginPage /></RootLayout> },
  { path: '/signup', element: <RootLayout><SignupPage /></RootLayout> },
  {
    path: '/',
    element: <ProtectedRoute allow={['user', 'admin']} />,
    children: [
      { path: '/dashboard', element: <RootLayout><DashboardPage /></RootLayout> },
      { path: '/referral', element: <RootLayout><ReferralPage /></RootLayout> },
      { path: '/notifications', element: <RootLayout><NotificationsPage /></RootLayout> },
    ],
  },
  { path: '/admin/login', element: <RootLayout><AdminLoginPage /></RootLayout> },
  {
    path: '/admin',
    element: <ProtectedRoute allow={['admin']} />,
    children: [
      { path: '/admin/boards', element: <RootLayout><AdminBoardListPage /></RootLayout> },
      { path: '/admin/boards/create', element: <RootLayout><AdminBoardCreatePage /></RootLayout> },
      { path: '/admin/boards/:boardId', element: <RootLayout><AdminBoardDetailPage /></RootLayout> },
      { path: '/admin/users', element: <RootLayout><AdminUsersPage /></RootLayout> },
      { path: '/admin/payments', element: <RootLayout><AdminPaymentLogsPage /></RootLayout> },
      { path: '/admin/entries', element: <RootLayout><AdminEntryLogsPage /></RootLayout> },
    ],
  },
]);
