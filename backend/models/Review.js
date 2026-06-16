const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please add rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: [true, 'Please add review text'],
    trim: true,
  },
  isVerifiedPatient: {
    type: Boolean,
    default: true,
  },
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the average rating and review counts on the Doctor profile
ReviewSchema.statics.getAverageRating = async function (doctorId) {
  const obj = await this.aggregate([
    {
      $match: { doctorId: doctorId },
    },
    {
      $group: {
        _id: '$doctorId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        totalReviews: obj[0].totalReviews,
      });
    } else {
      await this.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.doctorId);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.doctorId);
});

module.exports = mongoose.model('Review', ReviewSchema);
