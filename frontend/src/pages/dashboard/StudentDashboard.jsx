import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Briefcase,
  Award,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { logoutUser } from '../../features/auth/authThunks';

const StudentDashboard = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  // Using the profileComplete field from the user document, defaulting to 0
  const profileCompletion = user?.profileComplete || 0;

  const quickStats = [
    {
      title: 'Jobs Applied',
      value: '0',
      icon: Briefcase,
      color: 'text-brand-blue',
      bgColor: 'bg-brand-blue-light'
    },
    {
      title: 'Shortlisted',
      value: '0',
      icon: Award,
      color: 'text-success',
      bgColor: 'bg-[#E8F5E9]'
    },
    {
      title: 'Interviews Prep',
      value: '0',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-[#FFF3E0]'
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center shadow-sm"
            >
              <User className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-neutral-900">{user?.fullName}</p>
              <p className="text-xs text-neutral-500 font-medium">{user?.department} • {user?.usnNumber}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Greeting Section */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-1">
              Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base">
              Here is what's happening with your placement process today.
            </p>
          </motion.div>

          {/* Top Grid: Profile Progress & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profile Completion Widget - Takes up 1 column on LG */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Decorative Background Flare */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-brand-orange-light opacity-50 rounded-full blur-2xl transform group-hover:scale-110 transition-transform duration-700"></div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-orange" />
                    <h2 className="text-lg font-bold text-neutral-900">Profile Setup</h2>
                  </div>
                  <span className="text-2xl font-black text-brand-orange">{profileCompletion}%</span>
                </div>

                <p className="text-sm text-neutral-600 mb-6 relative z-10">
                  {profileCompletion === 100
                    ? "Your profile is complete! You are ready to apply for drives."
                    : "Complete your profile to 100% to become eligible for upcoming placement drives."}
                </p>

                {/* Progress Bar Container */}
                <div className="w-full bg-neutral-100 rounded-full h-3 mb-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className={`h-3 rounded-full ${profileCompletion === 100 ? 'bg-success' : 'bg-brand-orange'}`}
                  ></motion.div>
                </div>
              </div>

              <button
                onClick={() => console.log('Navigate to profile')} // Placeholder for upcoming navigation
                className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-sm ${profileCompletion === 100
                  ? "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                  : "bg-brand-orange text-white hover:bg-[#E0761A] hover:shadow-md"
                  }`}
              >
                {profileCompletion === 100 ? "Edit Profile" : "Complete Now"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>

            {/* Quick Stats Widget - Takes up 2 columns on LG */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {quickStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col justify-center hover:shadow-md transition-shadow cursor-default group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-neutral-300" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-neutral-900 mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>

          {/* Secondary Grid: Action Items / To-Dos */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-brand-blue" />
              Your Next Steps
            </h2>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 items-start p-4 bg-brand-blue-light/30 rounded-xl border border-brand-blue/10">
                <div className="mt-1 flex-shrink-0">
                  {profileCompletion === 100 ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-brand-blue" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-neutral-900">Complete Student Profile</h4>
                  <p className="text-sm text-neutral-600 mt-1">Add your academic details, 10th & 12th marks, and resume to get verified by the admin.</p>
                </div>
                {profileCompletion !== 100 && (
                  <button className="hidden sm:block px-4 py-2 bg-white border border-brand-blue/20 text-brand-blue text-sm font-semibold rounded-lg hover:bg-brand-blue-light transition-colors">
                    Start
                  </button>
                )}
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start p-4 bg-neutral-50 rounded-xl border border-neutral-100 opacity-70">
                <div className="mt-1 flex-shrink-0">
                  <FileText className="h-6 w-6 text-neutral-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-neutral-900">Build Your MITE Resume</h4>
                  <p className="text-sm text-neutral-500 mt-1">Once your profile is complete, generate your standardized placement resume instantly.</p>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 bg-neutral-200 text-neutral-600 text-xs font-semibold rounded-full items-center h-fit">
                  Locked
                </span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;
