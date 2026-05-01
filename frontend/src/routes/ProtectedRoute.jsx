import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // If trying to access admin dashboard, redirect to admin login
    const isAdminRoute = location.pathname.startsWith('/dashboard/admin');
    return <Navigate to={isAdminRoute ? '/admin/login' : '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
