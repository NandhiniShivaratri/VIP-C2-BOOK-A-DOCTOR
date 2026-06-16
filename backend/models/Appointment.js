const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
  doctorName: {
    type: String,
    required: true,
  },
  doctorSpecialization: {
    type: String,
    required: true,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  appointmentDate: {
    type: String, // format YYYY-MM-DD
    required: [true, 'Please add appointment date'],
  },
  appointmentTime: {
    type: String, // e.g., '10:00 AM'
    required: [true, 'Please add appointment time'],
  },
  reason: {
    type: String,
    required: [true, 'Please specify booking reason'],
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Confirmed', 'Consultation Completed', 'Cancelled'],
    default: 'Requested',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
