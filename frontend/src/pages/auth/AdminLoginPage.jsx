import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Loader2, AlertCircle, ShieldCheck,
  ArrowLeft, RefreshCw, KeyRound, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema } from '../../schemas/authSchemas';
import { loginAdmin, adminVerifyOtp, logoutUser } from '../../api/authApi';
import { setCredentials, clearCredentials } from '../../features/auth/authSlice';
import { ROLES } from '../../constants/roles';

// ─── OTP digit input component ────────────────────────────────────────────────
const OtpInput = ({ value, onChange, disabled }) => {
  const inputRefs = useRef([]);
  const digits = (value || '').padEnd(6, '').split('').slice(0, 6);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    onChange(newDigits.join('').replace(/ /g, ''));
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-14 rounded-xl border-2 text-center text-xl font-bold tracking-widest
            bg-white/5 text-white transition-all duration-200 outline-none
            focus:border-indigo-400 focus:bg-indigo-500/10 focus:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed
            ${digits[i] && digits[i] !== ' '
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-white/10'
            }`}
        />
      ))}
    </div>
  );
};

// ─── Animated background particles ────────────────────────────────────────────
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-indigo-500/10"
        style={{
          width: Math.random() * 6 + 2,
          height: Math.random() * 6 + 2,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ step }) => (
  <div className="flex items-center gap-3 mb-8">
    {[1, 2].map((s) => (
      <div key={s} className="flex items-center gap-2">
        <motion.div
          animate={{
            backgroundColor: step >= s ? '#6366f1' : 'rgba(255,255,255,0.08)',
            scale: step === s ? 1.15 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
        >
          {step > s ? '✓' : s}
        </motion.div>
        <span className={`text-xs font-medium ${step >= s ? 'text-indigo-300' : 'text-white/30'}`}>
          {s === 1 ? 'Credentials' : 'Verification'}
        </span>
        {s < 2 && (
          <div className={`w-8 h-px mx-1 ${step > s ? 'bg-indigo-400' : 'bg-white/10'}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);          // 1 = credentials, 2 = OTP
  const [adminEmail, setAdminEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    const saved = localStorage.getItem('adminRememberedEmail');
    if (saved) { setValue('email', saved); setValue('rememberMe', true); }
  }, [setValue]);

  // ── Step 1: validate credentials ────────────────────────────────────────────
  const onSubmitCredentials = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      if (data.rememberMe) {
        localStorage.setItem('adminRememberedEmail', data.email);
      } else {
        localStorage.removeItem('adminRememberedEmail');
      }

      await loginAdmin({ email: data.email, password: data.password });

      setAdminEmail(data.email.trim().toLowerCase());
      setResendCooldown(60);
      setStep(2);
      toast.success('OTP sent to your registered email', { icon: '📧' });
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 429) {
        setServerError('Too many attempts. Please wait 15 minutes.');
      } else {
        setServerError(msg || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: verify OTP ───────────────────────────────────────────────────────
  const onSubmitOtp = async () => {
    if (otpValue.length !== 6) {
      setServerError('Please enter the complete 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    setServerError('');
    try {
      const res = await adminVerifyOtp({ email: adminEmail, otp: otpValue });
      const user = res.data.data.user;

      if (user.role !== ROLES.ADMIN) {
        await logoutUser().catch(() => {});
        dispatch(clearCredentials());
        setServerError('Access denied. Admin credentials required.');
        return;
      }

      dispatch(setCredentials({
        user: res.data.data.user,
        accessToken: res.data.data.accessToken,
      }));

      if (user.mustChangePassword) {
        toast.success('Verification successful. Please update your temporary password.', { icon: '🔑' });
        navigate('/admin/change-password', { replace: true });
      } else {
        toast.success('Welcome back, Admin!', { icon: '🛡️' });
        navigate('/dashboard/admin', { replace: true });
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 429) {
        setServerError('Too many attempts. Please wait.');
      } else {
        setServerError(msg || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP — go back to step 1 so user re-enters password ─────────────
  const handleResend = () => {
    if (resendCooldown > 0 || isLoading) return;
    setStep(1);
    setServerError('');
    setOtpValue('');
    setResendCooldown(0);
    toast('Please re-enter your password to resend the OTP.', { icon: '🔄' });
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080818] px-4 relative overflow-hidden">

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <Particles />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/50 p-8 overflow-hidden">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-2xl blur-xl" />
              <div className="relative h-14 w-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal</h1>
            <p className="text-sm text-white/40 mt-1">MITE Placement Cell — Secure Access</p>
          </div>

          {/* Step Indicator */}
          <StepIndicator step={step} />

          {/* Error Banner */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 flex items-start gap-3"
              >
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 leading-relaxed">{serverError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step panels ── */}
          <AnimatePresence mode="wait" custom={step === 1 ? -1 : 1}>
            {step === 1 ? (
              <motion.div
                key="step1"
                custom={-1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-email"
                        type="email"
                        placeholder="admin@mite.ac.in"
                        {...register('email')}
                        className={`h-12 w-full rounded-xl border bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/20
                          transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60
                          ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-red-400 ml-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        className={`h-12 w-full rounded-xl border bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/20
                          transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60
                          ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-red-400 ml-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        {...register('rememberMe')}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Keep me signed in</span>
                    </label>
                    <Link
                      to="/forgot-password?role=admin"
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot access?
                    </Link>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    id="admin-submit-btn"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold
                      shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-500
                      transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying...</span></>
                    ) : (
                      <><span>Continue</span><ChevronRight className="h-4 w-4" /></>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="space-y-6">
                  {/* Info */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 mb-3">
                      <KeyRound className="h-6 w-6 text-indigo-400" />
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">
                      A 6-digit code was sent to<br />
                      <span className="text-indigo-300 font-semibold">{adminEmail}</span>
                    </p>
                  </div>

                  {/* OTP Input */}
                  <OtpInput
                    value={otpValue}
                    onChange={(val) => { setOtpValue(val); setServerError(''); }}
                    disabled={isLoading}
                  />

                  {/* Submit OTP */}
                  <motion.button
                    id="admin-otp-submit-btn"
                    type="button"
                    onClick={onSubmitOtp}
                    disabled={isLoading || otpValue.length !== 6}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold
                      shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
                      transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying OTP...</span></>
                    ) : (
                      <><ShieldCheck className="h-4 w-4" /><span>Verify & Sign In</span></>
                    )}
                  </motion.button>

                  {/* Resend + Back */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setServerError(''); setOtpValue(''); }}
                      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || isLoading}
                      className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors
                        disabled:text-white/25 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-white/20 uppercase tracking-widest font-bold">
          &copy; {new Date().getFullYear()} MITE Placement Cell &mdash; Restricted Access
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
