const reserve_equipment_controller = require('../controller/reserve.equipment.controller');
const reserve_locker_controller = require('../controller/reserve.locker.controller');
const reserve_book_controller = require('../controller/reserve.book.controller');
const index_controller = require('../controller/index.controller');
const validation = require('../helpers/validation.js');

const express = require('express');
const router = express.Router();

router.get('/', index_controller.home);

router.get('/locker', reserve_locker_controller.locker);
router.get('/equipment', reserve_equipment_controller.equipment);
router.get('/book', reserve_book_controller.book);
router.get('/book/get', reserve_book_controller.book_get);

router.post('/locker', reserve_locker_controller.reserve_locker);
router.post('/equipment', validation.reserveEquipmentValidation(), reserve_equipment_controller.reserve_equipment);

module.exports = router;
