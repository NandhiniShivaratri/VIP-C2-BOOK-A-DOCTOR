const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  slots: {
    type: [String], // e.g. ["09:00 AM", "10:00 AM", "11:00 AM"]
    default: [],
  },
});

const DoctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialization: {
    type: String,
    required: [true, 'Please add specialization'],
    trim: true,
  },
  qualification: {
    type: String,
    required: [true, 'Please add qualification'],
    trim: true,
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience'],
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please add consultation fee'],
  },
  hospitalName: {
    type: String,
    required: [true, 'Please add hospital name'],
    trim: true,
  },
  clinicAddress: {
    type: String,
    required: [true, 'Please add clinic address'],
    trim: true,
  },
  availability: {
    type: [AvailabilitySchema],
    default: [],
  },
  about: {
    type: String,
    default: 'Experienced healthcare practitioner committed to patient well-being.',
  },
  languages: {
    type: [String],
    default: ['English'],
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Doctor', DoctorSchema);
