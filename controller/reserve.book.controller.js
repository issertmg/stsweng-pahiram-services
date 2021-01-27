const Book = require('../model/book.model');
const Reservation = require('../model/reservation.model');
const RentalDates = require('../model/rental.dates.model');

exports.book = async function (req, res) {
    try {
        let rental_period = await isBookRentalPeriod();
        res.render('book-form', {
            active: { active_index: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
            rental_period: rental_period
        });
    } catch (err) {
        console.log(err);
    }
}

exports.books_get = async function (req, res) {
    try {
        let sortObject;
        if (req.query.order[0] == null)
            sortObject = getSortValue(0, 1)
        else
            sortObject = getSortValue(req.query.order[0].column, req.query.order[0].dir);

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
            .sort(sortObject)
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
        console.log('An error occurred.');
        res.send({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        });
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

exports.user_has_active_book_reservation = async function (req, res) {
    try {
        const activeReservation = await hasActiveBookReservation(req.session.idNum);
        res.send(activeReservation);
    } catch (err) {
        console.log(err);
    }
}

exports.reserve_book = async function (req, res) {
    try {
        const activeReservation = await hasActiveBookReservation(req.session.idNum);
        const isRentalPeriod = await isBookRentalPeriod();

        if (!activeReservation && isRentalPeriod) {
            let book = await Book.findById(req.body.bookID);
            if (book && (book.onRent < book.quantity)) {
                // update book
                await Book.findByIdAndUpdate(book._id, { onRent: book.onRent + 1 });
                // create a new reservation
                let reservation = new Reservation({
                    title: book.title,
                    userID: req.session.idNum,
                    item: book._id,
                    status: 'Pending',
                    description: 'by ' + book.authors,
                    onItemType: 'Book'
                });
                await reservation.save();
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

function getSortValue(column, direction) {
    if (column == null || direction == null) {
        console.log('Null')
        return {'lastUpdated': -1};  
    } 

    let dir = (direction === 'asc') ? 1: -1;

    switch (column) {
        case '0':
            return {'title': dir};
        case '1':
            return {'authors': dir};
    }
}

async function isBookRentalPeriod() {
    let isRentalPeriod = false;
    let today = new Date();
    try {
        let rental_date = await RentalDates.findOne({type: 'Book'});
        if (rental_date) {
            let startDate = new Date(rental_date.startDate)
            let endDate = new Date(rental_date.endDate)
            if ((today >= startDate) && (today < endDate))
                isRentalPeriod = true;
        }
    } catch (err) {
        console.log(err);
    }
    return isRentalPeriod;
}