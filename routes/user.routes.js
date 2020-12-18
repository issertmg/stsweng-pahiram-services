const user_controller = require('../controller/user.controller');
const UserAuth = require('../helpers/user-validation');

const express = require('express');
const router = express.Router();

const validation = require('../helpers/validation');

router.get('/manage', UserAuth.userIsAdmin, user_controller.people_details);
router.post('/manage', UserAuth.userIsAdmin, user_controller.people_update);
router.post('/manage/promote', UserAuth.userIsAdmin, user_controller.people_promote);
router.post('/manage/demote', UserAuth.userIsAdmin, user_controller.people_demote);
router.get('/manage/get-people', UserAuth.userIsAdmin, user_controller.people_get);



router.get('/', user_controller.profile_details);
router.post('/', validation.editProfileValidation(), user_controller.profile_update);

// AJAX
router.get('/get-count-of-studentrep', UserAuth.userIsAdmin, user_controller.count_studentrep_get);
router.get('/check-for-duplicates', UserAuth.userIsAdmin, user_controller.check_mobile_id_duplicate_get);
module.exports = router;