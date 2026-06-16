import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle errors or authentication success
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success('Successfully logged in!');
      const timer = setTimeout(() => {
        if (user.role === 'Admin') navigate('/dashboard/admin');
        else if (user.role === 'Doctor') navigate('/dashboard/doctor');
        else navigate('/dashboard/patient');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Please fill in both email and password.');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to book doctor appointments and download medical reports.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
            <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus-within:border-brand-500 transition-all">
              <FaEnvelope className="text-slate-400 mr-3 text-sm" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none border-none focus:ring-0"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-brand-500 hover:text-brand-600">
                Forgot password?
              </Link>
            </div>
            <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus-within:border-brand-500 transition-all">
              <FaLock className="text-slate-400 mr-3 text-sm" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none border-none focus:ring-0"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <FaSignInAlt />
                <span>Sign In Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-500 hover:text-brand-600">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
