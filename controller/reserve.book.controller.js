const Book = require('../model/book.model');

exports.book = async function (req, res) {
    try {
        res.render('book-form', {
            active: { active_index: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            }
        });
    } catch (err) {
        console.log(err);
    }
}

exports.book_get = async function (req, res) {
    try {
        const count = await Book.find().countDocuments();

        let data = await Book
            .find({
                title: {
                    $regex: req.query.columns[0].search.value,
                    $options: 'i'
                },
                authors: {
                    $regex: req.query.columns[1].search.value,
                    $options: 'i'
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