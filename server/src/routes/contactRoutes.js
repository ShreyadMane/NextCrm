const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateContact } = require('../validators/contactValidator');

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', validateContact, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), ctrl.remove);

module.exports = router;
