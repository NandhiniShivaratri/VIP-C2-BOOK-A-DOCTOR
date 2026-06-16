import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHospital, FaClock, FaDollarSign, FaShieldAlt } from 'react-icons/fa';

const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;

  const {
    _id,
    userId,
    specialization,
    qualification,
    experience,
    consultationFee,
    hospitalName,
    rating,
    totalReviews,
    approved,
  } = doctor;

  const docName = userId?.name || 'Doctor';
  const imgUrl = userId?.profileImage
    ? userId.profileImage.startsWith('http')
      ? userId.profileImage
      : `http://localhost:5000${userId.profileImage}`
    : null;

  return (
    <div className="glass-card hover-lift rounded-2xl overflow-hidden shadow-sm flex flex-col h-full border border-white/40 dark:border-slate-800/80">
      {/* Header Profile Image area */}
      <div className="relative h-48 w-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={docName}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-brand-500 font-extrabold text-5xl opacity-40 select-none">
            MD
          </div>
        )}
        {/* Specialization Badge */}
        <span className="absolute bottom-3 left-3 bg-brand-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {specialization}
        </span>
        {approved && (
          <span className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 backdrop-blur-sm shadow-sm">
            <FaShieldAlt className="text-xs" />
            <span>Verified</span>
          </span>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Name & Credentials */}
          <div className="flex justify-between items-start">
            <h3 className="font-['Outfit'] font-bold text-lg text-slate-800 dark:text-white truncate" title={docName}>
              Dr. {docName}
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {qualification}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 mt-1.5 text-amber-500">
            <FaStar className="text-sm" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{rating > 0 ? rating : 'New'}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({totalReviews} reviews)
            </span>
          </div>

          {/* Clinic Address / hospital */}
          <div className="space-y-2 mt-4 text-slate-600 dark:text-slate-300 text-xs">
            <div className="flex items-center space-x-2">
              <FaHospital className="text-slate-400 text-sm flex-shrink-0" />
              <span className="truncate">{hospitalName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaClock className="text-slate-400 text-sm flex-shrink-0" />
              <span>{experience} years experience</span>
            </div>
          </div>
        </div>

        {/* Pricing & Booking Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Fee</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-white flex items-center">
              <FaDollarSign className="text-slate-400 text-sm -mr-0.5" />
              {consultationFee}
            </p>
          </div>
          <Link
            to={`/doctors/${_id}`}
            className="px-5 py-2.5 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-full transition-colors shadow-sm shadow-brand-500/10"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
