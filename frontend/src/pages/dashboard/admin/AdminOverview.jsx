import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Briefcase, GraduationCap, Clock } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { getDashboardStats } from '../../../services/admin.service';

const AdminOverview = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        if (data.success) {
          setDashboardStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Students', value: dashboardStats?.totalStudents ?? 0, icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue-light' },
    { label: 'Active Drives', value: dashboardStats?.activeDrives ?? 0, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Placed Students', value: dashboardStats?.placedStudents ?? 0, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Applications', value: dashboardStats?.pendingApplications ?? 0, icon: Clock, color: 'text-brand-orange', bg: 'bg-brand-orange-light' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Welcome Super Admin</h1>
        <p className="text-neutral-500 mt-1">
          Hello {user?.fullName?.split(' ')[0] || 'Admin'}, here is what's happening in the placement cell today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Phase 2</span>
            </div>
            <div>
              {isLoading ? (
                <div className="h-9 w-16 bg-neutral-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
              )}
              <p className="text-sm font-medium text-neutral-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for recent activity */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="h-16 w-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-neutral-300" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">System Monitoring</h3>
        <p className="text-neutral-500 max-w-sm mt-2">
          The administrative control panel is being initialized. Full management features will be available in Phase 2.
        </p>
      </div>
    </motion.div>
  );
};

export default AdminOverview;
