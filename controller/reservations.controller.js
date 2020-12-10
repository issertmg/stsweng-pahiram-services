const hbs = require('hbs');
const cron = require('node-cron');

const Reservation = require('../model/reservation.model');
const User = require('../model/user.model');
const Equipment = require('../model/equipment.model');
const Locker = require('../model/locker.model');

const { validationResult } = require('express-validator');

const EQUIPMENT_PENALTY_INITIAL = 50;
const EQUIPMENT_PENALTY_INCREMENT = 20;

/**
 * Marks all unreturned equipment as uncleared, and increments penalty charges for uncleared reservations every 6:30PM.
 * @returns {Promise<void>} - nothing
 */
cron.schedule('0 12 0 * * *', async function () {

    try {
        // for already uncleared equipment, increment penalty by 20
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

        // set unreturned equipment as uncleared
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

        // set for-pickup equipment as returned
        const reservations1 = await Reservation.find({
            onItemType: 'Equipment',
            status: 'For Pickup',
            pickupPayDate: Date.now()
        });
        let i;
        for (i in reservations1) {
            await Equipment.findByIdAndUpdate(i.item, { $inc: { onRent: -1 } });
        }
        await Reservation
            .updateMany(
                {
                    onItemType: 'Equipment',
                    status: 'For Pickup',
                    pickupPayDate: Date.now()
                },
                {
                    status: 'Returned',
                    lastUpdated: Date.now(),
                    remarks: 'You did not pickup the equipment within the reservation date'
                }
            );

        // set pending equipment as denied
        const reservations2 = await Reservation.find({
            onItemType: 'Equipment',
            status: 'Pending',
            pickupPayDate: Date.now()
        });

        for (i in reservations2) {
            await Equipment.findByIdAndUpdate(i.item, { $inc: { onRent: -1 } });
        }
        await Reservation
            .updateMany(
                {
                    onItemType: 'Equipment',
                    status: 'Pending',
                    pickupPayDate: Date.now()
                },
                {
                    status: 'Denied',
                    lastUpdated: Date.now(),
                    remarks: 'Reservation was not approved on time, please try again'
                }
            );
        
    } catch (err) {
        console.log(err);
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
            .find({ status: ['For Pickup', 'To Pay'] }).sort({ pickupPayDate: -1 });

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

// exports.reservations_get = async function (req, res) {
//     try {
//         var reservations = new Object();
//         const itemsPerPage = 5;

//         var statuses = []
//         switch (req.query.status) {
//             case 'onrent':
//                 statuses.push('On Rent');
//                 break;
//             case 'uncleared':
//                 statuses.push('Uncleared');
//                 break;
//             case 'returned':
//                 statuses.push('Returned');
//                 break;
//             case 'denied':
//                 statuses.push('Denied');
//                 break;
//             default:
//                 statuses.push('On Rent');
//                 statuses.push('Uncleared');
//                 statuses.push('Returned');
//                 statuses.push('Denied');
//         }

//         reservations.totalCt = await Reservation
//             .find({
//                 status: statuses,
//                 userID: { $regex: '[0-9]*' + req.query.idnum + '[0-9]*' }
//             })
//             .countDocuments();

//         reservations.items = await Reservation
//             .find({
//                 status: statuses,
//                 userID: { $regex: '[0-9]*' + req.query.idnum + '[0-9]*' }
//             })
//             .sort({ lastUpdated: -1 })
//             .skip((req.query.page - 1) * itemsPerPage)
//             .limit(itemsPerPage);

//         if (reservations) {
//             res.send(reservations);
//         }

//     } catch (error) {
//         console.log(error);
//     }
// }

exports.reservations_get = async function (req, res) {
    console.log('query');
    console.log(req.query);
    try {
        let statuses = [];
        if (req.query.columns[5].search.value === '' ||
            req.query.columns[5].search.value === 'All')
            statuses = ['On Rent', 'Uncleared', 'Returned', 'Denied'];
        else
            statuses.push(req.query.columns[5].search.value);

        console.log('Status: ' + statuses)

        count = await Reservation
            .find({status: statuses})
            .countDocuments();

        data = await Reservation
            .find(
                {
                    status: statuses, 
                    $or: [
                        {userID: { $regex: '[0-9]*' + req.query.search.value + '[0-9]*' }},
                        {status: { $regex: '[.]*' + req.query.search.value + '[.]*', $options: 'i'}},
                        {onItemType: { $regex: '[.]*' + req.query.search.value + '[.]*', $options: 'i'}},
                    ]
                    
                },
                '-item')
            .sort(getSortValue(req.query.order[0]))
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

    } catch (error) {
        console.log(error);
    }
}

function getSortValue(order) {

    /*
    { "data": "userID" },
    { "data": "onItemType" },
    { "data": "title" },
    { "data": "dateCreated" },
    { "data": "description" },
    { "data": "status" },
    { "data": "remarks", "visible": false },
    { "data": "_id", "visible": false },
    { "data": "penalty", "visible": false },
    { "data": "lastUpdated", "visible": false },
    */

    if (order == null) {
        console.log('Null')
        return {'lastUpdated': -1};  
    } 

    let dir = (order.dir === 'asc') ? 1: -1;

    switch (order.column) {
        case '0':
            return {'userID': dir};
        case '1':
            return {'onItemType': dir};
        case '2':
            return {'title': dir};
        case '3':
            return {'dateCreated': dir};
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
    }
}

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

exports.uncleared_get = async function (req, res) {
    try {
        var uncleared = await Reservation.find({ userID: req.query.idnum, status: 'Uncleared' });
        if (uncleared)
            res.send(uncleared);
    } catch (error) {
        console.log(error);
    }
}

exports.reservation_update = async function (req, res) {
    console.log('update')
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        try {
            var user = await User.findOne({ idNum: parseInt(req.session.idNum) });

            console.log(req.body);

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
                        pickupPayDate: req.body.paymentDate
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

        if (userIsAdmin(user) || (reservation.userID == req.session.idNum && isCancellable(reservation))) {

            if (reservation.onItemType == 'Equipment' 
                    && (reservation.status == 'On Rent'
                        || reservation.status == 'For Pickup'
                        || reservation.status == 'Pending')) {
                await Equipment.findByIdAndUpdate(reservation.item, { $inc: { onRent: -1 } });
            } else if (reservation.onItemType == 'Locker') {
                await Locker.findByIdAndUpdate(reservation.item, { status: 'vacant' });
            }
            await Reservation.findByIdAndDelete(reservation._id);
        }
    } catch (err) { console.log(err); };

    if (req.body.prevPath == 'manageReservations')
        res.redirect('/reservations/manage');
    else
        res.redirect('/reservations');
};

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