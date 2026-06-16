import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchRecommendations } from '../redux/slices/doctorSlice';
import DoctorCard from '../components/DoctorCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { FaFilter, FaSearch, FaSlidersH, FaStar } from 'react-icons/fa';

const SearchDoctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const { doctors, recommendations, loading } = useSelector((state) => state.doctors);

  // Read URL search params for initial state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');
  const [minFee, setMinFee] = useState(searchParams.get('minFee') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  // Fetch doctors list whenever search parameters change
  useEffect(() => {
    const query = {};
    if (search) query.search = search;
    if (specialization) query.specialization = specialization;
    if (experience) query.experience = experience;
    if (minFee) query.minFee = minFee;
    if (maxFee) query.maxFee = maxFee;
    if (rating) query.rating = rating;
    if (availability) query.availability = availability;
    if (sort) query.sort = sort;

    dispatch(fetchDoctors(query));
  }, [searchParams, dispatch]);

  // Fetch recommendations once
  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (specialization) params.specialization = specialization;
    if (experience) params.experience = experience;
    if (minFee) params.minFee = minFee;
    if (maxFee) params.maxFee = maxFee;
    if (rating) params.rating = rating;
    if (availability) params.availability = availability;
    if (sort) params.sort = sort;

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('');
    setExperience('');
    setMinFee('');
    setMaxFee('');
    setRating('');
    setAvailability('');
    setSort('');
    setSearchParams({});
  };

  const specializations = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Dentist', 'General Medicine'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* 1. Recommendation System Banner Carousel */}
      {recommendations.topRated?.length > 0 && (
        <section className="bg-brand-500/5 dark:bg-slate-900/30 p-6 sm:p-8 rounded-3xl border border-brand-500/10">
          <h2 className="text-xl font-['Outfit'] font-bold text-slate-800 dark:text-white mb-6">Trending & Recommended Specialists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.topRated.slice(0, 4).map((rec) => (
              <div
                key={rec._id}
                onClick={() => {
                  setSpecialization(rec.specialization);
                  setSearchParams({ specialization: rec.specialization });
                }}
                className="glass-card hover-lift p-4 rounded-xl text-center border border-white/50 dark:border-slate-800 cursor-pointer flex flex-col items-center"
              >
                <img
                  src={rec.userId?.profileImage ? (rec.userId.profileImage.startsWith('http') ? rec.userId.profileImage : `http://localhost:5000${rec.userId.profileImage}`) : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'}
                  alt={rec.userId?.name}
                  className="h-14 w-14 rounded-full object-cover border-2 border-brand-200"
                />
                <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-3 truncate w-full">Dr. {rec.userId?.name}</h4>
                <p className="text-[10px] text-brand-500 font-semibold uppercase mt-1">{rec.specialization}</p>
                <div className="flex items-center space-x-1 text-amber-500 text-[10px] mt-2">
                  <FaStar />
                  <span className="font-bold">{rec.rating} ★</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Main Search Engine Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Filters Panel */}
        <form onSubmit={handleApplyFilters} className="glass-card p-6 rounded-2xl border border-white/40 dark:border-slate-800/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-['Outfit'] font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <FaFilter className="text-brand-500 text-sm" />
              <span>Search Filters</span>
            </h3>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Text Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Search Name/Clinic</label>
            <div className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <FaSearch className="text-slate-400 mr-2 text-xs" />
              <input
                type="text"
                placeholder="Type doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none border-none focus:ring-0"
              />
            </div>
          </div>

          {/* Specialization Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs border-0 outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="">All Specialities</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Min & Max Fee */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Fee Range ($)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-0 outline-none text-slate-700 dark:text-slate-200"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-0 outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Minimum Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs border-0 outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5 ★ & above</option>
              <option value="4">4.0 ★ & above</option>
              <option value="3">3.0 ★ & above</option>
            </select>
          </div>

          {/* Availability Day */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Availability Day</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs border-0 outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="">Any Work Day</option>
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Experience Years */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Experience (Years)</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs border-0 outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="">Any Experience</option>
              <option value="10">10+ Years</option>
              <option value="5">5+ Years</option>
              <option value="2">2+ Years</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sort Results By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs border-0 outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="">Select sort order</option>
              <option value="highestRated">Highest Rated</option>
              <option value="lowestFee">Lowest Consultation Fee</option>
              <option value="mostExperienced">Most Experienced</option>
              <option value="mostPopular">Most Popular (Reviews Count)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors"
          >
            Apply Active Filters
          </button>
        </form>

        {/* Right Search Grid Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
              Showing {doctors.length} results
            </p>
          </div>

          {loading ? (
            <SkeletonLoader count={6} />
          ) : doctors.length === 0 ? (
            <div className="glass-card py-20 px-6 text-center rounded-2xl border border-white/40 dark:border-slate-800/80">
              <div className="h-16 w-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
                🔍
              </div>
              <h3 className="font-['Outfit'] font-bold text-lg text-slate-800 dark:text-white">No Matching Doctors</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                We couldn't find any approved doctors matching your current filters. Try resetting the filters or modifying your query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-full transition-colors"
              >
                Clear Search Parameters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDoctors;
