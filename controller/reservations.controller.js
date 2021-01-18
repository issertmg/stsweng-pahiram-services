const hbs = require('hbs');
const cron = require('node-cron');

const Reservation = require('../model/reservation.model');
const User = require('../model/user.model');
const Equipment = require('../model/equipment.model');
const Locker = require('../model/locker.model');
const Book = require('../model/book.model');
const RentalDates = require('../model/rental.dates.model');

const validator = require('validator');
const { validationResult } = require('express-validator');

const EQUIPMENT_PENALTY_INITIAL = 50;
const EQUIPMENT_PENALTY_INCREMENT = 20;

/**
 * Marks all pending equipment reservation as denied if the equipment is still pending an hour before the planned pickup time.
 * @returns {Promise<void>} - nothing
 */
cron.schedule('0 30 6 * * MON,TUE,WED,THU,FRI *', async function () {
    await setAllPendingToDenied(7, 30)
});
cron.schedule('0 15 8 * * MON,TUE,WED,THU,FRI *', async function () {
    await setAllPendingToDenied(9, 15)
});
cron.schedule('0 0 10 * * MON,TUE,WED,THU,FRI *', async function () {
    await setAllPendingToDenied(11, 0)
});
cron.schedule('0 45 11 * * MON,TUE,WED,THU,FRI *', async function () {
    await setAllPendingToDenied(12, 45)
});
cron.schedule('0 30 13 * * MON,TUE,WED,THU,FRI *', async function () {
    await setAllPendingToDenied(14, 30)
});
cron.schedule('0 15 15 * * MON,TUE,WED,THU,FRI *', async function () {
    await setAllPendingToDenied(16, 15)
});

/**
 * Marks all unreturned equipment as uncleared, increments penalty charges for uncleared reservations,
 * and sets all equipment reservation for pickup to returned every 11:59PM.
 * @returns {Promise<void>} - nothing
 */
cron.schedule('0 59 23 * * MON,TUE,WED,THU,FRI *', async function () {
    let today = new Date();
    let tomorrow = new Date(today);
    today.setHours(0,0,0,0);
    tomorrow.setDate(tomorrow.getDate()+1);
    try {
        // for already uncleared equipment, increment penalty by 20 (working)
        await Reservation
            .updateMany(
                {
                    onItemType: 'Equipment',
                    status: 'Uncleared',
                },
                {
                    lastUpdated: Date.now(),
                    remarks: 'You have not returned the equipment.',
                    $inc: { penalty: EQUIPMENT_PENALTY_INCREMENT }
                }
            );

        // set unreturned equipment as uncleared (working)
        await Reservation
            .updateMany(
                {
                    onItemType: 'Equipment',
                    status: 'On Rent',
                },
                {
                    status: 'Uncleared',
                    lastUpdated: Date.now(),
                    remarks: 'You have not returned the equipment.',
                    penalty: EQUIPMENT_PENALTY_INITIAL
                }
            );

        // set for-pickup equipment as returned (working)
        const reservations = await Reservation.find({
            onItemType: 'Equipment',
            status: 'For Pickup',
            pickupPayDate: {"$gte": today, "$lt": tomorrow}
        });

        for (let i = 0; i < reservations.length; i++) {
            await Equipment.findByIdAndUpdate(reservations[i].item, { $inc: { onRent: -1 } });
        }

        await Reservation
            .updateMany(
                {
                    onItemType: 'Equipment',
                    status: 'For Pickup',
                    pickupPayDate: {"$gte": today, "$lt": tomorrow}
                },
                {
                    status: 'Returned',
                    lastUpdated: Date.now(),
                    remarks: 'You did not pickup the equipment within the reservation date'
                }
            );

    } catch (err) {
        console.log(err);
    }
});

/**
 * Marks all unreturned locker as uncleared, and adds penalty charges every return date.
 * @returns {Promise<void>} - nothing
 */
cron.schedule('0 59 23 * * SUN,MON,TUE,WED,THU,FRI,SAT *', async function () {
    let today = new Date();

    try {
        let rental_date = await RentalDates.findOne({type: 'Locker'});
        if (rental_date) {
            let return_date = new Date(rental_date.returnDate);
            if (today.getMonth() === return_date.getMonth() &&
                today.getDate() === return_date.getDate() &&
                today.getFullYear() === return_date.getFullYear()) {

                await Reservation.updateMany(
                    {status: 'On Rent', onItemType: 'Locker'},
                    {status: 'Uncleared', penalty: 200}
                );
                await Locker.updateMany(
                    {status: 'occupied'},
                    {status: 'uncleared'}
                )
            }
        }
    } catch (err) {
        console.log(err)
    }
});

