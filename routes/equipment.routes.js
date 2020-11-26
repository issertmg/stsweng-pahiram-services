const express = require('express');
const router = express.Router();
const path = require('path');
const UserAuth = require('../helpers/user-validation');
const validation = require('../helpers/validation.js');

const equipmentController = require('../controller/equipment.controller');

const multer = require('multer');

const upload = multer({
    dest: path.join(__dirname, '../public/uploads/equipment-images/temp')
});

// create
router.post('/', UserAuth.userIsAdmin, upload.single('equipmentImage'), validation.addOrUpdateEquipmentValidation(), equipmentController.createEquipment);

// view all equipment
router.get('/', UserAuth.userIsAdmin, equipmentController.viewAllEquipment);

// update equipment
router.post('/update', UserAuth.userIsAdmin, upload.single('equipmentImage'), validation.addOrUpdateEquipmentValidation(), equipmentController.updateEquipment);

// delete equipment
router.post('/delete', UserAuth.userIsAdmin, equipmentController.deleteEquipment);

// AJAX get request 
router.get('/onrent', UserAuth.userIsAdmin, equipmentController.onrent_get);
router.get('/check', UserAuth.userIsAdmin, equipmentController.check_get);

module.exports = router;
