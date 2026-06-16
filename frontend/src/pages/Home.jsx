import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../redux/slices/doctorSlice';
import DoctorCard from '../components/DoctorCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { FaSearch, FaUserMd, FaHospital, FaHeartbeat, FaCalendarCheck, FaQuoteLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { doctors, loading } = useSelector((state) => state.doctors);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    // Fetch only top-rated or first 3 doctors for homepage featured listing
    dispatch(fetchDoctors({ approved: 'true' }));
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/doctors');
    }
  };

  const specialties = [
    { name: 'Cardiologist', icon: '❤️', color: 'bg-red-500/10 text-red-500' },
    { name: 'Neurologist', icon: '🧠', color: 'bg-purple-500/10 text-purple-500' },
    { name: 'Dermatologist', icon: '☀️', color: 'bg-amber-500/10 text-amber-500' },
    { name: 'Orthopedic', icon: '🦴', color: 'bg-blue-500/10 text-blue-500' },
    { name: 'Pediatrician', icon: '👶', color: 'bg-emerald-500/10 text-emerald-500' },
    { name: 'Dentist', icon: '🦷', color: 'bg-teal-500/10 text-teal-500' },
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Cardiac Patient',
      quote: 'Booking appointments with Dr. Adams was incredibly straightforward. The timeline tool let me follow status updates in real-time, and my consultation was seamless.',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'Robert Chen',
      role: 'Family Medicine',
      quote: 'I loved being able to upload my medical PDFs before seeing the specialist. The doctor reviewed them beforehand, saving so much time during the visit.',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  ];

  const faqs = [
    {
      q: 'How do I schedule an appointment?',
      a: 'Go to Find Doctors page, search by specialty or name, select your preferred doctor, pick an available day/time slot, describe your symptoms, and submit. The doctor will review and confirm.',
    },
    {
      q: 'Can I upload my lab results or prescription files?',
      a: 'Yes, patients can upload PDFs, PNGs, and JPGs directly from the Patient Dashboard. Once uploaded, doctors who have bookings with you can safely download them.',
    },
    {
      q: 'What does the booking timeline display?',
      a: 'The tracking timeline shows 5 stages: Requested (waiting for confirmation), Approved, Confirmed (time slot is locked), Consultation Completed, or Cancelled.',
    },
    {
      q: 'Is my data secure?',
      a: 'Absolutely. We enforce JSON Web Tokens (JWT) for authentication, hash user credentials, apply role-based route blockings, and store documents securely.',
    },
  ];

  const blogs = [
    {
      title: '5 Daily Habits for a Healthy Heart',
      category: 'Cardiology',
      date: 'June 12, 2026',
      desc: 'Simple lifestyle modifications, including walking 30 minutes a day and reducing processed sugar, can decrease cardiovascular risks significantly...',
    },
    {
      title: 'Understanding Telehealth Consultation',
      category: 'Advice',
      date: 'May 28, 2026',
      desc: 'Virtual care is revolutionizing clinic access. Learn how to prepare your reports, camera, and symptom list for an effective session...',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100/50 dark:from-slate-900 dark:via-darkBg dark:to-brand-950/20 py-20 px-6 rounded-b-[2.5rem]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Area */}
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
              🏥 Modern Digital Healthcare Hub
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white leading-[1.15]">
              Find & Book Top <span className="text-brand-500">Specialists</span> Instantly
            </h1>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Connect with verified doctors, manage consultation schedules, view real-time appointment trackers, and host secure medical report documents.
            </p>

            {/* Quick search input form */}
            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto lg:mx-0 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg flex items-center">
              <div className="flex items-center flex-grow pl-3">
                <FaSearch className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search specializations, names, clinics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 text-sm text-slate-700 dark:text-slate-200"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-full font-bold text-xs shadow-sm transition-all"
              >
                Search
              </button>
            </form>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-sm mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-extrabold text-brand-500">12k+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Patients Saved</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-500">450+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Doctors</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-500">4.9★</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Review Rating</p>
              </div>
            </div>
          </div>

          {/* Banner Graphic Placeholder / generated image can go here */}
          <div className="hidden lg:flex justify-center relative">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full filter blur-3xl opacity-20 -z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
              alt="Telehealth consultation"
              className="rounded-3xl shadow-2xl border-4 border-white dark:border-slate-800 object-cover h-[450px] w-[500px]"
            />
          </div>
        </div>
      </section>

      {/* Categories Specialities section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Top Medical Specialities</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">Explore clinic schedules across specialized departments to book appointment tickets.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mt-10">
          {specialties.map((spec) => (
            <Link
              key={spec.name}
              to={`/doctors?specialization=${spec.name}`}
              className="glass-card hover-lift p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-white/40 dark:border-slate-800/80"
            >
              <div className={`h-14 w-14 rounded-full ${spec.color} flex items-center justify-center text-2xl mb-4`}>
                {spec.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">{spec.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-10">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-3xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Featured Doctors</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Book consultations with our highly recommended practitioners.</p>
          </div>
          <Link to="/doctors" className="mt-4 sm:mt-0 px-5 py-2.5 rounded-full border border-brand-500 text-brand-500 font-bold hover:bg-brand-500 hover:text-white transition-all text-xs">
            View All Doctors
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} />
        ) : doctors.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl">
            <p className="text-slate-500 dark:text-slate-400">No approved doctors registered on the platform yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.slice(0, 3).map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-brand-500/5 dark:bg-slate-900/40 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl font-['Outfit'] font-bold text-slate-800 dark:text-white">What Patients Say About Us</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Read real logs from our verified patient network regarding consultations, doctor availability schedules, and lab results.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((test, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl border border-white/50 dark:border-slate-800/80 shadow-sm relative flex flex-col justify-between">
                <div>
                  <FaQuoteLeft className="text-brand-500/20 text-4xl absolute top-4 right-4" />
                  <p className="text-slate-600 dark:text-slate-300 text-xs italic leading-relaxed">"{test.quote}"</p>
                </div>
                <div className="flex items-center space-x-3 mt-6">
                  <img src={test.img} alt={test.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white">{test.name}</h4>
                    <p className="text-[10px] text-slate-400">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Blog Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Daily Health Advice</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Stay informed with medical suggestions published by verified doctors.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-white/30 dark:border-slate-800 flex flex-col justify-between h-56 hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-brand-500/10 text-brand-500 text-[10px] font-bold uppercase">{blog.category}</span>
                  <span className="text-[10px] text-slate-400">{blog.date}</span>
                </div>
                <h3 className="font-bold text-base mt-3 text-slate-800 dark:text-white">{blog.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{blog.desc}</p>
              </div>
              <a href="#" className="text-brand-500 hover:text-brand-600 font-bold text-xs mt-4 inline-block">Read article &rarr;</a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-['Outfit'] font-bold text-slate-800 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Got questions about online telehealth scheduling? We have answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl overflow-hidden border border-white/30 dark:border-slate-800 shadow-sm transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-800 dark:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <FaChevronUp className="text-brand-500 text-xs" /> : <FaChevronDown className="text-brand-500 text-xs" />}
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed bg-slate-50/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
