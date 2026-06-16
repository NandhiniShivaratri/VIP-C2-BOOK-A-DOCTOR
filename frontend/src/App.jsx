import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';
import { addRealtimeNotification } from './redux/slices/notificationSlice';
import io from 'socket.io-client';

// Layout & Navigation Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoutes from './components/ProtectedRoutes';

// Pages
import Home from './pages/Home';
import SearchDoctors from './pages/SearchDoctors';
import DoctorDetails from './pages/DoctorDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // 1. Load active session on application start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  // 2. Configure WebSockets when user is successfully authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.io server
      const socket = io('http://localhost:5000');

      // Join private user room channel
      socket.emit('join', user.id);

      // Listen for incoming notifications
      socket.on('notification', (noti) => {
        // Log to Redux Store
        dispatch(addRealtimeNotification(noti));
        // Display toast popup alert
        toast.info(
          <div className="space-y-1">
            <h4 className="font-bold text-xs">{noti.title}</h4>
            <p className="text-[10px] text-slate-500">{noti.message}</p>
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      });

      // Clean up connection on logout or profile changes
      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <ToastContainer position="top-right" autoClose={5000} />
        
        {/* Sticky Header */}
        <Navbar />

        {/* Page contents */}
        <main className="flex-grow">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<SearchDoctors />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Patient Dashboards */}
            <Route element={<ProtectedRoutes allowedRoles={['Patient']} />}>
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
            </Route>

            {/* Protected Doctor Dashboards */}
            <Route element={<ProtectedRoutes allowedRoles={['Doctor']} />}>
              <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            </Route>

            {/* Protected Admin Dashboards */}
            <Route element={<ProtectedRoutes allowedRoles={['Admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
            </Route>

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
