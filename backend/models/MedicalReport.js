const mongoose = require('mongoose');

const MedicalReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportTitle: {
    type: String,
    required: [true, 'Please add report title'],
    trim: true,
  },
  reportFile: {
    type: String, // Cloudinary URL or local path
    required: [true, 'Please add report file url'],
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MedicalReport', MedicalReportSchema);
