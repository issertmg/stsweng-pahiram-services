const index_controller = require('../controller/index.controller');

const UserAuth = require('../helpers/user-validation');

const express = require('express');
const router = express.Router();

const validation = require('../helpers/validation.js');

router.get('/', UserAuth.userIsLoggedIn, UserAuth.userIsNew, index_controller.home);

router.get('/terms', UserAuth.userIsLoggedIn, UserAuth.userIsNew, index_controller.terms);

router.get('/about', UserAuth.userIsLoggedIn, UserAuth.userIsNew, index_controller.about);

router.get('/auth/google', index_controller.signin);

router.get('/auth/google/callback', index_controller.callback, index_controller.callback_success);

router.get('/register', UserAuth.userIsLoggedIn, index_controller.register_get);
router.post('/register', UserAuth.userIsLoggedIn, validation.registerValidation(), index_controller.register_post);

router.get('/login', index_controller.login);

router.get('/logout', UserAuth.userIsLoggedIn, index_controller.logout);

router.get('/get-id', index_controller.id_get);
router.get('/get-phone', index_controller.phone_get);

module.exports = router;