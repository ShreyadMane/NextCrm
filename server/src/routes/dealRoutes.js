const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/dealController');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.put('/:id/close', ctrl.close);
router.get('/forecast', ctrl.forecast);

module.exports = router;
