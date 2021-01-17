const express = require('express');
const router = express.Router();
const UserAuth = require('../helpers/user-validation');
const validation = require('../helpers/validation.js');

const bookController = require('../controller/book.controller');

// create
router.post('/create', UserAuth.userIsAdmin, validation.addBookValidation(), bookController.book_create);

// view all books
router.get('/', UserAuth.userIsAdmin, bookController.book_details);
router.get('/get-books', UserAuth.userIsAdmin, bookController.book_get);

// update book

// delete book
router.get('/onrent', UserAuth.userIsAdmin, bookController.onrent_get);
router.post('/delete', UserAuth.userIsAdmin, bookController.book_delete);

// AJAX get request
router.get('/check', UserAuth.userIsAdmin, bookController.check_get);

module.exports = router;
