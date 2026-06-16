const express = require('express');
const {
  uploadReport,
  getReports,
  deleteReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', protect, authorize('Patient'), upload.single('reportFile'), uploadReport);
router.get('/', protect, getReports);
router.delete('/:id', protect, deleteReport);

module.exports = router;
