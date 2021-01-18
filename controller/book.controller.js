const Book = require('../model/book.model');
const RentalDates = require('../model/rental.dates.model');
const hbs = require('hbs');
const { validationResult } = require('express-validator');

/**
 * Loads and renders the Manage Books page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.book_details = async function (req, res) {
    try {
        let rentalDatesConfig = await RentalDates.findOne({type: 'Book'});
        res.render('manage-books-page', {
            active: { active_manage_books: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
            rentalDatesConfig: rentalDatesConfig
        });
    } catch (err){
        console.log(err);
    }
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

exports.set_rental_dates = async function (req, res) {
    try {
        let startDate = new Date(req.body.startDate);
        startDate.setHours(req.body.startTime.split(":")[0], req.body.startTime.split(":")[1]);
        let endDate = new Date(req.body.endDate);
        endDate.setHours(req.body.endTime.split(":")[0], req.body.endTime.split(":")[1]);
        let returnDate = new Date(req.body.returnDate);
        returnDate.setHours(23, 59, 59, 0);

        if (isValidRentalDates(startDate, endDate, returnDate)){

            let rentalDateConfig = await RentalDates.findOne({type: 'Book'});
            if (rentalDateConfig) {
                await RentalDates.findOneAndUpdate({type: 'Book'}, {
                    startDate: startDate,
                    endDate: endDate,
                    returnDate: returnDate
                });
            }
            else {
                let newRentalDateConfig = new RentalDates({
                    startDate: startDate,
                    endDate: endDate,
                    returnDate: returnDate,
                    type: 'Book'
                });
                await newRentalDateConfig.save();
            }
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect("/manage-books/");
}

function isValidRentalDates(startDate, endDate, returnDate) {
    let flag = false;
    let currentDate = new Date();

    startDate.setMinutes(startDate.getMinutes() + 1);
    returnDate.setHours(endDate.getHours(), endDate.getMinutes(), 0);

    if ((startDate >= currentDate) && (endDate >= startDate) && (returnDate > endDate))
        flag = true;

    startDate.setMinutes(startDate.getMinutes() - 1);
    returnDate.setHours(23, 59, 59);

    return flag;
}