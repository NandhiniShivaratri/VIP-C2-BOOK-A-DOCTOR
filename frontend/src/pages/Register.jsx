import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus, FaUser, FaUserMd } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  // Registration Roles
  const [role, setRole] = useState('Patient'); // Patient or Doctor

  // Base Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');

  // Patient Fields
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');

  // Handle errors or success redirects
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success('Registration successful! Check email for verification link.');
      const timer = setTimeout(() => {
        if (user.role === 'Admin') navigate('/dashboard/admin');
        else if (user.role === 'Doctor') navigate('/dashboard/doctor');
        else navigate('/dashboard/patient');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !phone) {
      toast.warn('Please fill in all general details.');
      return;
    }

    const baseData = { name, email, password, phone, gender, role };

    let submitData = {};

    if (role === 'Patient') {
      if (!age || !emergencyContact || !address) {
        toast.warn('Please fill in all patient profile details.');
        return;
      }
      submitData = { ...baseData, age: Number(age), bloodGroup, emergencyContact, address };
    } else {
      if (!qualification || !experience || !consultationFee || !hospitalName || !clinicAddress) {
        toast.warn('Please fill in all medical registration fields.');
        return;
      }
      submitData = {
        ...baseData,
        specialization,
        qualification,
        experience: Number(experience),
        consultationFee: Number(consultationFee),
        hospitalName,
        clinicAddress,
      };
    }

    dispatch(registerUser(submitData));
  };

  const specializations = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Dentist', 'General Medicine'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="glass-card max-w-2xl w-full rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-['Outfit'] font-extrabold text-slate-800 dark:text-white">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Join the MedConnect healthcare platform and schedule visits today.</p>
        </div>

        {/* Role Select Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('Patient')}
            className={`py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all ${
              role === 'Patient'
                ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <FaUser />
            <span>Join as Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('Doctor')}
            className={`py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all ${
              role === 'Doctor'
                ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <FaUserMd />
            <span>Join as Doctor</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Fields (Name, Email, Password, Phone, Gender) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              {role === 'Patient' ? 'Patient Profile Info' : 'Professional Practitioner Registration'}
            </h3>

            {/* Role specific input boxes */}
            {role === 'Patient' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                  <input
                    type="number"
                    placeholder="24"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
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
                    placeholder="Father: +1 555-0152"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</label>
                  <input
                    type="text"
                    placeholder="123 Health Ave, suite 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  >
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Medical Qualifications</label>
                  <input
                    type="text"
                    placeholder="MD, MBBS"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Experience (Years)</label>
                  <input
                    type="number"
                    placeholder="8"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee ($)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital Partner</label>
                  <input
                    type="text"
                    placeholder="Apollo Hospital"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Clinic Practice Address</label>
                  <input
                    type="text"
                    placeholder="742 Evergreen Terrace, Springfield"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs border border-transparent focus:border-brand-500 outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <FaUserPlus />
                <span>Create MedConnect Profile</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-500 hover:text-brand-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
