import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route guard component for handling authentication and role-based views.
 * @param {object} props - Component properties
 * @param {string[]} props.allowedRoles - List of roles permitted to view the children (e.g. ['Admin', 'Doctor'])
 */
const ProtectedRoutes = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-darkBg text-center">
        <div className="glass-card max-w-md rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-extrabold text-red-500">403</h1>
          <h2 className="mt-4 text-xl font-bold dark:text-white">Access Denied</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            You do not have the required permissions to access this page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoutes;
