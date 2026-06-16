import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { fetchNotifications, markNotificationsAsRead } from '../redux/slices/notificationSlice';
import { FaSun, FaMoon, FaBell, FaBars, FaTimes, FaUser, FaStethoscope, FaSignOutAlt, FaColumns } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notiRef = useRef(null);
  const profileRef = useRef(null);

  // Initialize and track dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch notifications once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const handleMarkAsRead = () => {
    dispatch(markNotificationsAsRead());
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Admin') return '/dashboard/admin';
    if (user.role === 'Doctor') return '/dashboard/doctor';
    return '/dashboard/patient';
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 py-3 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-extrabold text-2xl tracking-tight">
          <FaStethoscope className="text-3xl animate-pulse" />
          <span className="font-['Outfit'] font-extrabold">Med<span className="text-slate-800 dark:text-white">Connect</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium transition-colors">Home</Link>
          <Link to="/doctors" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium transition-colors">Find Doctors</Link>
          
          {isAuthenticated && (
            <Link to={getDashboardLink()} className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium transition-colors">Dashboard</Link>
          )}
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
          </button>

          {/* Notifications Trigger */}
          {isAuthenticated && (
            <div className="relative" ref={notiRef}>
              <button
                onClick={() => {
                  setNotiDropdownOpen(!notiDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-800 text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notiDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl shadow-xl py-3 z-50 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAsRead}
                        className="text-xs text-brand-500 hover:text-brand-600 font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
                    ) : (
                      notifications.map((noti) => (
                        <div
                          key={noti._id}
                          className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            !noti.readStatus ? 'bg-brand-50/20 dark:bg-brand-500/5' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">{noti.title}</h4>
                            {!noti.readStatus && <span className="h-2 w-2 rounded-full bg-brand-500"></span>}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{noti.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-2">
                            {new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown or Login Buttons */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotiDropdownOpen(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000${user.profileImage}`}
                    alt={user.name}
                    className="h-8.5 w-8.5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="h-8.5 w-8.5 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Profile Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-card rounded-2xl shadow-xl py-2 z-50 border border-slate-100 dark:border-slate-700/50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 uppercase">
                      {user?.role}
                    </span>
                  </div>
                  
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FaColumns className="text-slate-400" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                  >
                    <FaSignOutAlt className="text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login" className="px-5 py-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-full transition-all shadow-sm shadow-brand-500/20">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card mt-3 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-800/80 animate-fadeIn">
          <div className="flex flex-col space-y-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 py-2 font-medium">Home</Link>
            <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 py-2 font-medium">Find Doctors</Link>
            
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 py-2 font-medium">Dashboard</Link>
                <button onClick={handleLogout} className="text-red-600 py-2 font-medium text-left">Sign Out</button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-center text-sm font-semibold text-brand-600 border border-brand-500/20 rounded-full">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-center text-sm font-semibold bg-brand-500 text-white rounded-full">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
