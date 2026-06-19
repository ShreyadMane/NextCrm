const express = require('express');
const { list, create, deleteActivity } = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', list);
router.post('/', create);
router.delete('/:id', deleteActivity);

module.exports = router;
