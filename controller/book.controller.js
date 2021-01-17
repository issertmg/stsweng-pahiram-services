const Book = require('../model/book.model');
const hbs = require('hbs');

const { validationResult } = require('express-validator');

/**
 * Loads and renders the Manage Books page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.book_details = async function (req, res) {
    res.render('manage-books-page', {
            active: { active_manage_books: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
        });
};

/**
 * AJAX function used to initialize the table books infos in the Manage Books page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.book_get = async function (req, res) {
    try {
        const count = await Book.find().countDocuments();

        let data = await Book
            .find({
                 $expr: {
                     $regexMatch: {
                         input: "$title",
                         regex: req.query.search.value,  //Your text search here
                         options: "i"
                     }
                 }
            })
            .skip(parseInt(req.query.start))
            .limit(parseInt(req.query.length));

        if (data && count) {
            let datatable = {
                recordsTotal: count,
                recordsFiltered: count,
                data: data,
            }
            res.send(datatable);
        }
    } catch (err) {
        console.log(err);
    }
}

/**
 * AJAX function for retrieving an book.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.onrent_get = async function (req, res) {
    try {
        const book = await Book.findById(req.query.bookid);
        if (book)
            res.send(book);
    } catch (err) {
        console.log(err);
    }
};

/**
 * Deletes a Book from the database
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.book_delete = async function (req, res) {
    try {
        await Book.findByIdAndDelete(req.body.bookid);
    } catch (err) {
        console.log(err);
    }
    res.redirect("/manage-books/");
};

/**
 * AJAX function for checking if a book already exists
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.check_get = async function (req, res) {
    try {
        const bookCount = await Book.find({
            _id: {$ne: req.query.ID},
            title: req.query.title,
            authors: req.query.authors,
            edition: req.query.edition
        }).countDocuments();
        res.send({count: bookCount});
    }
    catch (err) {
        console.log(err);
    }
};

exports.book_create = async function (req, res) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {

        const isNew = await isNewBook(req.body.title, req.body.authors, req.body.edition);

        if (isNew) {
            try {
                await Book.create({
                    title: req.body.title,
                    authors: req.body.authors,
                    edition: req.body.edition,
                    quantity: req.body.quantity
                })
            } catch (err) {
                console.log(err);
            }
        }
    }
    else
        console.log(errors)
    res.redirect("/manage-books/");
};

async function isNewBook(title, authors, edition) {
    let bookCount;
    try {
        bookCount = await Book.find({
            title: title,
            authors: authors,
            edition: edition
        }).countDocuments();
    }
    catch (err) {
        console.log(err);
    }
    return bookCount === 0;
}