import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorById, clearSelectedDoctor } from '../redux/slices/doctorSlice';
import { fetchBusySlots, resetStatus } from '../redux/slices/appointmentSlice';
import RatingSelector from '../components/RatingSelector';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCalendarAlt, FaClock, FaHeart, FaHospital, FaShieldAlt, FaStar, FaStethoscope, FaUserMd, FaCreditCard, FaMobileAlt, FaWallet, FaMoneyBillWave, FaCheckCircle, FaLock, FaTimes } from 'react-icons/fa';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedDoctor, loading: doctorLoading } = useSelector((state) => state.doctors);
  const { busySlots, loading: bookingLoading, success, error } = useSelector((state) => state.appointments);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // States
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Simulated Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch doctor profiles and reviews
  useEffect(() => {
    dispatch(fetchDoctorById(id));
    fetchReviewsList();

    return () => {
      dispatch(clearSelectedDoctor());
      dispatch(resetStatus());
    };
  }, [id, dispatch]);

  // Fetch reviews via direct API
  const fetchReviewsList = async () => {
    try {
      const response = await api.get(`/reviews?doctorId=${id}`);
      setReviews(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Query busy slots when date selection updates
  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      dispatch(fetchBusySlots({ doctorId: selectedDoctor._id, date: selectedDate }));
      setSelectedSlot('');
    }
  }, [selectedDate, selectedDoctor, dispatch]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warn('Please sign in to book an appointment.');
      navigate('/login');
      return;
    }
    if (user.role !== 'Patient') {
      toast.warn('Only patients are authorized to request appointments.');
      return;
    }
    if (!selectedDate || !selectedSlot || !reason) {
      toast.warn('Please fill in all booking options.');
      return;
    }

    // Trigger payment checkout simulation
    setShowCheckout(true);
  };

  const handleSimulatePayment = async () => {
    // Validate inputs
    if (paymentMethod === 'Credit Card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      toast.warn('Please fill in all credit card details.');
      return;
    }
    if (paymentMethod === 'UPI' && !upiId) {
      toast.warn('Please enter your UPI ID.');
      return;
    }

    setPaymentLoading(true);
    try {
      // 1. Create the booking request in database
      const bookingRes = await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason,
      });

      const appointment = bookingRes.data.data;

      // 2. Process simulated payment checkout transaction
      await api.post(`/appointments/${appointment._id}/pay`, {
        paymentMethod,
        amount: selectedDoctor.consultationFee,
      });

      toast.success('Simulated transaction processed successfully! Appointment Confirmed.');
      setShowCheckout(false);
      setSelectedDate('');
      setSelectedSlot('');
      setReason('');
      
      setTimeout(() => {
        navigate('/dashboard/patient');
      }, 1500);
    } catch (err) {
      console.error('Payment checkout failed:', err);
      toast.error(err.response?.data?.message || 'Failed to complete checkout.');
    } finally {
      setPaymentLoading(false);
    }
  };


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText) {
      toast.warn('Please provide a comment for your review.');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        doctorId: selectedDoctor._id,
        rating,
        reviewText,
      });
      toast.success('Thank you for your feedback!');
      setReviewText('');
      setRating(5);
      fetchReviewsList();
      dispatch(fetchDoctorById(id)); // Reload doctor profile rating summary
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review. You must complete a consultation with this doctor before leaving a review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (doctorLoading || !selectedDoctor) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  // Get active schedule days for the doctor
  const availableDaysList = selectedDoctor.availability?.map((a) => a.day) || [];

  // Check if chosen date is one of doctor availability days
  const getSelectedDayName = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const activeDayName = getSelectedDayName(selectedDate);
  const activeAvailability = selectedDoctor.availability?.find((a) => a.day === activeDayName);
  const timeSlots = activeAvailability?.slots || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* 1. Profile header block */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative h-44 w-44 rounded-2xl bg-gradient-to-tr from-brand-50 to-brand-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {selectedDoctor.userId?.profileImage ? (
            <img
              src={selectedDoctor.userId.profileImage.startsWith('http') ? selectedDoctor.userId.profileImage : `http://localhost:5000${selectedDoctor.userId.profileImage}`}
              alt={selectedDoctor.userId.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUserMd className="text-brand-500 text-6xl" />
          )}
          {selectedDoctor.approved && (
            <span className="absolute bottom-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow">
              <FaShieldAlt />
              <span>Verified</span>
            </span>
          )}
        </div>

        <div className="flex-grow space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-800 dark:text-white">
                Dr. {selectedDoctor.userId?.name}
              </h1>
              <p className="text-sm text-brand-500 font-bold uppercase tracking-wider mt-1">
                {selectedDoctor.specialization} &bull; {selectedDoctor.qualification}
              </p>
            </div>
            <div className="text-amber-500 flex items-center justify-center md:justify-start space-x-1 bg-amber-500/10 px-3 py-1.5 rounded-full w-fit mx-auto md:mx-0">
              <FaStar />
              <span className="text-sm font-bold">{selectedDoctor.rating > 0 ? selectedDoctor.rating : 'New'}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({selectedDoctor.totalReviews} Reviews)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mt-6 text-slate-600 dark:text-slate-300">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Experience</p>
              <p className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">{selectedDoctor.experience} Years</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Consultation Fee</p>
              <p className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">${selectedDoctor.consultationFee}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Hospital Clinic</p>
              <p className="font-extrabold text-sm text-slate-800 dark:text-white mt-1 truncate">{selectedDoctor.hospitalName}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Clinic Address</p>
            <p>{selectedDoctor.clinicAddress}</p>
          </div>
        </div>
      </section>

      {/* 2. Interactive Availability calendar booking + reviews grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Availability calendar booking slot select widget */}
        <section className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <FaCalendarAlt className="text-brand-500 text-base" />
              <span>Schedule an Appointment</span>
            </h2>

            <div className="bg-brand-50/20 dark:bg-slate-800/40 p-4 rounded-2xl text-xs space-y-2 text-slate-600 dark:text-slate-300 border border-brand-500/10">
              <p className="font-bold text-brand-600 dark:text-brand-400">Doctor availability schedule:</p>
              {availableDaysList.length === 0 ? (
                <p className="text-slate-400">No active work hours published yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDoctor.availability.map((av) => (
                    <span key={av.day} className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 font-bold border border-slate-100 dark:border-slate-700 shadow-sm">
                      {av.day}: {av.slots.length} slots
                    </span>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">1. Select Appointment Date (Click a day on the calendar)</label>
                <div className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner max-w-full overflow-hidden text-xs select-none mb-4">
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    selectable={true}
                    headerToolbar={{
                      left: 'prev,next',
                      center: 'title',
                      right: 'today'
                    }}
                    height="auto"
                    dateClick={(info) => {
                      const chosenDate = info.dateStr;
                      const dateObj = new Date(chosenDate);
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                      if (availableDaysList.includes(dayName)) {
                        setSelectedDate(chosenDate);
                        toast.info(`Selected Date: ${chosenDate}`);
                      } else {
                        toast.warn(`Dr. ${selectedDoctor.userId?.name} is not scheduled to work on ${dayName}s.`);
                      }
                    }}
                    validRange={{
                      start: new Date().toISOString().split('T')[0]
                    }}
                    events={
                      selectedDoctor.availability?.map((av) => {
                        const events = [];
                        const d = new Date();
                        for (let i = 0; i < 30; i++) {
                          const checkD = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
                          const dayName = checkD.toLocaleDateString('en-US', { weekday: 'long' });
                          if (dayName === av.day) {
                            events.push({
                              title: `${av.slots.length} slots`,
                              start: checkD.toISOString().split('T')[0],
                              display: 'background',
                              backgroundColor: 'rgba(14, 165, 233, 0.15)',
                            });
                          }
                        }
                        return events;
                      }).flat()
                    }
                  />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Choose an available date from the calendar..."
                  value={selectedDate ? `${selectedDate} (${activeDayName})` : ''}
                  className="w-full bg-slate-100 dark:bg-slate-850 rounded-xl px-4 py-3 text-xs border border-transparent outline-none text-slate-700 dark:text-slate-200 font-bold"
                />
              </div>

              {/* Time Slots Options */}
              {selectedDate && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                    <span>Choose Available Time Slot</span>
                    <span className="text-[10px] text-brand-500 font-semibold">{activeDayName} schedule</span>
                  </label>

                  {!availableDaysList.includes(activeDayName) ? (
                    <p className="text-xs text-red-500 font-medium">Dr. {selectedDoctor.userId?.name} is not available on {activeDayName}s.</p>
                  ) : timeSlots.length === 0 ? (
                    <p className="text-xs text-slate-400">No slots published for {activeDayName}.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => {
                        const isBusy = busySlots.includes(slot);
                        const isSelected = selectedSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBusy}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-3 px-1 rounded-xl text-center text-[10px] font-bold transition-all border ${
                              isBusy
                                ? 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                : isSelected
                                ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500'
                            }`}
                          >
                            <span className="block">{slot}</span>
                            {isBusy && <span className="text-[8px] font-medium block text-red-400">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Symptoms Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Reason for Booking</label>
                <textarea
                  placeholder="Describe your health symptoms or reason for consulting the doctor..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-slate-200 dark:border-slate-700 outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors flex items-center justify-center space-x-2"
              >
                {bookingLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <FaClock />
                    <span>Confirm Consultation Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Right Sidebar: Reviews List & Feedback Submission */}
        <section className="space-y-6">
          {/* Reviews list */}
          <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-['Outfit'] font-bold text-slate-800 dark:text-white text-base">Reviews ({reviews.length})</h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">No reviews yet for this doctor.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">{rev.patientId?.name}</span>
                        {rev.isVerifiedPatient && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold flex items-center space-x-0.5">
                            <FaShieldAlt className="text-[8px]" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-0.5 text-amber-500 text-[10px]">
                        <FaStar />
                        <span className="font-bold">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">"{rev.reviewText}"</p>
                    <span className="text-[9px] text-slate-400 block pt-1">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feedback Form (Only for patients) */}
          {isAuthenticated && user?.role === 'Patient' && (
            <div className="glass-card p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-['Outfit'] font-bold text-slate-800 dark:text-white text-sm">Write a Review</h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Rating Score</label>
                  <RatingSelector rating={rating} onChange={setRating} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Your Review</label>
                  <textarea
                    placeholder="Provide details of your experience with the consultation..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Patient Review'}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      {/* 3. Simulated Checkout Payment Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-white/50 dark:border-slate-800 shadow-2xl relative space-y-6 bg-white dark:bg-darkBg max-h-[95vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition-colors p-1"
            >
              <FaTimes className="text-sm" />
            </button>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="font-['Outfit'] font-extrabold text-xl text-slate-855 dark:text-white flex items-center space-x-2">
                <FaMoneyBillWave className="text-emerald-500 animate-bounce" />
                <span>Simulated Secure Checkout</span>
              </h3>
              <p className="text-xs text-slate-400">
                Verify booking details and process your simulated consultation payment.
              </p>
            </div>

            {/* Booking Details Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Practitioner:</span>
                <span className="font-bold text-slate-800 dark:text-white">Dr. {selectedDoctor.userId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Specialization:</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedDoctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-bold text-brand-500">{selectedDate} at {selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reason:</span>
                <span className="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{reason}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800 dark:text-white">Consultation Fee:</span>
                <span className="font-extrabold text-emerald-500 text-base">${selectedDoctor.consultationFee}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Credit Card', icon: <FaCreditCard /> },
                  { name: 'UPI', icon: <FaMobileAlt /> },
                  { name: 'Wallet', icon: <FaWallet /> },
                  { name: 'Stripe Simulation', icon: <FaLock /> },
                  { name: 'Cash', icon: <FaMoneyBillWave /> },
                ].map((method) => {
                  const isSelected = paymentMethod === method.name;
                  return (
                    <button
                      key={method.name}
                      type="button"
                      onClick={() => setPaymentMethod(method.name)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center space-y-1 border text-[10px] font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      <span className="text-base">{method.icon}</span>
                      <span>{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Forms Inputs */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-850">
              {paymentMethod === 'Credit Card' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Enter UPI Address</label>
                  <input
                    type="text"
                    placeholder="e.g. name@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {paymentMethod === 'Wallet' && (
                <div className="p-3.5 bg-brand-50/20 dark:bg-slate-800/40 rounded-xl border border-brand-500/10 text-xs text-brand-600 dark:text-brand-400 font-bold flex items-center space-x-2 animate-fade-in">
                  <FaWallet className="text-base" />
                  <span>Deduct balance from linked MediConnect Patient Wallet.</span>
                </div>
              )}

              {paymentMethod === 'Stripe Simulation' && (
                <div className="p-3.5 bg-blue-50/20 dark:bg-slate-800/40 rounded-xl border border-blue-500/10 text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center space-x-2 animate-fade-in">
                  <FaLock className="text-base" />
                  <span>Secure Sandbox Stripe Gateway Integration Active.</span>
                </div>
              )}

              {paymentMethod === 'Cash' && (
                <div className="p-3.5 bg-amber-50/20 dark:bg-slate-800/40 rounded-xl border border-amber-500/10 text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center space-x-2 animate-fade-in">
                  <FaMoneyBillWave className="text-base" />
                  <span>No prepayment needed. Pay ${selectedDoctor.consultationFee} at the clinic.</span>
                </div>
              )}
            </div>

            {/* Simulated Checkout Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={paymentLoading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-colors flex items-center justify-center space-x-2"
            >
              {paymentLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Authorize simulated transaction of ${selectedDoctor.consultationFee}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;
