const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Add review for a doctor
// @route   POST /api/reviews
// @access  Private/Patient
exports.addReview = async (req, res) => {
  const { doctorId, rating, reviewText } = req.body;

  try {
    if (!doctorId || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'Please provide rating and review text' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Optional Check: verify patient has booked with doctor before reviewing (Verified Patient Badge)
    const hasBooked = await Appointment.findOne({
      patientId: req.user.id,
      doctorId: doctorId,
      status: 'Consultation Completed',
    });

    // We allow reviews but flag them as verified or not. 
    // Requirement specifies showing "Verified Patient Badge", so we can add a flag to the review or evaluate it on query.
    // Let's create the review
    const review = new Review({
      patientId: req.user.id,
      doctorId,
      rating: Number(rating),
      reviewText,
    });

    await review.save();

    // Trigger average rating recalculation
    await Review.getAverageRating(doctorId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review,
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ success: false, message: 'Server error adding review', error: error.message });
  }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  const { doctorId } = req.query;

  try {
    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Please specify doctorId query param' });
    }

    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'name profileImage')
      .sort({ createdAt: -1 });

    // For each review, attach whether they are a verified patient (has completed appointment)
    const verifiedReviews = await Promise.all(
      reviews.map(async (review) => {
        const hasCompleted = await Appointment.findOne({
          patientId: review.patientId._id,
          doctorId: review.doctorId,
          status: 'Consultation Completed',
        });
        
        return {
          ...review.toJSON(),
          isVerifiedPatient: !!hasCompleted,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: verifiedReviews.length,
      data: verifiedReviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving reviews' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private/Patient
exports.updateReview = async (req, res) => {
  const { rating, reviewText } = req.body;

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify ownership
    if (review.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    if (rating) review.rating = Number(rating);
    if (reviewText) review.reviewText = reviewText;

    await review.save();
    await Review.getAverageRating(review.doctorId);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating review' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Patient
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify ownership or Admin
    if (review.patientId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const doctorId = review.doctorId;
    await review.deleteOne();
    await Review.getAverageRating(doctorId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
};
