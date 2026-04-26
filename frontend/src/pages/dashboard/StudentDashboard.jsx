import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { fetchProfile } from '../../features/profile/profileThunks';

const StudentDashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentDashboard;
