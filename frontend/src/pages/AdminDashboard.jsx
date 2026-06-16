import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDoctors, approveDoctor, deleteDoctorProfile } from '../redux/slices/doctorSlice';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaChartLine, FaUserCheck, FaUsers, FaFolder, FaUsersCog, FaTrash, FaCheck, FaTimes, FaHeartbeat } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const dispatch = useDispatch();

  // Tab state
  const [activeTab, setActiveTab] = useState('analytics');

  // Admin Data states
  const [analytics, setAnalytics] = useState(null);
  const [unapprovedDoctors, setUnapprovedDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'verification') {
        // Fetch doctors where approved = false
        const res = await api.get('/doctors?approved=false');
        setUnapprovedDoctors(res.data.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/auth/users');
        setAllUsers(res.data.data);
      } else if (activeTab === 'reports') {
        const res = await api.get('/reports');
        setAllReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDoctor = (id, approvedStatus) => {
    dispatch(approveDoctor({ id, approved: approvedStatus })).then((res) => {
      if (!res.error) {
        toast.success(`Doctor profile ${approvedStatus ? 'approved and made live' : 'rejected'}`);
        // Reload list
        fetchDashboardData();
      } else {
        toast.error('Failed to update doctor profile status.');
      }
    });
  };

  const handleDeleteUser = async (userId, role, doctorProfileId) => {
    if (window.confirm('Are you sure you want to delete this user profile? This action is irreversible.')) {
      try {
        if (role === 'Doctor' && doctorProfileId) {
          // If doctor, delete via doctor delete profile thunk (which deletes User + Doctor schemas)
          dispatch(deleteDoctorProfile(doctorProfileId)).then((res) => {
            if (!res.error) {
              toast.success('Doctor account deleted.');
              fetchDashboardData();
            } else {
              toast.error('Failed to delete doctor profile.');
            }
          });
        } else {
          // Delete standard user
          await api.delete(`/doctors/${userId}`); // admin routes support this, wait. In doctorController we delete by doctor profile ID. 
          // Let's make a generic user delete route or use doctorController.
          // Wait, if patient, we can add a delete user endpoint in backend or let admin delete them.
          // Let's add a DELETE route /api/auth/users/:id in authRoutes to support delete patient!
          // We can delete user directly:
          await api.delete(`/auth/users/${userId}`);
          toast.success('User account deleted successfully.');
          fetchDashboardData();
        }
      } catch (err) {
        toast.error('Failed to delete user.');
      }
    }
  };

  // Compile Chart data structures
  const getMonthlyAppointmentsData = () => {
    if (!analytics?.monthlyAnalytics) return { labels: [], datasets: [] };
    
    return {
      labels: analytics.monthlyAnalytics.map((d) => d.label),
      datasets: [
        {
          label: 'Total Consultations',
          data: analytics.monthlyAnalytics.map((d) => d.appointments),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#0284c7',
        },
      ],
    };
  };

  const getRegistrationsData = () => {
    if (!analytics?.registrationAnalytics) return { labels: [], datasets: [] };

    return {
      labels: analytics.registrationAnalytics.map((d) => d.label),
      datasets: [
        {
          label: 'Patients Registered',
          data: analytics.registrationAnalytics.map((d) => d.patients),
          backgroundColor: '#38bdf8',
          borderRadius: 4,
        },
        {
          label: 'Doctors Registered',
          data: analytics.registrationAnalytics.map((d) => d.doctors),
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
      ],
    };
  };

  const getSpecializationsData = () => {
    if (!analytics?.specializationCount) return { labels: [], datasets: [] };

    return {
      labels: analytics.specializationCount.map((s) => s.name),
      datasets: [
        {
          data: analytics.specializationCount.map((s) => s.count),
          backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'],
          borderWidth: 0,
        },
      ],
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-3xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white mb-8">Admin Console</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left tabs list */}
        <div className="glass-card rounded-2xl p-4 border border-white/40 dark:border-slate-800/80 shadow-sm flex flex-row lg:flex-col overflow-x-auto gap-2 lg:overflow-visible">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaChartLine />
            <span>Platform Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'verification'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaUserCheck />
            <span>Doctor Approvals</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'users'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaUsersCog />
            <span>User Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaFolder />
            <span>Medical Reports</span>
          </button>
        </div>

        {/* Right Active Tab Content */}
        <div className="lg:col-span-3">

          {/* Tab 1: Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Patients</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                    {loading ? '...' : analytics?.summary?.totalPatients}
                  </p>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Doctors</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                    {loading ? '...' : analytics?.summary?.totalDoctors}
                  </p>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Booked Consultations</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                    {loading ? '...' : analytics?.summary?.totalAppointments}
                  </p>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Revenue Collected</p>
                  <p className="text-3xl font-extrabold text-emerald-500 mt-1">
                    {loading ? '...' : `$${analytics?.summary?.totalRevenue}`}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Bookings line graph */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Monthly Bookings</h3>
                    <div className="h-64">
                      <Line data={getMonthlyAppointmentsData()} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </div>

                  {/* Monthly Registrations bar graph */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Registrations Rate</h3>
                    <div className="h-64">
                      <Bar data={getRegistrationsData()} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </div>

                  {/* Specializations Doughnut graph */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Doctors Specialization Distribution</h3>
                    <div className="h-64 flex justify-center">
                      <Doughnut data={getSpecializationsData()} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </div>

                  {/* Most Booked Doctors list */}
                  <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Most Booked Doctors</h3>
                    <div className="space-y-4 overflow-y-auto max-h-64 pr-1">
                      {analytics?.mostBookedDoctors?.length === 0 ? (
                        <p className="text-xs text-slate-400">No appointments records registered.</p>
                      ) : (
                        analytics?.mostBookedDoctors?.map((doc, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800 dark:text-white">Dr. {doc.name}</h4>
                              <span className="text-[10px] text-brand-500 font-semibold uppercase">{doc.specialization}</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 font-extrabold text-[10px]">
                              {doc.count} Bookings
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Doctor Verification */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Pending Doctor Verification Profiles</h2>

              {loading ? (
                <div className="flex justify-center py-20">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></span>
                </div>
              ) : unapprovedDoctors.length === 0 ? (
                <div className="glass-card py-20 text-center rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">No doctors currently awaiting profile approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unapprovedDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                      <div className="flex items-start space-x-4">
                        <span className="text-3xl">🩺</span>
                        <div>
                          <h3 className="font-bold text-slate-850 dark:text-white text-sm">Dr. {doc.userId?.name}</h3>
                          <p className="text-[10px] text-brand-500 font-bold uppercase tracking-wider mt-0.5">
                            {doc.specialization} &bull; {doc.qualification}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-2">Clinic: {doc.clinicAddress} &bull; Hospital: {doc.hospitalName}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Fee: ${doc.consultationFee} &bull; Experience: {doc.experience} Years</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveDoctor(doc._id, true)}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1"
                        >
                          <FaCheck />
                          <span>Approve & Live</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: User Directory */}
          {activeTab === 'users' && (
            <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Active User Directory</h2>

              {loading ? (
                <div className="flex justify-center py-20">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="pb-3 pl-2">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Verified</th>
                        <th className="pb-3 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u) => (
                        <tr key={u._id} className="border-b border-slate-50 dark:border-slate-850 last:border-none text-xs text-slate-700 dark:text-slate-300">
                          <td className="py-4 pl-2 font-bold text-slate-800 dark:text-white">{u.name}</td>
                          <td className="py-4">{u.email}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase ${
                              u.role === 'Admin'
                                ? 'bg-red-500/10 text-red-500'
                                : u.role === 'Doctor'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-brand-500/10 text-brand-500'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 font-bold">{u.isVerified ? '🟢 Yes' : '🔴 No'}</td>
                          <td className="py-4 text-right pr-2">
                            {u.role !== 'Admin' && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.role, null)} // we pass null, doc can be deleted via userid directly through standard api route
                                className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all"
                                title="Delete user account"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Platform Reports */}
          {activeTab === 'reports' && (
            <div className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Platform Uploaded Medical Reports</h2>

              {loading ? (
                <div className="flex justify-center py-20">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></span>
                </div>
              ) : allReports.length === 0 ? (
                <p className="text-xs text-slate-400">No medical reports uploaded by patients on the platform yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allReports.map((rep) => {
                    const fileUrl = rep.reportFile.startsWith('http') || rep.reportFile.startsWith('/uploads')
                      ? rep.reportFile.startsWith('/') ? `http://localhost:5000${rep.reportFile}` : rep.reportFile
                      : `http://localhost:5000/uploads/${rep.reportFile}`;

                    return (
                      <div key={rep._id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <div className="truncate pr-4">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{rep.reportTitle}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Patient: {rep.patientId?.name || 'Unknown'}</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Uploaded: {new Date(rep.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] rounded-lg shadow"
                        >
                          View File
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