/**
 * Marks all unreturned books as uncleared, and adds penalty charges every return date.
 * @returns {Promise<void>} - nothing
 */
cron.schedule('0 59 23 * * SUN,MON,TUE,WED,THU,FRI,SAT *', async function () {
    let today = new Date();

    try {
        let rental_date = await RentalDates.findOne({type: 'Book'});
        if (rental_date) {
            let return_date = new Date(rental_date.returnDate);
            if (today.getMonth() === return_date.getMonth() &&
                today.getDate() === return_date.getDate() &&
                today.getFullYear() === return_date.getFullYear()) {

                await Reservation.updateMany(
                    {status: 'On Rent', onItemType: 'Book'},
                    {status: 'Uncleared', penalty: 200}
                );
            }
        }
    } catch (err) {
        console.log(err)
    }
});

hbs.registerHelper('dateStr', (date) => { return date == null ? '' : date.toDateString(); });
hbs.registerHelper('hasPenalty', (penalty) => { return penalty > 0; });
hbs.registerHelper('hasRemarks', (remarks) => { return remarks != ''; });
hbs.registerHelper('status-pending', (status) => { return status == 'Pending'; });
hbs.registerHelper('status-pickup-pay', (status) => { return status == 'For Pickup' || status == 'To Pay'; });
hbs.registerHelper('status-on-rent', (status) => { return status == 'On Rent'; });
hbs.registerHelper('status-denied', (status) => { return status == 'Denied'; });
hbs.registerHelper('status-uncleared', (status) => { return status == 'Uncleared'; });
hbs.registerHelper('status-returned', (status) => { return status == 'Returned'; });
hbs.registerHelper('isLocker', (type) => { return type == 'Locker';})
hbs.registerHelper('isBook', (type) => { return type == 'Book';})
hbs.registerHelper('isEquipment', (type) => { return type == 'Equipment';})
hbs.registerHelper('cancellable', (status) => { return status == 'Pending' || status == 'For Pickup' || status == 'To Pay';});
hbs.registerHelper('dateTimeToday', () => {
    const date = new Date();
    return date.toDateString() + ', ' + date.toLocaleTimeString()

});

/**
 * Loads and renders the my reservations page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.myReservations = async function (req, res) {
    try {
        var activeReservations = await Reservation
            .find({
                userID: req.session.idNum,
                status: ['Pending', 'For Pickup', 'To Pay', 'Uncleared', 'On Rent']
            }).sort({ lastUpdated: -1 }).populate('item');

        var pastReservations = await Reservation
            .find({
                userID: req.session.idNum,
                status: ['Denied', 'Returned']
            }).sort({ lastUpdated: -1 }).populate('item');
        res.render('my-reservations-page', {
            active: { active_my_reservations: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
            activeRes: activeReservations,
            pastRes: pastReservations,
        });

    } catch (err) {
        console.log(err);
    }
};

/**
 * Renders and loads the Manage Reservation page
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.reservation_details = async function (req, res) {
    var now = new Date();
    var dateToday = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    var tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dateTomorrow = tomorrow.getFullYear() + '-' + (tomorrow.getMonth() + 1) + '-' + tomorrow.getDate();

    try {
        var pendingToday = await Reservation
            .find({ status: 'Pending' })
            .where('dateCreated').gte(dateToday).lt(dateTomorrow)
            .populate('item');

        var pendingEarlier = await Reservation
            .find({ status: 'Pending' })
            .where('dateCreated').lt(dateToday)
            .populate('item');

        var pickupPayToday = await Reservation
            .find({ status: ['For Pickup', 'To Pay'] }).sort({ pickupPayDate: -1 }).populate('item');

    } catch (err) {
        console.log(err);
    }

    res.render('manage-reservations-page', {
        active: { active_manage_reservations: true },
        sidebarData: {
            dp: req.session.passport.user.profile.photos[0].value,
            name: req.session.passport.user.profile.displayName,
            type: req.session.type
        },
        pendingToday: pendingToday,
        pendingEarlier: pendingEarlier,
        pickupPayToday: pickupPayToday,
    });
}

/**
 * AJAX function used in DataTables for displaying the reservations
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.reservations_get = async function (req, res) {
    try {
        let type = [];
        if (req.query.columns[2].search.value === '' ||
            req.query.columns[2].search.value === 'All')
            type = ['Locker', 'Equipment', 'Book'];
        else
            type.push(req.query.columns[2].search.value);

        let sortObject;
        if (req.query.order[0] == null)
            sortObject = getSortValue(-1, -1);  // default sort
        else
            sortObject = getSortValue(req.query.order[0].column, req.query.order[0].dir);

        count = await Reservation
            .find({onItemType: type})
            .countDocuments();

        data = await Reservation
            .find(
                {
                    onItemType: type, 
                    $or: [
                        {userID: { $regex: '[0-9]*' + req.query.search.value + '[0-9]*' }},
                        {status: { $regex: '[.]*' + req.query.search.value + '[.]*', $options: 'i'}},
                        {onItemType: { $regex: '[.]*' + req.query.search.value + '[.]*', $options: 'i'}},
                    ]
                    
                })
            .sort(sortObject)
            .skip(parseInt(req.query.start))
            .limit(parseInt(req.query.length)).populate('item');

        if (data && count) {

            let datatable = {
                recordsTotal: count,
                recordsFiltered: count,
                data: data,
            }

            res.send(datatable);
        }

    } catch (error) {
        console.log(error);
    }
}

exports.reservation_get_one = async function(req, res) {
    try {
        let reservation = await Reservation.findById(req.query.id).populate('item');
        if (reservation)
            res.send(reservation);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Determines the field to sort and the order
 * @param column - the column number of the DataTable 
 * @param dir  - the direction (asc or desc)
 */
