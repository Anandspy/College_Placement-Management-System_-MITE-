import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Building2,
  MapPin,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyApplicationsAction } from '../../features/applications/applicationSlice';
import CompanyLogo from '../../components/CompanyLogo';

const StatusBadge = ({ status }) => {
  const configs = {
    'applied': { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock, text: 'Applied' },
    'shortlisted': { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2, text: 'Shortlisted' },
    'not-shortlisted': { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle, text: 'Not Shortlisted' },
    'test-cleared': { color: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: CheckCircle2, text: 'Test Cleared' },
    'test-failed': { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle, text: 'Test Failed' },
    'interview-scheduled': { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock, text: 'Interview' },
    'selected': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2, text: 'Selected 🎉' },
    'rejected': { color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: XCircle, text: 'Rejected' },
  };

  const config = configs[status] || configs['applied'];
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center w-fit ${config.color}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.text}
    </span>
  );
};

const ApplicationCard = ({ application, index }) => {
  const { driveId: drive } = application;

  if (!drive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-3xl border border-neutral-100 p-6 hover:shadow-xl hover:shadow-neutral-200/50 transition-all group"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <CompanyLogo 
            logo={drive.companyLogo} 
            companyName={drive.companyName} 
            className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-100 shadow-inner shrink-0 group-hover:scale-105 transition-transform overflow-hidden"
            iconClassName="w-8 h-8 text-neutral-300"
          />
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-brand-orange transition-colors">
              {drive.jobRole}
            </h3>
            <p className="text-brand-blue font-bold text-sm mb-2">{drive.companyName}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-medium">
              <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-neutral-400" />{drive.location}</span>
              <span className="flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-1 text-neutral-400" />{drive.ctc}</span>
              <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-neutral-400" />Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-50">
          <StatusBadge status={application.status} />
          <Link 
            to={`/dashboard/student/drives/${drive._id}`}
            className="flex items-center text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            Drive Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const ApplicationsPage = () => {
  const dispatch = useDispatch();
  const { applications, isLoading, isError, message } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(getMyApplicationsAction());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        <div className="h-10 w-1/4 bg-neutral-100 rounded-xl animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-neutral-100 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">My Applications</h1>
        <p className="text-neutral-500 font-medium">Track your recruitment progress across different companies.</p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app, index) => (
            <ApplicationCard key={app._id} application={app} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-dashed border-neutral-200 py-20 text-center">
          <div className="w-20 h-20 bg-neutral-50 text-neutral-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No applications yet</h2>
          <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
            You haven't applied to any drives yet. Explore active drives to start your career journey.
          </p>
          <Link 
            to="/dashboard/student/drives"
            className="inline-flex items-center px-8 py-3.5 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-brand-orange transition-all hover:scale-105 shadow-xl shadow-neutral-200"
          >
            Browse Drives
          </Link>
        </div>
      )}

      {isError && (
        <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-bold">{message}</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
