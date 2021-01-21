const reservations_controller = require('../controller/reservations.controller');
const UserAuth = require('../helpers/user-validation');
const validation = require('../helpers/validation.js');

const express = require('express');
const router = express.Router();

router.get('/', reservations_controller.myReservations);

router.get('/manage', UserAuth.userIsAdmin, reservations_controller.reservation_details);
router.get('/manage/get-uncleared', UserAuth.userIsAdmin, reservations_controller.uncleared_get);
router.get('/manage/get-user', UserAuth.userIsAdmin, reservations_controller.user_get);
router.get('/manage/get-reservations', UserAuth.userIsAdmin, reservations_controller.reservations_get);
router.get('/manage/get-one-reservation', UserAuth.userIsAdmin, reservations_controller.reservation_get_one);

router.post('/manage/update', UserAuth.userIsAdmin, validation.updateReservationValidation(), reservations_controller.reservation_update);
router.post('/manage/delete', reservations_controller.reservation_delete);

module.exports = router;