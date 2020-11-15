const Equipment = require('../model/equipment.model');
const Panel = require('../model/panel.model');
const Reservation = require('../model/reservation.model');
const Locker = require('../model/locker.model');

exports.locker = async function (req, res) {

    if (req.query.bldg != null && req.query.flr != null) {
        try {
            var panel = await Panel.find({ building: req.query.bldg, level: req.query.flr }).populate('lockers');
            var panel_floor = await Panel.find({ building: req.query.bldg }).distinct('level').populate('lockers');
            var panel_building = await Panel.find().distinct('building').populate('lockers');
            var active_reservation = await hasActiveLockerReservation(req.session.idNum);

            res.render('locker-form', {
                active: { active_index: true },
                sidebarData: { 
                    dp: req.session.passport.user.profile.photos[0].value,
                    name: req.session.passport.user.profile.displayName,
                    type: req.session.type      
                },
                panel_buildings: panel_building,
                panel_floors: panel_floor.sort(),
                panels: panel,
                status: active_reservation
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    else if (req.query.bldg != null) {
        try {
            var panel_floor = await Panel.find({ building: req.query.bldg }).distinct('level').populate();
            if (panel_floor[0] != null) {
                panel_floor = panel_floor.sort();
                res.redirect("/reserve/locker?bldg=" + req.query.bldg + "&flr=" + panel_floor[0]);
            }
            else {
                res.redirect("/reserve/locker");
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        try {
            var panel_building = await Panel.find().distinct('building').populate();
            if (panel_building[0] != null) {
                try {
                    var panel_floor = await Panel.find({ building: panel_building[0] }).distinct('level');
                    panel_floor = panel_floor.sort();
                    res.redirect("/reserve/locker?bldg=" + panel_building[0] + "&flr=" + panel_floor[0]);
                }
                catch (err) {
                    console.log(err);
                }
            }
            else {
                res.render('locker-form', {
                    active: { active_index: true },
                    sidebarData: {
                        dp: req.session.passport.user.profile.photos[0].value,
                        name: req.session.passport.user.profile.displayName,
                        type: req.session.type      
                    }
                });
            }
        }
        catch (err) {
            console.log(err);
        }
    }
};

exports.reserve_locker = async function (req, res) {
    try {
        const invalid = await hasActiveLockerReservation(req.session.idNum); 
        if (!invalid) {
            let panel = await Panel.findById(req.body.panelid);
            let paneltype = panel.type[0].toUpperCase() + panel.type.slice(1);
            let lockerIndex = req.body.lockernumber - panel.lowerRange;
            let lockerid = panel.lockers[lockerIndex]._id;

            let titleString = "Locker #" + req.body.lockernumber;
            let descString = titleString + ", " + paneltype + " Panel #" + panel.number +
                            ", " + panel.building + ", " + panel.level + "/F"; 
        
            let reservation = new Reservation({
                title: titleString,
                userID: req.session.idNum,
                item: lockerid,
                status: 'Pending',
                description: descString,
                onItemType: 'Locker'
            });
            const validLocker = await isLockerVacant(lockerid);
            if (validLocker) {
                await reservation.save();
                await Locker.findByIdAndUpdate(lockerid, {status: 'occupied'});
            }
            else {
                console.log("Reservation unsuccessful. Locker is occupied.")
            }            
        }
        else {
            console.log("Locker reservation disabled.");
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect("/reservations");
};

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

exports.reserve_equipment = async function (req, res) {
    try {
        const invalid = await has2ActiveEquipmentReservations(req.session.idNum);
        if (!invalid) {
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

function getNextWeekDayDate(date) {
    let newDate = new Date(date.getTime());
    const day = {"friday": 5, "saturday": 6}

    if (newDate.getDay() == day["friday"]) {
        newDate.setDate(newDate.getDate()+3);
    }
    else if (newDate.getDay() == day["saturday"]) {
        newDate.setDate(newDate.getDate()+2);
    }
    else {
        newDate.setDate(newDate.getDate()+1);
    }

    return newDate;
}

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
        default: break;
    }
    return [hour, minute];
}

async function hasActiveLockerReservation(userID) {
    let exists;
    try {
        exists = await Reservation.exists({
            userID: userID, 
            onItemType: 'Locker',
            $or: [{status: 'Pending'}, {status: 'To Pay'}, {status: 'On Rent'}, {status: 'Uncleared'}]
        });
    }
    catch (err) {
        console.log(err);
    }
    return exists;
};

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
    return reservationCount == 2;
};

async function isLockerVacant(lockerid) {
    let locker;
    try {
        locker = await Locker.findById(lockerid);
    }
    catch (err) {
        console.log(err);
    }
    return locker.status =='vacant';
};

exports.getNextWeekDayDate = getNextWeekDayDate;
exports.getPickupTime = getPickupTime;