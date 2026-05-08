import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
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

      if (user.role !== ROLES.ADMIN) {
        await logoutUser().catch(() => { });
        dispatch(clearCredentials());
        throw { response: { status: 403, data: { message: 'Access denied. Admin credentials required.' } } };
      }

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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px]"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-10">
          {/* Header */}
          <div className="mb-10 flex flex-col items-center text-center">
            <img src={miteLogo} alt="MITE Logo" className="h-12 mb-6" />
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-brand-orange" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Admin Portal
              </h1>
            </div>
            <p className="text-sm text-neutral-500">
              Access the administrative dashboard
            </p>
          </div>

          {/* Error Message */}
          {serverError && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium leading-relaxed">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  placeholder="admin@mite.ac.in"
                  {...register('email')}
                  className={`h-12 w-full rounded-xl border bg-neutral-50 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                    errors.email ? 'border-red-300 bg-red-50/30' : 'border-neutral-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 font-medium ml-1 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`h-12 w-full rounded-xl border bg-neutral-50 pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange ${
                    errors.password ? 'border-red-300 bg-red-50/30' : 'border-neutral-200'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 font-medium ml-1 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-orange focus:ring-brand-orange transition-all cursor-pointer"
                />
                <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">Keep me signed in</span>
              </label>
              
              <Link to="/forgot-password?role=admin" className="text-xs font-semibold text-brand-orange hover:text-orange-600 transition-colors">
                Forgot access?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="h-12 w-full rounded-xl bg-neutral-900 text-white text-sm font-bold shadow-lg shadow-neutral-200 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </motion.button>
          </form>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-center text-xs text-neutral-500 uppercase tracking-widest font-bold">
          &copy; {new Date().getFullYear()} MITE Placement Cell
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;

