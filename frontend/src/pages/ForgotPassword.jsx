import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaChevronLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn('Please provide your email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password recovery link dispatched! Please check your inbox.');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit recovery request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-xl space-y-6">
        <div className="space-y-2">
          <Link to="/login" className="text-xs text-slate-400 hover:text-brand-500 flex items-center space-x-1 mb-2 font-medium">
            <FaChevronLeft className="text-[10px]" />
            <span>Back to Login</span>
          </Link>
          <h2 className="text-3xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white">Recover Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enter your email and we'll send you a recovery link to reset your credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
            <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <span>Send Recovery Link</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
