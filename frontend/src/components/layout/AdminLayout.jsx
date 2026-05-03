import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { logoutUser } from '../../features/auth/authThunks';

const adminNavItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard/admin' },
  { label: 'Student Management', icon: Users, to: '/dashboard/admin/students' },
  { label: 'Drive Management', icon: Briefcase, to: '/dashboard/admin/drives' },
  { label: 'Notice Board', icon: Bell, to: '/dashboard/admin/notices' },
  { label: 'Settings', icon: Settings, to: '/dashboard/admin/settings' },
];

const AdminLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-neutral-200 z-30">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-neutral-100">
          <div className="h-8 w-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Admin Portal</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-brand-orange/10 text-brand-orange'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-orange flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">Admin Portal</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 -mr-2 text-neutral-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard/admin'}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-brand-orange/10 text-brand-orange'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }`
                    }
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-neutral-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200/60">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-sm font-semibold text-neutral-800">
                Super Admin Console
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-1">
                <p className="text-xs font-bold text-neutral-900">{user?.fullName || 'Super Admin'}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">Placement Cell</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-700">{initials}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
