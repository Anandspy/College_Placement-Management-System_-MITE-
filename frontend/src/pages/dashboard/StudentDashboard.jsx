import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const StudentDashboard = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentDashboard;
