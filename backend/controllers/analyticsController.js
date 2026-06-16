const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get dashboard analytics metrics (Admin only)
// @route   GET /api/analytics
// @access  Private/Admin
exports.getPlatformAnalytics = async (req, res) => {
  try {
    // 1. General counts
    const totalPatients = await User.countDocuments({ role: 'Patient' });
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const totalAppointments = await Appointment.countDocuments();

    // 2. Revenue calculations (Sum of consultationFee for Completed/Consultation Completed appointments)
    const completedAppointments = await Appointment.find({ status: 'Consultation Completed' })
      .populate('doctorId', 'consultationFee');
      
    let totalRevenue = 0;
    completedAppointments.forEach((app) => {
      if (app.doctorId && app.doctorId.consultationFee) {
        totalRevenue += app.doctorId.consultationFee;
      }
    });

    // 3. Appointments by status aggregation
    const statusCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 4. Specialization distribution (Doctors count per specialization)
    const specializationCount = await Doctor.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    // 5. Most booked doctors (Top 5)
    const topBooked = await Appointment.aggregate([
      { $group: { _id: '$doctorId', bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
    ]);

    // Populate top booked doctors
    const mostBookedDoctors = await Promise.all(
      topBooked.map(async (item) => {
        const doc = await Doctor.findById(item._id).populate('userId', 'name');
        return {
          name: doc && doc.userId ? doc.userId.name : 'Unknown Doctor',
          specialization: doc ? doc.specialization : 'N/A',
          count: item.bookingCount,
        };
      })
    );

    // 6. Monthly bookings aggregate (for last 6 months)
    // Create static mock or actual mongo date aggregation depending on how date is saved (we save YYYY-MM-DD as string).
    // Let's parse dates and aggregate
    const allBookings = await Appointment.find().select('appointmentDate doctorId status');
    const monthlyDataMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      monthlyDataMap[label] = { label, appointments: 0, revenue: 0 };
    }

    // Populate counts
    for (const app of allBookings) {
      if (!app.appointmentDate) continue;
      const appDate = new Date(app.appointmentDate);
      if (isNaN(appDate.getTime())) continue;
      
      const label = `${months[appDate.getMonth()]} ${appDate.getFullYear().toString().substr(-2)}`;
      if (monthlyDataMap[label]) {
        monthlyDataMap[label].appointments += 1;
        if (app.status === 'Consultation Completed') {
          const doc = await Doctor.findById(app.doctorId).select('consultationFee');
          if (doc) {
            monthlyDataMap[label].revenue += doc.consultationFee;
          }
        }
      }
    }

    const monthlyAnalytics = Object.values(monthlyDataMap);

    // 7. Registrations monthly aggregations (Doctors vs Patients)
    const users = await User.find().select('role createdAt');
    const registrationMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      registrationMap[label] = { label, patients: 0, doctors: 0 };
    }

    users.forEach((u) => {
      const uDate = new Date(u.createdAt);
      const label = `${months[uDate.getMonth()]} ${uDate.getFullYear().toString().substr(-2)}`;
      if (registrationMap[label]) {
        if (u.role === 'Patient') registrationMap[label].patients += 1;
        if (u.role === 'Doctor') registrationMap[label].doctors += 1;
      }
    });

    const registrationAnalytics = Object.values(registrationMap);

    res.status(200).json({
      success: true,
      summary: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
      },
      statusCounts,
      specializationCount,
      mostBookedDoctors,
      monthlyAnalytics,
      registrationAnalytics,
    });
  } catch (error) {
    console.error('Analytics Compile Error:', error);
    res.status(500).json({ success: false, message: 'Server error compiling platform analytics' });
  }
};
