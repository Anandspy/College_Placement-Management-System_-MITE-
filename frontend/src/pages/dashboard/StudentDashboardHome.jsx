import { motion } from 'framer-motion';
import {
  Briefcase,
  Award,
  CalendarCheck,
  Trophy,
  ChevronRight,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  IndianRupee,
  TrendingUp,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// ── Mock Data ───────────────────────────────────────────────────────
const mockStats = [
  { title: 'Jobs Applied', value: 12, icon: Briefcase, color: 'text-brand-blue', bgColor: 'bg-brand-blue-light', trend: '+3 this week' },
  { title: 'Shortlisted', value: 5, icon: Award, color: 'text-emerald-600', bgColor: 'bg-emerald-50', trend: '+2 new' },
  { title: 'Interviews', value: 3, icon: CalendarCheck, color: 'text-amber-600', bgColor: 'bg-amber-50', trend: 'Next: Tomorrow' },
  { title: 'Offers', value: 1, icon: Trophy, color: 'text-violet-600', bgColor: 'bg-violet-50', trend: '🎉 Congrats!' },
];

const mockAnnouncements = [
  { id: 1, date: 'Apr 23, 2026', title: 'Guest Lecture: AI in Web Dev', desc: 'Special session by industry experts from TechCorp on Monday 10 AM.', hasPdf: true },
  { id: 2, date: 'Apr 21, 2026', title: 'Placement Drive — Infosys', desc: 'Infosys BPM drive registration closes on Apr 25. Eligible: CSE, ISE, MCA.', hasPdf: false },
  { id: 3, date: 'Apr 18, 2026', title: 'Resume Format Updated', desc: 'Download the latest MITE-standard resume template from the notices section.', hasPdf: true },
];

const mockDrives = [
  { id: 1, company: 'Infosys BPM', role: 'Systems Engineer', ctc: '4.5 LPA', location: 'Bangalore', deadline: 'Apr 25', eligible: ['CSE', 'ISE', 'MCA'], status: 'open' },
  { id: 2, company: 'Wipro Ltd', role: 'Project Engineer', ctc: '3.8 LPA', location: 'Mysore', deadline: 'Apr 28', eligible: ['All Branches'], status: 'open' },
  { id: 3, company: 'TCS Digital', role: 'Digital Engineer', ctc: '7.0 LPA', location: 'Mumbai', deadline: 'May 02', eligible: ['CSE', 'AI/ML', 'ECE'], status: 'upcoming' },
];

// ── Animation Variants ──────────────────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ── Circular Progress Ring ──────────────────────────────────────────
const CircleProgress = ({ percent, size = 72, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={percent === 100 ? '#34D399' : '#F48120'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{percent}%</span>
      </div>
    </div>
  );
};

// ── Animated Counter ────────────────────────────────────────────────
const AnimatedCounter = ({ value }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="text-3xl font-black text-neutral-900 tracking-tight"
    >
      {value}
    </motion.span>
  );
};

const StudentDashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const profileCompletion = user?.profileComplete || 0;

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const deptShort = user?.department
    ?.replace('Computer Science & Engineering', 'CSE')
    .replace('Master of Computer Applications', 'MCA')
    .replace('Information Science & Engineering', 'ISE')
    .replace('Electronics & Communication Engineering', 'ECE')
    .replace('Artificial Intelligence & Machine Learning', 'AI/ML')
    .replace('Mechanical Engineering', 'ME')
    .replace('Aeronautical Engineering', 'AE')
    .replace('Civil Engineering', 'CE')
    .replace('Mechatronics Engineering', 'MCT')
    .replace('Robotics & Artificial Intelligence', 'R&AI')
    .replace('Master of Business Administration', 'MBA')
    || user?.department;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1200px] mx-auto"
    >
      {/* ── 1. PROFILE HERO BANNER ─────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue via-[#0a4a8a] to-brand-blue-dark p-6 sm:p-8 text-white"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-orange/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/[0.03] rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-2xl sm:text-3xl font-black text-white/90">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-orange/90 text-white mb-2">
              <Sparkles className="h-3 w-3" />
              {deptShort}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              {user?.fullName || 'Student'}
            </h1>
            <p className="text-sm sm:text-base text-white/70 mt-1 flex items-center gap-2 flex-wrap">
              <span>{user?.yearOfStudy || 'Final Year'}</span>
              <span className="text-white/30">•</span>
              <span className="font-mono text-white/60">{user?.usnNumber || '4MT25MC007'}</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <CircleProgress percent={profileCompletion} size={76} strokeWidth={5} />
            <span className="text-[11px] font-medium text-white/60 whitespace-nowrap">Profile Complete</span>
          </div>
        </div>
      </motion.div>

      {/* ── 2. QUICK STATS ROW ─────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            className="bg-white rounded-2xl border border-neutral-200/80 p-5 cursor-default transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-neutral-200 group-hover:text-neutral-400 transition-colors" />
            </div>
            <AnimatedCounter value={stat.value} />
            <p className="text-sm font-medium text-neutral-500 mt-0.5">{stat.title}</p>
            <p className="text-[11px] text-neutral-400 mt-1">{stat.trend}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── 3. TWO-COLUMN GRID: Announcements + Drives ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
              Notice Board
            </h2>
            <button className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors">
              View All
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {mockAnnouncements.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-neutral-50/50 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-brand-orange mb-1">{item.date}</p>
                    <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-brand-blue transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.desc}</p>
                  </div>
                  {item.hasPdf && (
                    <button className="flex-shrink-0 p-2 rounded-lg bg-neutral-100 text-neutral-400 hover:bg-brand-blue-light hover:text-brand-blue transition-all">
                      <FileDown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-blue" />
              Placement Drives
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {mockDrives.filter((d) => d.status === 'open').length} Open
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {mockDrives.map((drive) => (
              <div key={drive.id} className="px-6 py-4 hover:bg-neutral-50/50 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-brand-blue transition-colors">
                    {drive.company}
                  </h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    drive.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {drive.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mb-2">{drive.role}</p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400 flex-wrap">
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{drive.ctc}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{drive.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Deadline: {drive.deadline}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {drive.eligible.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-brand-blue-light text-brand-blue">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── 4. NEXT STEPS CHECKLIST ────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-neutral-900 mb-5 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-blue" />
          Your Next Steps
        </h2>
        <div className="space-y-3">
          <div className={`flex gap-4 items-start p-4 rounded-xl border transition-all ${
            profileCompletion === 100 ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-brand-blue-light/40 border-brand-blue/10'
          }`}>
            <div className="mt-0.5 flex-shrink-0">
              {profileCompletion === 100 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-brand-blue" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-900">Complete Student Profile</h4>
              <p className="text-xs text-neutral-500 mt-0.5">Add your academic details, 10th & 12th marks, and resume to get verified by the admin.</p>
            </div>
            {profileCompletion !== 100 && (
              <button 
                onClick={() => navigate('/dashboard/student/profile')}
                className="hidden sm:flex items-center gap-1 px-4 py-2 bg-brand-blue text-white text-xs font-semibold rounded-lg hover:bg-brand-blue-dark transition-colors shadow-sm"
              >
                Start <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-4 items-start p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 opacity-60">
            <div className="mt-0.5 flex-shrink-0"><FileText className="h-5 w-5 text-neutral-400" /></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-800">Build Your MITE Resume</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Once your profile is complete, generate your standardized placement resume instantly.</p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-neutral-200 text-neutral-500 text-[10px] font-semibold rounded-full">Locked</span>
          </div>

          <div className="flex gap-4 items-start p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 opacity-60">
            <div className="mt-0.5 flex-shrink-0"><Briefcase className="h-5 w-5 text-neutral-400" /></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-800">Apply to Placement Drives</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Browse eligible drives and apply with a single click once your profile is verified.</p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-neutral-200 text-neutral-500 text-[10px] font-semibold rounded-full">Locked</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboardHome;
