const Book = require('../model/book.model');
const hbs = require('hbs');

const { validationResult } = require('express-validator');



/**
 * Loads and renders the manage book page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.book_details = async function (req, res) {
        res.render('manage-book-page', {
            active: { active_manage_equipment: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
        });
};

/**
 * AJAX function used to initialize the table books infos in the Manage Book page.
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



