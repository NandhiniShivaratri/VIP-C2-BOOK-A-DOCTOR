const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  approveDoctor,
  getDoctorRecommendations,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/recommendations', getDoctorRecommendations);
router.get('/:id', getDoctorById);

// Admin restricted
router.put('/:id/approve', protect, authorize('Admin'), approveDoctor);
router.delete('/:id', protect, authorize('Admin'), deleteDoctor);

module.exports = router;
