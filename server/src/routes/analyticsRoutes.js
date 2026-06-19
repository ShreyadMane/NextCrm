const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/dashboard', ctrl.dashboard);
router.get('/funnel', ctrl.funnel);

module.exports = router;
