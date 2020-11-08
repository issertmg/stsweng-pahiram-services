const reserve_controller = require('../controller/reserve.controller');
const index_controller = require('../controller/index.controller');

const express = require('express');
const router = express.Router();

router.get('/', index_controller.home);
router.get('/locker', reserve_controller.locker);
router.get('/equipment', reserve_controller.equipment);

router.post('/locker', reserve_controller.reserve_locker);
router.post('/equipment', reserve_controller.reserve_equipment);

module.exports = router;