function getSortValue(column, direction) {
    if (column == null || direction == null) {
        console.log('Null')
        return {'lastUpdated': -1};  
    } 

    let dir = (direction === 'asc') ? 1: -1;

    switch (column) {
        case '0':
            return {'userID': dir};
        case '1':
            return {'dateCreated': dir};
        case '2':
            return {'onItemType': dir};
        case '3':
            return {'title': dir};
        case '4':
            return {'description': dir};
        case '5':
            return {'status': dir};
        case '6':
            return {'remarks': dir};
        case '7':
            return {'_id': dir};
        case '8':
            return {'penalty': dir};
        case '9':
            return {'lastUpdated': dir};
        default:
            return {'lastUpdated': -1}
    }
}

/**
 * AJAX function to send the user's firstname and lastname, given the idNum attribute
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.user_get = async function (req, res) {
    try {
        var user = await User.findOne({ idNum: req.query.idnum });
        console.log('user')
        console.log(user)
        if (user)
            res.send(user.firstName + ' ' + user.lastName);
    } catch (err) {
        console.log(err);
    }
}

/**
 * AJAX function to get all reservation with uncleared status
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.uncleared_get = async function (req, res) {
    try {
        var uncleared = await Reservation.find({ userID: req.query.idnum, status: 'Uncleared' });
        if (uncleared)
            res.send(uncleared);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Updates a reservation from the database.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.reservation_update = async function (req, res) {
    console.log('update')
    let paymentDateValidityFlag = true;

    if (!validator.isEmpty(req.body.pickupPayDate) && (req.body.onItemType === 'Locker' || req.body.onItemType === 'Book'))
        if (!isValidPaymentDate(new Date(req.body.pickupPayDate)))
            paymentDateValidityFlag = false

    const errors = validationResult(req);

    if (errors.isEmpty() && paymentDateValidityFlag) {
        try {
            var user = await User.findOne({ idNum: parseInt(req.session.idNum) });

            if (user) {
                var status;
                var reservation = await Reservation.findById(req.body.reservationID);
                switch (req.body.status) {
                    case 'status-manage-pending':
                        status = 'Pending';
                        if (req.body.onItemType == 'Locker') {
                            await Locker.findByIdAndUpdate(reservation.item, { status: 'occupied' });
                        }
                        else {
                            if (reservation.status == 'Denied' || reservation.status == 'Returned') {
                                await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: 1 } });
                            }
                        }
                        break;
                    case 'status-manage-pickup-pay':
                        status = (req.body.onItemType == 'Locker') ? 'To Pay' : 'For Pickup';
                        if (req.body.onItemType == 'Locker') {
                            await Locker.findByIdAndUpdate(reservation.item, { status: 'occupied' });
                        }
                        else {
                            if (reservation.status == 'Denied' || reservation.status == 'Returned') {
                                await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: 1 } });
                            }
                        }
                        break;
                    case 'status-manage-on-rent':
                        status = 'On Rent';
                        if (req.body.onItemType == 'Locker') {
                            await Locker.findByIdAndUpdate(reservation.item, { status: 'occupied' });
                        }
                        else {
                            if (reservation.status == 'Denied' || reservation.status == 'Returned') {
                                await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: 1 } });
                            }
                        }
                        break;
                    case 'status-manage-returned':
                        status = 'Returned';
                        if (req.body.onItemType == 'Locker') {
                            await Locker.findByIdAndUpdate(reservation.item, { status: 'vacant' });
                        }
                        else {
                            if (reservation.status != 'Denied' && reservation.status != 'Returned') {
                                await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: -1 } });
                            }
                        }
                        break;
                    case 'status-manage-uncleared':
                        status = 'Uncleared';
                        if (req.body.onItemType == 'Locker') {
                            await Locker.findByIdAndUpdate(reservation.item, { status: 'uncleared' });
                        }
                        else {
                            if (reservation.status == 'Denied' || reservation.status == 'Returned') {
                                await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: 1 } });
                            }
                        }
                        break;
                    case 'status-manage-denied':
                        status = 'Denied';
                        if (req.body.onItemType == 'Locker') {
                            await Locker.findByIdAndUpdate(reservation.item, { status: 'vacant' });
                        }
                        else {
                            if (reservation.status != 'Denied' && reservation.status != 'Returned') {
                                await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: -1 } });
                            }
                        }
                        break;
                }

                if (userIsAdmin(user))
                    await Reservation.findByIdAndUpdate(req.body.reservationID, {
                        status: status,
                        remarks: req.body.remarks,
                        penalty: req.body.status == 'status-manage-uncleared' ? req.body.penalty : 0,
                        lastUpdated: Date.now(),
                        pickupPayDate: req.body.pickupPayDate
                    });
            }
        } catch (err) { console.log(err); };
    }
    else {
        console.log(errors);
    }

    res.redirect('/reservations/manage');
}

/**
 * Deletes a reservation from the database.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.reservation_delete = async function (req, res) {
    try {
        var reservation = await Reservation.findById(req.body.reservationID);
        var user = await User.findOne({ idNum: req.session.idNum });

        if (userIsAdmin(user) || reservation.userID == req.session.idNum) {
            if (reservationIsDeletable(reservation.status) || isCancellable(reservation)) {
                if (reservation.onItemType === 'Equipment' 
                        && (reservation.status === 'On Rent'
                            || reservation.status === 'For Pickup'
                            || reservation.status === 'Pending')) {
                    await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: -1 } });
                } else if (reservation.onItemType === 'Locker') {
                    await Locker.findByIdAndUpdate(reservation.item, { status: 'vacant' });
                } else {
                    await Book.findByIdAndUpdate(reservation.item, { $inc: { onRent: -1 } });
                }
                await Reservation.findByIdAndDelete(reservation._id);
            }
        }
    } catch (err) { console.log(err); };

    if (req.body.prevPath == 'manageReservations')
        res.redirect('/reservations/manage');
    else
        res.redirect('/reservations');
};

/**
 * Checks if the reservation is deletable.
 * @param status - the reservation status
 * @returns {boolean} - true if status is either Returned or Denied; false otherwise.
 */
