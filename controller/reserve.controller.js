const Equipment = require('../model/equipment.model');
const Panel = require('../model/panel.model');
const Reservation = require('../model/reservation.model');
const Locker = require('../model/locker.model');

exports.locker = async function (req, res) {

    if (req.query.bldg != null && req.query.flr != null) {
        try {
            let panel = await Panel.find({ building: req.query.bldg, level: req.query.flr }).populate('lockers');
            let panel_floor = await Panel.find({ building: req.query.bldg }).distinct('level').populate('lockers');
            let panel_building = await Panel.find().distinct('building').populate('lockers');
            let active_reservation = await hasActiveLockerReservation(req.session.idNum);

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
    } else if (req.query.bldg != null) {
        try {
            let panel_floor = await Panel.find({ building: req.query.bldg }).distinct('level').populate();
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
            let panel_building = await Panel.find().distinct('building').populate();
            if (panel_building[0] != null) {
                try {
                    let panel_floor = await Panel.find({ building: panel_building[0] }).distinct('level');
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
        let invalid = await hasActiveLockerReservation(req.session.idNum);
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
            var validLocker = await isLockerVacant(lockerid);
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
        equipment = await Equipment.find({$expr: {$lt: ['$onRent', '$quantity']}})
        var active_reservation = await has2ActiveEquipmentReservations(req.session.idNum);
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
        var invalid = await has2ActiveEquipmentReservations(req.session.idNum);
        if (!invalid) {
            var equipment = await Equipment.findById(req.body.equipmentid);
            var equipmentid = req.body.equipmentid;
            var reason = req.body.reason;
            var pickupDate = new Date();
            do {
                pickupDate.setDate(pickupDate.getDate()+1);                
            }   //0 is Sunday,6 Saturday
            while (pickupDate.getDay()==0 || pickupDate.getDay()==6);

            switch(parseInt(req.body.borrowtime)) {
                case 1: pickupDate.setHours(7,30,0); break;
                case 2: pickupDate.setHours(9,15,0); break;
                case 3: pickupDate.setHours(11,0,0); break;
                case 4: pickupDate.setHours(12,45,0); break;
                case 5: pickupDate.setHours(14,30,0); break;
                case 6: pickupDate.setHours(16,15,0); break;
                default: pickupDate.setHours(0,0,0);
            }
            var descString = reason + ", " + "on " + pickupDate.toLocaleString('en-US');
            var reservation = new Reservation({
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

async function hasActiveLockerReservation(userID) {
    let exists = null;
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
}

async function has2ActiveEquipmentReservations(userID) {
    try {
        var reservationCount = await Reservation.find({
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
    try {
        var locker = await Locker.findById(lockerid);
    }
    catch (err) {
        console.log(err);
    }
    return locker.status =='vacant';
};
