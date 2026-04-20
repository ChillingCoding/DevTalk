import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './contexts/AuthContext';
import AuthLayout from './pages/AuthLayout';
import LoginPage from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MainLayout } from './pages/MainLayout';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationPage';
import { ExplorePage } from './pages/ExplorePage';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <MainLayout />;
}

function PublicAuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <AuthLayout />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, Component: FeedPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'notifications', Component: NotificationsPage },
      { path: 'explore', Component: ExplorePage },
    ],
  },
  {
    path: '/auth',
    Component: PublicAuthLayout,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
