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
        } catch (err) {
            console.log(err);
        }
    } else if (req.query.bldg != null) {
        try {
            let panel_floor = await Panel.find({ building: req.query.bldg }).distinct('level').populate();
            if (panel_floor[0] != null) {
                panel_floor = panel_floor.sort();
                res.redirect("/reserve/locker?bldg=" + req.query.bldg + "&flr=" + panel_floor[0]);
            } else {
                res.redirect("/reserve/locker");
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            let panel_building = await Panel.find().distinct('building').populate();
            if (panel_building[0] != null) {
                try {
                    let panel_floor = await Panel.find({ building: panel_building[0] }).distinct('level');
                    panel_floor = panel_floor.sort();
                    res.redirect("/reserve/locker?bldg=" + panel_building[0] + "&flr=" + panel_floor[0]);
                } catch (err) {
                    console.log(err);
                }
            } else {
                res.render('locker-form', {
                    active: { active_index: true },
                    sidebarData: {
                        dp: req.session.passport.user.profile.photos[0].value,
                        name: req.session.passport.user.profile.displayName,
                        type: req.session.type
                    }
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
}

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
            let validLocker = await isLockerVacant(lockerid);
            if (validLocker) {
                await reservation.save();
                await Locker.findByIdAndUpdate(lockerid, {status: 'occupied'});
            } else {
                console.log("Reservation unsuccessful. Locker is occupied.")
            }
        } else {
            console.log("Locker reservation disabled.");
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect("/reservations");
}

async function hasActiveLockerReservation(userID) {
    let exists = null;
    try {
        exists = await Reservation.exists({
            userID: userID,
            onItemType: 'Locker',
            $or: [{status: 'Pending'}, {status: 'To Pay'}, {status: 'On Rent'}, {status: 'Uncleared'}]
        });
    } catch (err) {
        console.log(err);
    }
    return exists;
}

async function isLockerVacant(lockerid) {
    let locker;
    try {
        locker = await Locker.findById(lockerid);
    } catch (err) {
        console.log(err);
    }
    return locker.status === 'vacant';
}