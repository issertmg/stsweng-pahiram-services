const reserve_equipment_controller = require('../controller/reserve.equipment.controller');
const reserve_locker_controller = require('../controller/reserve.locker.controller');
const index_controller = require('../controller/index.controller');

const express = require('express');
const router = express.Router();

router.get('/', index_controller.home);
router.get('/locker', reserve_locker_controller.locker);
router.get('/equipment', reserve_equipment_controller.equipment);

router.post('/locker', reserve_locker_controller.reserve_locker);
router.post('/equipment', reserve_equipment_controller.reserve_equipment);

module.exports = router;
