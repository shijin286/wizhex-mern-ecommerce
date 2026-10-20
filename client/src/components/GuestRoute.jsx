import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import PageLoader from './PageLoader.jsx';

// Login/Register are only for signed-out visitors.
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (user) {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search || ''}` : '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
