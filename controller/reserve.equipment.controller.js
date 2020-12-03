const Equipment = require('../model/equipment.model');
const Reservation = require('../model/reservation.model');

const { validationResult } = require('express-validator');

/**
 * Loads and renders the equipment form/reservation page
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.equipment = async function (req, res) {
    try {
        const equipment = await Equipment.find({$expr: {$lt: ['$onRent', '$quantity']}})
        const active_reservation = await has2ActiveEquipmentReservations(req.session.idNum);
        res.render('equipment-form', {
            active: { active_index: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            },
            equipmentList: equipment,
            status: active_reservation
        });
    } catch (err) {
        console.log(err);
    }
};

/**
 * Adds a new reservation object and saves it in the database.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.reserve_equipment = async function (req, res) {
    let errors = validationResult(req);
    try {
        const invalid = await has2ActiveEquipmentReservations(req.session.idNum);
        if (!invalid && errors.isEmpty()) {
            let equipment = await Equipment.findById(req.body.equipmentid);
            let equipmentid = req.body.equipmentid;
            let reason = req.body.reason;
            let pickupDate = new Date();

            pickupDate = getNextWeekDayDate(pickupDate);
            let pickupTime = getPickupTime(parseInt(req.body.borrowtime));
            pickupDate.setHours(pickupTime[0],pickupTime[1],0);

            let descString = reason + ", " + "on " + pickupDate.toLocaleString('en-US');
            let reservation = new Reservation({
                title: equipment.name,
                userID: req.session.idNum,
                item: equipmentid,
                status: 'Pending',
                description: descString,
                onItemType: 'Equipment',
                pickupPayDate: pickupDate
            });
            await reservation.save();
            await Equipment.findByIdAndUpdate(equipmentid, {$inc: {onRent: 1}});
        }
        else {
            console.log("Equipment reservation disabled.");
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect("/reservations");
};

/**
 * Returns the next weekday date from the given date.
 * @param date - the date object
 * @returns {Date} - the next weekday date
 */
function getNextWeekDayDate(date) {
    let newDate = new Date(date.getTime());
    const day = {"friday": 5, "saturday": 6}

    if (newDate.getDay() === day["friday"])
        newDate.setDate(newDate.getDate()+3);
    else if (newDate.getDay() === day["saturday"])
        newDate.setDate(newDate.getDate()+2);
    else
        newDate.setDate(newDate.getDate()+1);

    return newDate;
}
exports.getNextWeekDayDate = getNextWeekDayDate;

/**
 * Returns the pickup time for equipment reservation.
 * @param optionNumber - option number of borrow time (see borrow-time<select> element in equipment-form.hbs)
 * @returns {array}  - the first element is the hour, the second element is the minute
 */
function getPickupTime(optionNumber) {
    let hour = 0;
    let minute = 0
    switch(parseInt(optionNumber)) {
        case 1: hour = 7; minute = 30; break;
        case 2: hour = 9; minute = 15; break;
        case 3: hour = 11; minute = 0; break;
        case 4: hour = 12; minute = 45; break;
        case 5: hour = 14; minute = 30; break;
        case 6: hour = 16; minute = 15; break;
        default: hour = 7; minute = 30;
    }
    return [hour, minute];
}
exports.getPickupTime = getPickupTime;

/**
 * Checks if the user has 2 active equipment reservation in the database.
 * @param userID - the id of user
 * @returns {Promise<boolean>} - true if user has 2 active equipment reservation, false otherwise
 */
async function has2ActiveEquipmentReservations(userID) {
    let reservationCount;
    try {
        reservationCount = await Reservation.find({
            userID: userID,
            onItemType: 'Equipment',
            $or: [{status: 'Pending'}, {status: 'For Pickup'}, {status: 'On Rent'}, {status: 'Uncleared'}]
        }).countDocuments();
    }
    catch (err) {
        console.log(err);
    }
    return reservationCount === 2;
};
