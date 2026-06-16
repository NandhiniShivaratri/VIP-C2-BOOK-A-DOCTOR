const express = require('express');
const { getPlatformAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

router.get('/', protect, authorize('Admin'), getPlatformAnalytics);

module.exports = router;
