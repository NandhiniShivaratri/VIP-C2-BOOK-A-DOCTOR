const express = require('express');
const {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

router.get('/', getReviews);

// Protected actions
router.post('/', protect, authorize('Patient'), addReview);
router.put('/:id', protect, authorize('Patient'), updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
