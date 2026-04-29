import { Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import RegisterPage from '../pages/auth/RegisterPage';
import LoginPage from '../pages/auth/LoginPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Dashboard pages
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import StudentDashboardHome from '../pages/dashboard/StudentDashboardHome';
import StudentProfilePage from '../pages/dashboard/StudentProfilePage';
import DrivesPage from '../pages/dashboard/DrivesPage';
import DriveDetail from '../pages/dashboard/DriveDetail';
import ApplicationsPage from '../pages/dashboard/ApplicationsPage';
import NoticesPage from '../pages/dashboard/NoticesPage';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import HRDashboard from '../pages/dashboard/HRDashboard';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import { ROLES } from '../constants/roles';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboardHome />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="drives" element={<DrivesPage />} />
        <Route path="drives/:id" element={<DriveDetail />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="notices" element={<NoticesPage />} />
      </Route>
      <Route
        path="/dashboard/admin/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hr/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.HR]}>
              <HRDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
