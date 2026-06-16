const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  age: {
    type: Number,
    required: [true, 'Please add age'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Please specify blood group'],
  },
  emergencyContact: {
    type: String,
    required: [true, 'Please add emergency contact details'],
  },
  address: {
    type: String,
    required: [true, 'Please add address'],
  },
});

module.exports = mongoose.model('Patient', PatientSchema);
