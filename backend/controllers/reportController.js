const MedicalReport = require('../models/MedicalReport');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Upload medical report
// @route   POST /api/reports/upload
// @access  Private/Patient
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { reportTitle } = req.body;
    if (!reportTitle) {
      return res.status(400).json({ success: false, message: 'Please provide a report title' });
    }

    // Upload file (local file path is in req.file.path)
    const fileUrl = await uploadToCloudinary(req.file.path);

    const report = new MedicalReport({
      patientId: req.user.id,
      reportTitle,
      reportFile: fileUrl,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      data: report,
    });
  } catch (error) {
    console.error('Report upload error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading report' });
  }
};

// @desc    Get medical reports
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    let reports;

    if (req.user.role === 'Patient') {
      // Patient gets their own reports
      reports = await MedicalReport.find({ patientId: req.user.id }).sort({ uploadDate: -1 });
    } else if (req.user.role === 'Doctor') {
      // Doctors can view reports for a specific patient. 
      // We check if the doctor has an appointment with that patient to maintain medical privacy.
      const { patientId } = req.query;

      if (!patientId) {
        return res.status(400).json({ success: false, message: 'Please provide patientId query parameter' });
      }

      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (!doctorProfile) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }

      // Check if there is an appointment (past or upcoming) between this doctor and patient
      const hasRelationship = await Appointment.findOne({
        patientId,
        doctorId: doctorProfile._id,
      });

      if (!hasRelationship && req.user.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this patient\'s records' });
      }

      reports = await MedicalReport.find({ patientId }).sort({ uploadDate: -1 });
    } else if (req.user.role === 'Admin') {
      // Admin gets all reports
      reports = await MedicalReport.find().populate('patientId', 'name email').sort({ uploadDate: -1 });
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving reports' });
  }
};

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Only patient who uploaded or admin can delete
    if (report.patientId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting report' });
  }
};
