import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAppointments, updateAppointment, fetchBusySlots, resetStatus } from '../redux/slices/appointmentSlice';
import { updateProfile } from '../redux/slices/authSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import AppointmentTimeline from '../components/AppointmentTimeline';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCalendarCheck, FaFileMedical, FaBell, FaUserCog, FaUpload, FaDownload, FaTrash, FaClock, FaEdit, FaTimes } from 'react-icons/fa';

const PatientDashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { appointments, busySlots, loading: bookingLoading } = useSelector((state) => state.appointments);
  const { notifications } = useSelector((state) => state.notifications);

  // Tabs
  const [activeTab, setActiveTab] = useState('appointments');

  // Rescheduling modal/state
  const [rescheduleTarget, setRescheduleTarget] = useState(null); // appointment object
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');

  // Medical Reports Upload
  const [reports, setReports] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  // Profile Edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [age, setAge] = useState(user?.profile?.age || '');
  const [bloodGroup, setBloodGroup] = useState(user?.profile?.bloodGroup || 'O+');
  const [emergencyContact, setEmergencyContact] = useState(user?.profile?.emergencyContact || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchNotifications());
    fetchReportsList();
  }, [dispatch]);

  // Fetch busy slots if reschedule target & date change
  useEffect(() => {
    if (rescheduleTarget && rescheduleDate) {
      dispatch(fetchBusySlots({ doctorId: rescheduleTarget.doctorId._id, date: rescheduleDate }));
      setRescheduleSlot('');
    }
  }, [rescheduleDate, rescheduleTarget, dispatch]);

  const fetchReportsList = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleSlot) {
      toast.warn('Please select both a date and time slot.');
      return;
    }
    dispatch(
      updateAppointment({
        id: rescheduleTarget._id,
        appointmentDate: rescheduleDate,
        appointmentTime: rescheduleSlot,
      })
    ).then((res) => {
      if (!res.error) {
        toast.success('Appointment rescheduled successfully! Awaiting doctor review.');
        setRescheduleTarget(null);
        setRescheduleDate('');
        setRescheduleSlot('');
        dispatch(fetchAppointments());
      } else {
        toast.error(res.payload || 'Rescheduling failed.');
      }
    });
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      dispatch(updateAppointment({ id, status: 'Cancelled' })).then((res) => {
        if (!res.error) {
          toast.success('Appointment cancelled successfully.');
          dispatch(fetchAppointments());
        } else {
          toast.error(res.payload || 'Cancellation failed.');
        }
      });
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportTitle || !reportFile) {
      toast.warn('Please provide a title and select a file.');
      return;
    }

    setUploadingReport(true);
    const formData = new FormData();
    formData.append('reportTitle', reportTitle);
    formData.append('reportFile', reportFile);

    try {
      await api.post('/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Medical report uploaded successfully!');
      setReportTitle('');
      setReportFile(null);
      // Reset html file input
      document.getElementById('reportFileInput').value = '';
      fetchReportsList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'File upload failed. Only PDF, PNG, and JPG allowed.');
    } finally {
      setUploadingReport(false);
    }
  };

  const handleReportDelete = async (id) => {
    if (window.confirm('Delete this report file permanently?')) {
      try {
        await api.delete(`/reports/${id}`);
        toast.success('Report deleted successfully.');
        fetchReportsList();
      } catch (err) {
        toast.error('Failed to delete report.');
      }
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setUpdatingUser(true);
    dispatch(
      updateProfile({
        name,
        phone,
        gender,
        age: Number(age),
        bloodGroup,
        emergencyContact,
        address,
      })
    ).then((res) => {
      setUpdatingUser(false);
      if (!res.error) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(res.payload || 'Failed to update profile.');
      }
    });
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-3xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white mb-8">Patient Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Tabs Menu Navigation */}
        <div className="glass-card rounded-2xl p-4 border border-white/40 dark:border-slate-800/80 shadow-sm flex flex-row lg:flex-col overflow-x-auto gap-2 lg:overflow-visible">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'appointments'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaCalendarCheck />
            <span>My Appointments</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaFileMedical />
            <span>Medical Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'notifications'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaBell />
            <span>Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaUserCog />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Right Active Tab Content Area */}
        <div className="lg:col-span-3">
          
          {/* Tab 1: Appointments List */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Active Booking History</h2>
              </div>

              {appointments.length === 0 ? (
                <div className="glass-card py-20 text-center rounded-2xl border border-white/40 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">You have no active appointment bookings yet.</p>
                  <Link to="/doctors" className="mt-4 inline-block px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-full shadow-sm">
                    Book an Appointment
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {appointments.map((app) => {
                    const docName = app.doctorName || app.doctorId?.userId?.name || 'Doctor';
                    const specName = app.doctorSpecialization || app.doctorId?.specialization || 'General Medicine';
                    const avatar = app.doctorId?.userId?.profileImage;

                    return (
                      <div
                        key={app._id}
                        className="glass-card p-6 rounded-2xl border border-white/40 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between"
                      >
                        {/* Profile Info */}
                        <div className="flex items-start space-x-4 w-full md:w-auto">
                          <img
                            src={avatar ? (avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`) : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'}
                            alt={docName}
                            className="h-16 w-16 rounded-2xl object-cover border border-slate-200"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">Dr. {docName}</h3>
                            <p className="text-xs text-brand-500 font-bold uppercase tracking-wide mt-0.5">{specName}</p>
                            
                            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[11px] mt-3 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full w-fit">
                              <span className="font-bold">{app.appointmentDate}</span>
                              <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                              <span className="font-bold text-brand-500">{app.appointmentTime}</span>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 italic leading-relaxed">
                              Reason: "{app.reason}"
                            </p>

                            {app.payment ? (
                              <div className="flex items-center space-x-2 text-[10px] text-emerald-500 font-extrabold mt-2">
                                <span>💳 Paid via {app.payment.paymentMethod}</span>
                                <span>&bull;</span>
                                <span>TxID: {app.payment.transactionId}</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-[10px] text-amber-500 font-extrabold mt-2">
                                <span>💵 Cash on Appointment (Unpaid)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status timeline & actions */}
                        <div className="w-full md:w-80 flex flex-col justify-between items-end h-full min-h-[120px]">
                          {/* Timeline component */}
                          <AppointmentTimeline status={app.status} />

                          {/* Action triggers */}
                          {app.status !== 'Cancelled' && app.status !== 'Consultation Completed' && (
                            <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full justify-end">
                              <button
                                onClick={() => setRescheduleTarget(app)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <FaEdit />
                                <span>Reschedule</span>
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(app._id)}
                                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rescheduling Modal overlay */}
              {rescheduleTarget && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="glass-card max-w-lg w-full rounded-3xl p-6 border border-white/50 dark:border-slate-800 shadow-2xl relative space-y-6 bg-white dark:bg-darkBg">
                    <button
                      onClick={() => setRescheduleTarget(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                      <FaTimes />
                    </button>
                    
                    <h3 className="font-['Outfit'] font-extrabold text-lg text-slate-800 dark:text-white">
                      Reschedule Appointment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pick a new date and time slot for your appointment with Dr. {rescheduleTarget.doctorId?.userId?.name}.
                    </p>

                    <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                      {/* Date Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Select New Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border-0 outline-none text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Time Slots */}
                      {rescheduleDate && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Choose Available Time Slot</label>
                          <div className="grid grid-cols-3 gap-2">
                            {rescheduleTarget.doctorId?.availability
                              ?.find((a) => a.day === getSelectedDayName(rescheduleDate))
                              ?.slots.map((slot) => {
                                const isBusy = busySlots.includes(slot);
                                const isSelected = rescheduleSlot === slot;

                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => setRescheduleSlot(slot)}
                                    className={`py-2 px-1 rounded-xl text-center text-[9px] font-bold border transition-colors ${
                                      isBusy
                                        ? 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border-transparent'
                                        : isSelected
                                        ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500'
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                );
                              }) || <p className="col-span-3 text-xs text-red-500 font-medium">Doctor has no work scheduled for {getSelectedDayName(rescheduleDate)}.</p>}
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors"
                      >
                        Submit Rescheduling Request
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Medical Reports Uploader & Viewer */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              {/* Uploader Card */}
              <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <FaUpload className="text-brand-500 text-base" />
                  <span>Upload Medical Reports</span>
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Support formats: PDF, PNG, and JPG. Files are stored securely and can be downloaded or reviewed by your consulting doctors.
                </p>

                <form onSubmit={handleReportUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Report Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Lab Blood Work Results"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Select File</label>
                      <input
                        id="reportFileInput"
                        type="file"
                        onChange={(e) => setReportFile(e.target.files[0])}
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-500 file:cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingReport}
                    className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10 flex items-center space-x-2 ml-auto"
                  >
                    {uploadingReport ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    ) : (
                      <>
                        <FaUpload />
                        <span>Upload Lab Report</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-4">
                <h3 className="font-['Outfit'] font-bold text-slate-800 dark:text-white text-base">My Documents ({reports.length})</h3>

                {reports.length === 0 ? (
                  <div className="glass-card py-12 text-center rounded-2xl">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">No reports uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map((rep) => {
                      const fileUrl = rep.reportFile.startsWith('http') || rep.reportFile.startsWith('/uploads')
                        ? rep.reportFile.startsWith('/') ? `http://localhost:5000${rep.reportFile}` : rep.reportFile
                        : `http://localhost:5000/uploads/${rep.reportFile}`;

                      return (
                        <div
                          key={rep._id}
                          className="glass-card p-4 rounded-2xl border border-white/40 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <span className="text-3xl">📄</span>
                            <div className="truncate">
                              <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate" title={rep.reportTitle}>{rep.reportTitle}</h4>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                Uploaded on {new Date(rep.uploadDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-brand-500/10 hover:bg-brand-500 hover:text-white text-brand-500 rounded-lg transition-all"
                              title="Download/View File"
                            >
                              <FaDownload className="text-xs" />
                            </a>
                            <button
                              onClick={() => handleReportDelete(rep._id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all"
                              title="Delete Document"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Notifications log */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <FaBell className="text-brand-500 text-base" />
                <span>My Notifications Log</span>
              </h2>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">No alerts received.</p>
                ) : (
                  notifications.map((noti) => (
                    <div
                      key={noti._id}
                      className={`p-4 rounded-2xl border transition-colors flex items-start space-x-3 ${
                        !noti.readStatus
                          ? 'bg-brand-50/20 border-brand-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <span className="text-lg mt-0.5">🔔</span>
                      <div className="flex-grow">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white">{noti.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{noti.message}</p>
                        <span className="text-[9px] text-slate-400 block mt-2">
                          {new Date(noti.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Profile settings form */}
          {activeTab === 'settings' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <FaUserCog className="text-brand-500 text-base" />
                <span>Update Profile Settings</span>
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* General profile info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                    >
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact Info</label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10 flex items-center space-x-2 ml-auto"
                >
                  {updatingUser ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <span>Update Account Details</span>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
