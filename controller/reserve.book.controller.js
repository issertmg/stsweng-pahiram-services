const Book = require('../model/book.model');
const Reservation = require('../model/reservation.model');

exports.book = async function (req, res) {
    try {
        const activeReservation = await hasActiveBookReservation(req.session.idNum);
        res.render('book-form', {
            active: { active_index: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
            status: activeReservation
        });
    } catch (err) {
        console.log(err);
    }
}

exports.books_get = async function (req, res) {
    try {
        let count = await Book.find({
            title: {
                $regex: req.query.columns[0].search.value,
                $options: 'i'
            },
            authors: {
                $regex: req.query.columns[1].search.value,
                $options: 'i'
            }
        }).countDocuments();

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

        if (data) {
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

exports.book_get = async function (req, res) {
    try {
        let book = await Book.findOne({ _id: req.query._id });

        console.log(book);

        if (book)
            res.send(book);
    } catch (err) {
        console.log(err);
    }
}

exports.reserve_book = async function (req, res) {
    try {
        const activeReservation = await hasActiveBookReservation(req.session.idNum);
        if (!activeReservation) {
            let book = await Book.findById(req.body.bookID);
            if (book && (book.onRent < book.quantity)) {
                let reservation = new Reservation({
                    title: book.title,
                    userID: req.session.idNum,
                    item: book._id,
                    status: 'Pending',
                    description: 'by ' + book.authors,
                    onItemType: 'Book'
                });
                await reservation.save();
                await Book.findByIdAndUpdate(book._id, { onRent: book.onRent + 1 });
            }
        }
        res.redirect("/reservations");
    } catch (err) {
        console.log(err);
    }
}

async function hasActiveBookReservation(idNum) {
    let count;
    try {
        count = await Reservation.find({
            userID: idNum,
            onItemType: 'Book',
            $or: [{status: 'Pending'}, {status: 'For Pickup'}, {status: 'On Rent'}, {status: 'Uncleared'}]
        }).countDocuments();
        return count > 0;
    } catch (error) {
        console.log(error);
    }
}