function reservationIsDeletable(status) {
    return (status === 'Returned' || status === 'Denied');
}
exports.reservationIsDeletable = reservationIsDeletable;

/**
 * Checks if a reservation is cancellable.
 * @param reservation - the reservation object
 * @returns {boolean} - true if the status attribute of reservation is Pending, For Pickup, or To Pay; false otherwise
 */
function isCancellable(reservation) {
    return reservation.status == 'Pending'
        || reservation.status == 'For Pickup'
        || reservation.status == 'To Pay';
}
exports.isCancellable = isCancellable;

/**
 * Checks if a user is an admin
 * @param user - the user object
 * @returns {boolean} - true if the type attribute of user is studentRep; false otherwise
 */
function userIsAdmin(user) {
    return user.type == 'studentRep';
}
exports.userIsAdmin = userIsAdmin;
exports.getSortValue = getSortValue;

/**
 * Sets all pending equipment reservation to denied given the hour and minute of pickup.
 * @param hours - the hour of the pickupDate
 * @param minutes - the minute of the pickupDate
 * @returns {Promise<void>}
 */
async function setAllPendingToDenied (hours, minutes) {
    let today = new Date();
    today.setHours(hours, minutes, 0, 0);
    try {
        const reservations = await Reservation.find({
            onItemType: 'Equipment',
            status: 'Pending',
            pickupPayDate: today
        });

        for (let i = 0; i < reservations.length; i++) {
            await Equipment
                .findByIdAndUpdate(
                    reservations[i].item,
                    { $inc: { onRent: -1 } }
                );
        }

        await Reservation
            .updateMany(
                {
                    onItemType: 'Equipment',
                    status: 'Pending',
                    pickupPayDate: today
                },
                {
                    status: 'Denied',
                    lastUpdated: Date.now(),
                    remarks: 'Reservation was not approved on time, please try again'
                }
            );
    }
    catch (err) {
        console.log(err);
    }
}

/**
 * Checks if a date is a valid "To Pay" or Payment date
 * @param date - the date object
 * @returns {boolean} - true if the date is at least the present date; false otherwise
 */
function isValidPaymentDate(date) {
    let today = new Date();
    today.setUTCHours(0,0,0,0)
    return date >= today;
}
exports.isValidPaymentDate = isValidPaymentDate;