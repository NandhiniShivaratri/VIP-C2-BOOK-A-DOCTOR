const express = require('express');
const {
  bookAppointment,
  getAppointments,
  updateAppointment,
  getBusySlots,
  processPayment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

router.get('/busy-slots', getBusySlots);

// Protected routes
router.post('/', protect, authorize('Patient'), bookAppointment);
router.get('/', protect, getAppointments);
router.put('/:id', protect, updateAppointment);
router.post('/:id/pay', protect, authorize('Patient'), processPayment);

module.exports = router;
