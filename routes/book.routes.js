const express = require('express');
const router = express.Router();
const UserAuth = require('../helpers/user-validation');
const validation = require('../helpers/validation.js');

const bookController = require('../controller/book.controller');

// create

// view all books
router.get('/', UserAuth.userIsAdmin, bookController.book_details);
router.get('/get-books', UserAuth.userIsAdmin, bookController.book_get);

// update book

// delete book


module.exports = router;
