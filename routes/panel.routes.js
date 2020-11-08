const express = require('express');
const router = express.Router();
const UserAuth = require('../helpers/user-validation');
const validation = require('../helpers/validation.js');

const panel_controller = require('../controller/panel.controller');

router.post('/', UserAuth.userIsAdmin, validation.addPanelValidation(), panel_controller.panel_create);
router.get('/', UserAuth.userIsAdmin, panel_controller.panel_details);
router.get('/lessee', UserAuth.userIsAdmin, panel_controller.lessee_get);
router.get('/status', UserAuth.userIsAdmin, panel_controller.status_get);
router.post('/update', UserAuth.userIsAdmin, panel_controller.panel_update);
router.post('/delete', UserAuth.userIsAdmin, panel_controller.panel_delete);
router.post('/unclear', UserAuth.userIsAdmin, panel_controller.panel_unclear);

module.exports = router
