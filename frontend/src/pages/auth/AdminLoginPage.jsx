import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema } from '../../schemas/authSchemas';
import { loginAdmin as loginApi, logoutUser } from '../../api/authApi';
import { setCredentials, clearCredentials } from '../../features/auth/authSlice';
import { ROLES } from '../../constants/roles';
import miteLogo from '../../assets/mite-logo.png';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminRememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');

    try {
      // Remember email if checkbox is checked
      if (data.rememberMe) {
        localStorage.setItem('adminRememberedEmail', data.email);
      } else {
        localStorage.removeItem('adminRememberedEmail');
      }

      const res = await loginApi({
        email: data.email,
        password: data.password,
      });

      const user = res.data.data.user;

      // Role check: Only allow ADMIN
      if (user.role !== ROLES.ADMIN) {
        // Log them out immediately
        await logoutUser().catch(() => {}); // ignore error if logout fails
        dispatch(clearCredentials());
        throw { response: { status: 403, data: { message: 'Access denied. Admin credentials required.' } } };
      }

      // Dispatch credentials to Redux
      dispatch(
        setCredentials({
          user: res.data.data.user,
          accessToken: res.data.data.accessToken,
        })
      );

      toast.success('Admin authentication successful');
      navigate('/dashboard/admin', { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 429) {
        setServerError('Too many login attempts. Try again in 15 minutes.');
      } else {
        setServerError(data?.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-orange/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-800 p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-neutral-950 rounded-2xl flex items-center justify-center mb-4 border border-neutral-800 shadow-inner">
              <ShieldCheck className="h-8 w-8 text-brand-orange" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Secure access for system administrators
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-neutral-400 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@mite.ac.in"
                  {...register('email')}
                  className={`h-11 w-full rounded-lg border bg-neutral-950 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 ${
                    errors.email ? 'border-red-500/50' : 'border-neutral-800'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  {...register('password')}
                  className={`h-11 w-full rounded-lg border bg-neutral-950 pl-10 pr-11 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 ${
                    errors.password ? 'border-red-500/50' : 'border-neutral-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-brand-orange focus:ring-brand-orange focus:ring-offset-neutral-900"
                />
                <span className="text-xs text-neutral-400">Remember credentials</span>
              </label>
              
              <Link to="/forgot-password?role=admin" size="sm" className="text-xs font-medium text-brand-orange hover:text-orange-400 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="h-11 w-full rounded-lg bg-brand-orange text-white text-sm font-semibold tracking-wide hover:bg-orange-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Secure Login'
                )}
              </motion.button>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center flex justify-center">
          <img src={miteLogo} alt="MITE Logo" className="h-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
