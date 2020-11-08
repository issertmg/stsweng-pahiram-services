const hbs = require('hbs');
const cron = require('node-cron');

const Reservation = require('../model/reservation.model');
const User = require('../model/user.model');
const Equipment = require('../model/equipment.model');
const Locker = require('../model/locker.model');

const EQUIPMENT_PENALTY_INITIAL = 50;
const EQUIPMENT_PENALTY_INCREMENT = 20;

// Every 6:30pm, mark all unretuned equipment as uncleared 
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

    } catch (err) {
        console.log(err);
    }

});


hbs.registerHelper('dateStr', (date) => { return date == null ? '' : date.toDateString(); });

hbs.registerHelper('dateTimeToday', () => {
    const date = new Date();
    return date.toDateString() + ', ' + date.toLocaleTimeString()

});

hbs.registerHelper('hasPenalty', (penalty) => { return penalty > 0; });
hbs.registerHelper('hasRemarks', (remarks) => { return remarks != ''; });

hbs.registerHelper('status-pending', (status) => { return status == 'Pending'; });
hbs.registerHelper('status-pickup-pay', (status) => { return status == 'For Pickup' || status == 'To Pay'; });
hbs.registerHelper('status-on-rent', (status) => { return status == 'On Rent'; });
hbs.registerHelper('status-denied', (status) => { return status == 'Denied'; });
hbs.registerHelper('status-uncleared', (status) => { return status == 'Uncleared'; });
hbs.registerHelper('status-returned', (status) => { return status == 'Returned'; });

hbs.registerHelper('cancellable', (status) => {
    return status == 'Pending' || status == 'For Pickup' || status == 'To Pay';
});

hbs.registerHelper('isLocker', (type) => {
    return type == 'Locker';
})

exports.myReservations = async function (req, res) {
    try {
        var activeReservations = await Reservation
            .find({
                userID: req.session.idNum,
                status: ['Pending', 'For Pickup', 'To Pay', 'Uncleared', 'On Rent']
            }).sort({ lastUpdated: -1 });

        var pastReservations = await Reservation
            .find({
                userID: req.session.idNum,
                status: ['Denied', 'Returned']
            }).sort({ lastUpdated: -1 });

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

exports.reservations_get = async function (req, res) {
    try {
        var reservations = new Object();
        const itemsPerPage = 5;

        var statuses = []
        switch (req.query.status) {
            case 'onrent':
                statuses.push('On Rent');
                break;
            case 'uncleared':
                statuses.push('Uncleared');
                break;
            case 'returned':
                statuses.push('Returned');
                break;
            case 'denied':
                statuses.push('Denied');
                break;
            default:
                statuses.push('On Rent');
                statuses.push('Uncleared');
                statuses.push('Returned');
                statuses.push('Denied');
        }

        reservations.totalCt = await Reservation
            .find({
                status: statuses,
                userID: { $regex: '[0-9]*' + req.query.idnum + '[0-9]*' }
            })
            .countDocuments();

        reservations.items = await Reservation
            .find({
                status: statuses,
                userID: { $regex: '[0-9]*' + req.query.idnum + '[0-9]*' }
            })
            .sort({ lastUpdated: -1 })
            .skip((req.query.page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        if (reservations) {
            res.send(reservations);
        }

    } catch (error) {
        console.log(error);
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

    res.redirect('/reservations/manage');
}

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

function isCancellable(reservation) {
    return reservation.status == 'Pending'
        || reservation.status == 'For Pickup'
        || reservation.status == 'To Pay';
}

function userIsAdmin(user) {
    return user.type == 'studentRep';
}