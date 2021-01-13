const express = require('express');
const router = express.Router();
const UserAuth = require('../helpers/user-validation');
const validation = require('../helpers/validation.js');

const bookController = require('../controller/book.controller');

// create

// view all books
router.get('/', UserAuth.userIsAdmin, equipmentController.viewAllEquipment);

// update book

// delete book



module.exports = router;
