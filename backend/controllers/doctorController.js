const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors with advanced search, filtering and sorting
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res) => {
  try {
    const {
      search,
      specialization,
      hospital,
      location,
      experience,
      minFee,
      maxFee,
      rating,
      availability,
      sort,
      approved,
    } = req.query;

    let query = {};

    // Approved status check - defaults to showing only approved doctors for public discovery,
    // but admins can fetch unapproved ones.
    if (approved !== undefined) {
      query.approved = approved === 'true';
    } else {
      query.approved = true; // Default behavior
    }

    // Filters
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (hospital) {
      query.hospitalName = { $regex: hospital, $options: 'i' };
    }

    if (location) {
      query.clinicAddress = { $regex: location, $options: 'i' };
    }

    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    if (availability) {
      // availability should match one of the available days
      query['availability.day'] = availability;
    }

    // Build the query to search across doctor attributes and user fields (e.g. name)
    let matchingDoctorIds = [];
    if (search) {
      // Search user by name
      const users = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'Doctor',
      }).select('_id');
      
      const userIds = users.map((u) => u._id);

      // Search doctor attributes or matched userIds
      const doctorsWithSearch = await Doctor.find({
        $or: [
          { userId: { $in: userIds } },
          { specialization: { $regex: search, $options: 'i' } },
          { hospitalName: { $regex: search, $options: 'i' } },
          { clinicAddress: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      matchingDoctorIds = doctorsWithSearch.map((d) => d._id);
      query._id = { $in: matchingDoctorIds };
    }

    let queryBuilder = Doctor.find(query).populate('userId', 'name email phone gender profileImage');

    // Sorting options
    if (sort) {
      if (sort === 'highestRated') {
        queryBuilder = queryBuilder.sort({ rating: -1 });
      } else if (sort === 'lowestFee') {
        queryBuilder = queryBuilder.sort({ consultationFee: 1 });
      } else if (sort === 'mostExperienced') {
        queryBuilder = queryBuilder.sort({ experience: -1 });
      } else if (sort === 'mostPopular') {
        queryBuilder = queryBuilder.sort({ totalReviews: -1 });
      }
    } else {
      // Default sort (newest registered)
      queryBuilder = queryBuilder.sort({ _id: -1 });
    }

    const doctors = await queryBuilder;

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Server error fetching doctors list', error: error.message });
  }
};

// @desc    Get single doctor by ID with user info
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone gender profileImage');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(500).json({ success: false, message: 'Server error fetching doctor info' });
  }
};

// @desc    Admin approve or reject doctor profile
// @route   PUT /api/doctors/:id/approve
// @access  Private/Admin
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.approved = req.body.approved !== undefined ? req.body.approved : true;
    await doctor.save();

    // Trigger Notification for Doctor (handled in routes/Socket.io, or we write it to Notification collection)
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: doctor.userId,
      title: 'Doctor Profile Approved',
      message: `Your professional doctor profile has been approved! You are now live on the MedConnect database and patients can schedule appointments with you.`,
    });

    res.status(200).json({
      success: true,
      message: `Doctor profile has been ${doctor.approved ? 'approved' : 'rejected'}.`,
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error approving doctor' });
  }
};

// @desc    Get doctor recommendation lists
// @route   GET /api/doctors/recommendations
// @access  Public
exports.getDoctorRecommendations = async (req, res) => {
  try {
    const { specialization, userId } = req.query;

    // 1. Top Rated: Rated >= 4.5
    const topRated = await Doctor.find({ approved: true, rating: { $gte: 4.5 } })
      .populate('userId', 'name profileImage')
      .limit(5);

    // 2. Recommended: combination of experience and rating
    const recommended = await Doctor.find({ approved: true, rating: { $gte: 4 }, experience: { $gte: 5 } })
      .populate('userId', 'name profileImage')
      .limit(5);

    // 3. Trending: most total reviews
    const trending = await Doctor.find({ approved: true })
      .sort({ totalReviews: -1 })
      .populate('userId', 'name profileImage')
      .limit(5);

    // 4. Similar specialists (optional)
    let similar = [];
    if (specialization) {
      similar = await Doctor.find({
        approved: true,
        specialization: { $regex: specialization, $options: 'i' },
      })
        .populate('userId', 'name profileImage')
        .limit(5);
    }

    res.status(200).json({
      success: true,
      data: {
        topRated,
        recommended,
        trending,
        similar,
      },
    });
  } catch (error) {
    console.error('Recommendations Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error compiling doctor lists' });
  }
};

// @desc    Delete doctor profile
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Delete base User record as well
    await User.findByIdAndDelete(doctor.userId);
    await doctor.deleteOne();

    res.status(200).json({ success: true, message: 'Doctor profile and associated user deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting doctor profile' });
  }
};
