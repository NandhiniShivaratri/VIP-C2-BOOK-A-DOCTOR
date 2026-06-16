import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLock } from 'react-icons/fa';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.warn('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white">Reset Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Set your new password to secure and recover access to your MedConnect profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
            <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
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

          {/* Confirm password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm Password</label>
            <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <FaLock className="text-slate-400 mr-3 text-sm" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none border-none focus:ring-0"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <span>Update Password Credentials</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
