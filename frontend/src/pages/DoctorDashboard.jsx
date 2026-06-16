import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, updateAppointment } from '../redux/slices/appointmentSlice';
import { updateProfile } from '../redux/slices/authSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaCalendarAlt, FaClock, FaUsers, FaChartBar, FaUserCog, FaCheck, FaTimes, FaEye, FaDollarSign, FaStar, FaPlus } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DoctorDashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { appointments } = useSelector((state) => state.appointments);

  // Tabs
  const [activeTab, setActiveTab] = useState('requests');

  // Availability Schedule builder state
  const [availSchedule, setAvailSchedule] = useState(user?.profile?.availability || []);
  const [newDay, setNewDay] = useState('Monday');
  const [newSlot, setNewSlot] = useState('09:00 AM');

  // Shared patient records state
  const [selectedPatientReports, setSelectedPatientReports] = useState(null); // patient name & reports array
  const [reviews, setReviews] = useState([]);

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [specialization, setSpecialization] = useState(user?.profile?.specialization || 'General Medicine');
  const [qualification, setQualification] = useState(user?.profile?.qualification || 'MBBS');
  const [experience, setExperience] = useState(user?.profile?.experience || '');
  const [consultationFee, setConsultationFee] = useState(user?.profile?.consultationFee || '');
  const [hospitalName, setHospitalName] = useState(user?.profile?.hospitalName || '');
  const [clinicAddress, setClinicAddress] = useState(user?.profile?.clinicAddress || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchNotifications());
    fetchDoctorReviews();
  }, [dispatch]);

  const fetchDoctorReviews = async () => {
    if (user?.profile?._id) {
      try {
        const res = await api.get(`/reviews?doctorId=${user.profile._id}`);
        setReviews(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateAppointment({ id, status: newStatus })).then((res) => {
      if (!res.error) {
        toast.success(`Appointment status updated to ${newStatus}`);
        dispatch(fetchAppointments());
      } else {
        toast.error(res.payload || 'Failed to update appointment.');
      }
    });
  };

  // Availability Schedule Handlers
  const handleAddSlot = () => {
    const dayIndex = availSchedule.findIndex((a) => a.day === newDay);
    
    if (dayIndex !== -1) {
      // Day exists, check if slot already added
      if (availSchedule[dayIndex].slots.includes(newSlot)) {
        toast.warn('Time slot already added for this day.');
        return;
      }
      const updated = JSON.parse(JSON.stringify(availSchedule));
      updated[dayIndex].slots.push(newSlot);
      // Sort slots chronologically (simple string sort for now)
      updated[dayIndex].slots.sort();
      setAvailSchedule(updated);
    } else {
      // Day does not exist, insert new day object
      setAvailSchedule([...availSchedule, { day: newDay, slots: [newSlot] }]);
    }
    toast.success(`Added slot ${newSlot} to ${newDay}`);
  };

  const handleRemoveSlot = (dayName, slotTime) => {
    const updated = availSchedule.map((dayObj) => {
      if (dayObj.day === dayName) {
        return {
          ...dayObj,
          slots: dayObj.slots.filter((s) => s !== slotTime),
        };
      }
      return dayObj;
    }).filter((dayObj) => dayObj.slots.length > 0); // remove empty days
    setAvailSchedule(updated);
  };

  const handleSaveAvailability = () => {
    dispatch(updateProfile({ availability: availSchedule })).then((res) => {
      if (!res.error) {
        toast.success('Availability schedule saved successfully!');
      } else {
        toast.error(res.payload || 'Failed to save schedule.');
      }
    });
  };

  // View patient shared reports list
  const handleViewPatientReports = async (patientId, patientName) => {
    try {
      const response = await api.get(`/reports?patientId=${patientId}`);
      setSelectedPatientReports({
        name: patientName,
        reports: response.data.data,
      });
    } catch (error) {
      toast.error('Could not fetch patient medical reports. Make sure they have a past or upcoming booking with you.');
    }
  };

  const handleDoctorProfileUpdate = (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    dispatch(
      updateProfile({
        name,
        phone,
        gender,
        specialization,
        qualification,
        experience: Number(experience),
        consultationFee: Number(consultationFee),
        hospitalName,
        clinicAddress,
      })
    ).then((res) => {
      setUpdatingProfile(false);
      if (!res.error) {
        toast.success('Doctor details updated successfully!');
      } else {
        toast.error(res.payload || 'Failed to update doctor details.');
      }
    });
  };

  // Compile Chart data (bookings breakdown by status)
  const compileChartData = () => {
    const counts = { Requested: 0, Approved: 0, Confirmed: 0, 'Consultation Completed': 0, Cancelled: 0 };
    appointments.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return {
      labels: Object.keys(counts).map((k) => k === 'Consultation Completed' ? 'Completed' : k),
      datasets: [
        {
          label: 'Total Bookings',
          data: Object.values(counts),
          backgroundColor: ['#38bdf8', '#3b82f6', '#0ea5e9', '#10b981', '#f43f5e'],
          borderRadius: 8,
        },
      ],
    };
  };

  const totalEarnings = appointments
    .filter((a) => a.status === 'Consultation Completed')
    .reduce((sum, a) => sum + (user?.profile?.consultationFee || 0), 0);

  // Group unique patients who booked with this doctor
  const getUniquePatients = () => {
    const patientMap = {};
    appointments.forEach((app) => {
      if (app.patientId) {
        patientMap[app.patientId._id] = app.patientId;
      }
    });
    return Object.values(patientMap);
  };

  const uniquePatients = getUniquePatients();
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white">Doctor Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in: <span className="font-bold text-slate-700 dark:text-slate-300">Dr. {user?.name}</span> &bull; Status:{' '}
            <span className={`font-bold ${user?.profile?.approved ? 'text-emerald-500' : 'text-amber-500'}`}>
              {user?.profile?.approved ? 'Approved / Public' : 'Pending Verification'}
            </span>
          </p>
        </div>
        <div className="bg-emerald-500/10 dark:bg-emerald-500/5 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-emerald-500 text-xs border border-emerald-500/10">
          <FaDollarSign />
          <span className="font-bold">Consultation Earnings: ${totalEarnings}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left tabs selector */}
        <div className="glass-card rounded-2xl p-4 border border-white/40 dark:border-slate-800/80 shadow-sm flex flex-row lg:flex-col overflow-x-auto gap-2 lg:overflow-visible">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'requests'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaClock />
            <span>Consultation Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'availability'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaCalendarAlt />
            <span>Schedule Weekly Slots</span>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'patients'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaUsers />
            <span>My Patients Files</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold w-full whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FaChartBar />
            <span>Earnings & Feedback</span>
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
            <span>Portfolio Settings</span>
          </button>
        </div>

        {/* Right Active Content Panel */}
        <div className="lg:col-span-3">

          {/* Tab 1: Requests Panel */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Active Consultation Slots</h2>

              {appointments.length === 0 ? (
                <div className="glass-card py-20 text-center rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">No appointment bookings requested by patients yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((app) => {
                    const patName = app.patientId?.name || 'Patient';
                    const patPhone = app.patientId?.phone || 'N/A';
                    const patGender = app.patientId?.gender || 'N/A';
                    const avatar = app.patientId?.profileImage;

                    return (
                      <div
                        key={app._id}
                        className="glass-card p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                      >
                        <div className="flex items-start space-x-4 w-full md:w-auto">
                          <img
                            src={avatar ? (avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={patName}
                            className="h-14 w-14 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Patient: {patName}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Phone: {patPhone} &bull; Gender: {patGender}</p>
                            
                            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[10px] mt-3 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
                              <span className="font-bold">{app.appointmentDate}</span>
                              <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                              <span className="font-bold text-brand-500">{app.appointmentTime}</span>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 italic">Reason: "{app.reason}"</p>

                            {app.payment ? (
                              <div className="flex items-center space-x-2 text-[9px] text-emerald-500 font-extrabold mt-2">
                                <span>💳 Paid: ${app.payment.amount} via {app.payment.paymentMethod}</span>
                                <span>&bull;</span>
                                <span>Tx: {app.payment.transactionId}</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-[9px] text-amber-500 font-extrabold mt-2">
                                <span>💵 Cash on Appointment (Unpaid)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Label or Actions */}
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            app.status === 'Requested'
                              ? 'bg-amber-500/10 text-amber-500'
                              : app.status === 'Approved'
                              ? 'bg-blue-500/10 text-blue-500'
                              : app.status === 'Confirmed'
                              ? 'bg-brand-500/10 text-brand-500'
                              : app.status === 'Consultation Completed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            {app.status === 'Consultation Completed' ? 'Completed' : app.status}
                          </span>

                          {app.status !== 'Cancelled' && app.status !== 'Consultation Completed' && (
                            <div className="flex space-x-1 mt-2">
                              {app.status === 'Requested' && (
                                <button
                                  onClick={() => handleStatusChange(app._id, 'Approved')}
                                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-lg transition-colors text-xs font-bold"
                                  title="Approve request"
                                >
                                  Approve
                                </button>
                              )}
                              {app.status === 'Approved' && (
                                <button
                                  onClick={() => handleStatusChange(app._id, 'Confirmed')}
                                  className="p-2 bg-brand-500/10 hover:bg-brand-500 hover:text-white text-brand-500 rounded-lg transition-colors text-xs font-bold"
                                  title="Lock slot schedule"
                                >
                                  Lock Slot
                                </button>
                              )}
                              {app.status === 'Confirmed' && (
                                <button
                                  onClick={() => handleStatusChange(app._id, 'Consultation Completed')}
                                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 rounded-lg transition-colors text-xs font-bold"
                                  title="Complete Consultation"
                                >
                                  Consultation Complete
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusChange(app._id, 'Cancelled')}
                                className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-colors text-xs font-bold"
                                title="Reject / Cancel slot"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Availability Builder */}
          {activeTab === 'availability' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Publish Schedule Availability</h2>
                <button
                  onClick={handleSaveAvailability}
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors"
                >
                  Save Availability Schedule
                </button>
              </div>

              {/* Add slot widget */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Day of Week</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-700 dark:text-slate-200"
                  >
                    {weekDays.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Time Slot</label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-700 dark:text-slate-200"
                  >
                    {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
                >
                  <FaPlus />
                  <span>Add Time Slot</span>
                </button>
              </div>

              {/* Display weekly agenda slots */}
              <div className="space-y-6 pt-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Weekly Schedule</h3>

                {availSchedule.length === 0 ? (
                  <p className="text-xs text-slate-400">No work slots configured yet. Use the selector above to build your daily agenda.</p>
                ) : (
                  <div className="space-y-4">
                    {availSchedule.map((dayObj) => (
                      <div key={dayObj.day} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl">
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-3">{dayObj.day}</h4>
                        <div className="flex flex-wrap gap-2">
                          {dayObj.slots.map((s) => (
                            <span
                              key={s}
                              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-950 font-bold text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center space-x-2 shadow-sm"
                            >
                              <span>{s}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(dayObj.day, s)}
                                className="text-red-500 hover:text-red-600 font-bold"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Patient shared folders */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Active Patient Directory</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uniquePatients.length === 0 ? (
                  <p className="text-xs text-slate-400 col-span-2">No patients booked consultations with you yet.</p>
                ) : (
                  uniquePatients.map((pat) => (
                    <div
                      key={pat._id}
                      className="glass-card p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={pat.profileImage ? (pat.profileImage.startsWith('http') ? pat.profileImage : `http://localhost:5000${pat.profileImage}`) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={pat.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white">{pat.name}</h4>
                          <span className="text-[10px] text-slate-400">Gender: {pat.gender || 'N/A'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewPatientReports(pat._id, pat.name)}
                        className="px-3.5 py-2 bg-brand-500/10 hover:bg-brand-500 hover:text-white text-brand-500 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <FaEye />
                        <span>View Shared Files</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Shared Files Modal Overlay */}
              {selectedPatientReports && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="glass-card max-w-xl w-full rounded-3xl p-6 border border-white/50 dark:border-slate-800 shadow-2xl relative space-y-6 bg-white dark:bg-darkBg">
                    <button
                      onClick={() => setSelectedPatientReports(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
                    >
                      <FaTimes />
                    </button>
                    
                    <h3 className="font-['Outfit'] font-extrabold text-lg text-slate-800 dark:text-white">
                      Medical Records: {selectedPatientReports.name}
                    </h3>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {selectedPatientReports.reports.length === 0 ? (
                        <p className="text-center py-10 text-xs text-slate-500">Patient has not uploaded any report files.</p>
                      ) : (
                        selectedPatientReports.reports.map((rep) => {
                          const fileUrl = rep.reportFile.startsWith('http') || rep.reportFile.startsWith('/uploads')
                            ? rep.reportFile.startsWith('/') ? `http://localhost:5000${rep.reportFile}` : rep.reportFile
                            : `http://localhost:5000/uploads/${rep.reportFile}`;

                          return (
                            <div key={rep._id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-850">
                              <div>
                                <h4 className="font-bold text-xs text-slate-800 dark:text-white">{rep.reportTitle}</h4>
                                <span className="text-[9px] text-slate-400 mt-0.5 block">Uploaded: {new Date(rep.uploadDate).toLocaleDateString()}</span>
                              </div>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 bg-brand-500 text-white font-bold text-[10px] rounded-lg shadow flex items-center space-x-1"
                              >
                                <FaEye />
                                <span>View File</span>
                              </a>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Earnings chart & Reviews list */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Earnings chart */}
              <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-['Outfit'] font-bold text-slate-800 dark:text-white text-base">Booking Status Breakdown</h3>
                <div className="h-64 flex items-center justify-center">
                  {appointments.length === 0 ? (
                    <p className="text-xs text-slate-400">No chart data compiled yet.</p>
                  ) : (
                    <Bar data={compileChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
                  )}
                </div>
              </div>

              {/* Reviews list */}
              <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-['Outfit'] font-bold text-slate-800 dark:text-white text-base">Patient Feedback Log</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">No feedback submitted yet.</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev._id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white">{rev.patientId?.name}</h4>
                          <div className="flex items-center space-x-1 text-amber-500 text-[10px]">
                            <FaStar />
                            <span className="font-bold">{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{rev.reviewText}"</p>
                        <span className="text-[9px] text-slate-400 block pt-1">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Portfolio Settings */}
          {activeTab === 'settings' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <FaUserCog className="text-brand-500 text-base" />
                <span>Portfolio Settings</span>
              </h2>

              <form onSubmit={handleDoctorProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Doctor Name</label>
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Qualifications</label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Experience (Years)</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee ($)</label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital Partner</label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Clinic Practice Address</label>
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10 flex items-center space-x-2 ml-auto"
                >
                  {updatingProfile ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <span>Save Professional Portfolio</span>
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

export default DoctorDashboard;
