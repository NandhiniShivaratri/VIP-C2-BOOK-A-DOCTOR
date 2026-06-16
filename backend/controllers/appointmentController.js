const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');


// Helper: check if slot is available
const checkSlotAvailability = async (doctorId, appointmentDate, appointmentTime) => {
  const existingBooking = await Appointment.findOne({
    doctorId,
    appointmentDate,
    appointmentTime,
    status: { $in: ['Requested', 'Approved', 'Confirmed', 'Consultation Completed'] }, // Ignore Cancelled bookings
  });
  return !existingBooking;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
exports.bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

  try {
    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all booking details' });
    }

    // Verify doctor exists and is approved
    const doctor = await Doctor.findById(doctorId).populate('userId', 'name');
    if (!doctor || !doctor.approved) {
      return res.status(400).json({ success: false, message: 'Doctor is not available for booking' });
    }

    // Check if appointment date is a valid day for the doctor
    const dateObj = new Date(appointmentDate);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"
    
    const dayAvailability = doctor.availability.find((a) => a.day === dayOfWeek);
    if (!dayAvailability || !dayAvailability.slots.includes(appointmentTime)) {
      return res.status(400).json({ success: false, message: `Doctor is not scheduled to work on ${dayOfWeek} at ${appointmentTime}` });
    }

    // Check if slot is already booked (prevent double booking)
    const isAvailable = await checkSlotAvailability(doctorId, appointmentDate, appointmentTime);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'This slot has already been booked. Please pick another time.' });
    }

    // Create the appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      doctorName: doctor.userId.name,
      doctorSpecialization: doctor.specialization,
      consultationFee: doctor.consultationFee,
      appointmentDate,
      appointmentTime,
      reason,
      status: 'Requested', // Default starting status
    });

    await appointment.save();

    // Notify Doctor in Database
    await Notification.create({
      userId: doctor.userId._id,
      title: 'New Appointment Requested',
      message: `Patient ${req.user.name} has requested an appointment on ${appointmentDate} at ${appointmentTime}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment requested successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Server error booking appointment' });
  }
};

// @desc    Get all appointments (Filtered by role: Patient, Doctor, Admin)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'Patient') {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone profileImage' },
        })
        .sort({ appointmentDate: 1, appointmentTime: 1 });
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }
      appointments = await Appointment.find({ doctorId: doctor._id })
        .populate('patientId', 'name email phone gender profileImage')
        .sort({ appointmentDate: 1, appointmentTime: 1 });
    } else if (req.user.role === 'Admin') {
      appointments = await Appointment.find()
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email profileImage' },
        })
        .populate('patientId', 'name email profileImage')
        .sort({ createdAt: -1 });
    }

    // Enrich appointments with associated payment records
    const enrichedAppointments = await Promise.all(
      appointments.map(async (app) => {
        const payment = await Payment.findOne({ appointmentId: app._id });
        return {
          ...app.toObject(),
          payment: payment || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedAppointments.length,
      data: enrichedAppointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving appointments' });
  }
};

// @desc    Update appointment status (Approve, Confirm, Complete, Cancel)
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  const { status, appointmentDate, appointmentTime, reason } = req.body;
  const appointmentId = req.params.id;

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name _id' },
      })
      .populate('patientId', 'name email _id');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization checks:
    // Patient can cancel or reschedule.
    // Doctor can approve, confirm, complete, or cancel.
    // Admin can perform all.
    const isPatient = req.user.id === appointment.patientId._id.toString();
    const isDoctor = req.user.id === appointment.doctorId.userId._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this appointment' });
    }

    // 1. Rescheduling logic (change date/time)
    if (appointmentDate || appointmentTime) {
      if (!isPatient && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only patients or admins can reschedule appointments' });
      }

      const newDate = appointmentDate || appointment.appointmentDate;
      const newTime = appointmentTime || appointment.appointmentTime;

      // Check slot availability (ignoring current appointment ID)
      const isAvailable = await Appointment.findOne({
        _id: { $ne: appointmentId },
        doctorId: appointment.doctorId._id,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: { $in: ['Requested', 'Approved', 'Confirmed', 'Consultation Completed'] },
      });

      if (isAvailable) {
        return res.status(400).json({ success: false, message: 'The selected date/time slot is already booked' });
      }

      appointment.appointmentDate = newDate;
      appointment.appointmentTime = newTime;
      appointment.status = 'Requested'; // Reset to requested for doctor approval

      await Notification.create({
        userId: appointment.doctorId.userId._id,
        title: 'Appointment Rescheduled',
        message: `Patient ${appointment.patientId.name} has rescheduled the appointment to ${newDate} at ${newTime}.`,
      });
    }

    // 2. Status Transition logic
    if (status) {
      // Validate role allowed status transitions
      if (status === 'Cancelled') {
        appointment.status = 'Cancelled';
        
        // Notify the other party
        const notifyTarget = isPatient ? appointment.doctorId.userId._id : appointment.patientId._id;
        const notifierName = isPatient ? appointment.patientId.name : appointment.doctorId.userId.name;
        
        await Notification.create({
          userId: notifyTarget,
          title: 'Appointment Cancelled',
          message: `Appointment scheduled on ${appointment.appointmentDate} has been cancelled by ${notifierName}.`,
        });
      } else {
        // Only doctor or admin can move to Approved, Confirmed, Completed
        if (!isDoctor && !isAdmin) {
          return res.status(403).json({ success: false, message: 'Only medical staff or admins can change appointment stages' });
        }

        appointment.status = status;

        // Notify patient
        let alertMessage = '';
        if (status === 'Approved') alertMessage = `Your appointment request with Dr. ${appointment.doctorId.userId.name} was approved.`;
        if (status === 'Confirmed') alertMessage = `Your appointment with Dr. ${appointment.doctorId.userId.name} on ${appointment.appointmentDate} is confirmed.`;
        if (status === 'Consultation Completed') alertMessage = `Consultation completed with Dr. ${appointment.doctorId.userId.name}. Thank you!`;

        await Notification.create({
          userId: appointment.patientId._id,
          title: `Appointment ${status}`,
          message: alertMessage,
        });
      }
    }

    if (reason) appointment.reason = reason;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Reschedule/Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating appointment' });
  }
};

// @desc    Get busy slots for a doctor on a specific date
// @route   GET /api/appointments/busy-slots
// @access  Public
exports.getBusySlots = async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Please provide doctorId and date' });
    }

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: date,
      status: { $in: ['Requested', 'Approved', 'Confirmed', 'Consultation Completed'] },
    }).select('appointmentTime');

    const busySlots = appointments.map((a) => a.appointmentTime);

    res.status(200).json({
      success: true,
      busySlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error getting busy slots' });
  }
};

// @desc    Process simulated payment for an appointment
// @route   POST /api/appointments/:id/pay
// @access  Private/Patient
exports.processPayment = async (req, res) => {
  const { paymentMethod, amount } = req.body;
  const appointmentId = req.params.id;

  try {
    if (!paymentMethod || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide payment method and amount' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify ownership
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this appointment' });
    }

    // Generate simulated transaction
    const transactionId = `tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // Create payment record
    const payment = new Payment({
      appointmentId: appointment._id,
      patientId: req.user.id,
      amount,
      paymentMethod,
      status: 'Success',
      transactionId,
    });

    await payment.save();

    // Confirm the appointment status after payment
    appointment.status = 'Confirmed';
    await appointment.save();

    // Notify doctor
    await Notification.create({
      userId: appointment.doctorId.userId._id,
      title: 'Appointment Confirmed & Paid',
      message: `Appointment on ${appointment.appointmentDate} has been confirmed. Payment of $${amount} was received via ${paymentMethod}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully. Appointment confirmed.',
      data: payment,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Server error processing payment' });
  }
};

