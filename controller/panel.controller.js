const Panel = require('../model/panel.model');
const Locker = require('../model/locker.model');
const Reservation = require('../model/reservation.model');
const User = require('../model/user.model');
const hbs = require('hbs');
const {validationResult} = require('express-validator');

hbs.registerHelper('lockernumber', function (str) {
    return JSON.parse(JSON.stringify(str)).number;
});
hbs.registerHelper('lockerstatus', function (str) {
    return JSON.parse(JSON.stringify(str)).status;
});
hbs.registerHelper('lockerid', function (str) {
    return JSON.parse(JSON.stringify(str))._id;
});
hbs.registerHelper('capitalizeFirst', function (text) {
    return text[0].toUpperCase() + text.slice(1);
});

hbs.registerHelper('lockerIsBig', (type) => {
    return type === 'big';
});
hbs.registerHelper('notFirst', (index) => {
    return index !== 0;
});

exports.panel_create = async function (req, res) {

    let errors = validationResult(req);
    if (errors.isEmpty()) {
        try {
            let panel_number = await Panel
                .find({building: req.body.building, level: req.body.level, type: req.body.type})
                .distinct('number')
                .sort();

            let missingPanelNumber = 1;
            for (let i = 0; i < panel_number.length; i++) {
                if (missingPanelNumber !== panel_number[i]) {
                    break;
                }
                missingPanelNumber++;
            }

            let locker_array = [];
            for (let i = parseInt(req.body.lowerRange); i <= parseInt(req.body.upperRange); i++) {
                let locker = new Locker({number: i, status: 'vacant'})
                await locker.save();
                locker_array.push(locker._id);
            }

            let panel = new Panel({
                number: missingPanelNumber,
                type: req.body.type,
                building: req.body.building,
                level: req.body.level,
                lockers: locker_array,
                lowerRange: req.body.lowerRange,
                upperRange: req.body.upperRange
            });

            await panel.save();
        } catch (err) {
            console.log(err);
        }
        res.redirect("/manage-lockers/?bldg=" + req.body.building + "&flr=" + req.body.level);
    }
}

exports.panel_details = async function (req, res) {

    // Show the panels
    if (req.query.bldg != null && req.query.flr != null) {
        try {
            let panel = await Panel.find({building: req.query.bldg, level: req.query.flr}).populate('lockers');
            let panel_floor = await Panel.find({building: req.query.bldg}).distinct('level').populate('lockers');
            let panel_building = await Panel.find().distinct('building').populate('lockers');

            if (panel.length) {
                res.render('manage-lockers-page', {
                    active: {active_manage_lockers: true},
                    sidebarData: {
                        dp: req.session.passport.user.profile.photos[0].value,
                        name: req.session.passport.user.profile.displayName,
                        type: req.session.type
                    },
                    panel_buildings: panel_building,
                    panel_floors: panel_floor.sort(),
                    panels: panel
                });
            } else res.redirect("/manage-lockers/?bldg=" + req.query.bldg);
        } catch (err) {
            console.log(err);
        }
    } else if (req.query.bldg != null) {
        try {
            let panel_floor = await Panel.find({building: req.query.bldg}).distinct('level').populate();
            if (panel_floor[0] != null) {
                panel_floor = panel_floor.sort();
                res.redirect("/manage-lockers/?bldg=" + req.query.bldg + "&flr=" + panel_floor[0]);
            } else {
                res.redirect("/manage-lockers/");
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            let panel_building = await Panel.find().distinct('building').populate();
            if (panel_building[0] != null) {
                try {
                    let panel_floor = await Panel.find({building: panel_building[0]}).distinct('level');
                    panel_floor = panel_floor.sort();
                    res.redirect("/manage-lockers/?bldg=" + panel_building[0] + "&flr=" + panel_floor[0]);
                } catch (err) {
                    console.log(err);
                }
            } else {
                res.render('manage-lockers-page', {
                    active: {active_manage_lockers: true},
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

exports.panel_update = async function (req, res) {
    try {
        let panel = await Panel.findById(req.body.panelid);
        if (panel) {
            let lockerIndex = req.body.lockernumber - panel.lowerRange;
            let lockerid = panel.lockers[lockerIndex]._id;
            let editable = await isLockerVacantBroken(lockerid);
            if (editable) {
                await Locker.findByIdAndUpdate(lockerid, {status: req.body.status});
            } else {
                console.log('Locker status cannot be updated.');
            }
        } else {
            console.log('Panel cannot be accessed');
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect("/manage-lockers/?bldg=" + req.body.building + "&flr=" + req.body.level);
}

exports.panel_delete = async function (req, res) {
    try {
        let panel = await Panel.findById(req.body.panelid);

        for (const locker of panel.lockers) {
            await Locker.findByIdAndDelete(locker._id)
        }
        await Panel.findByIdAndDelete(req.body.panelid);
    } catch (err) {
        console.log(err);
    }
    res.redirect("/manage-lockers/?bldg=" + req.body.building + "&flr=" + req.body.level);
}

exports.lessee_get = async function (req, res) {
    try {
        let reservation = await Reservation.findOne({
            item: req.query.lockerid,
            $or: [{status: 'Pending'}, {status: 'To Pay'}, {status: 'On Rent'}, {status: 'Uncleared'}]
        });
        let user = await User.findOne({idNum: reservation.userID});

        if (user)
            res.send(user);
    } catch (err) {
        console.log(err);
    }
};

exports.status_get = async function (req, res) {
    try {
        let deletable = true;
        let panel = await Panel.findById(req.query.panelid).populate('lockers');
        let lockers = panel.lockers;

        for (let i = 0; i < lockers.length; i++)
            if (lockers[i].status === 'occupied' || lockers[i].status === 'uncleared')
                deletable = false;

        if (panel)
            res.send(deletable);
    } catch (err) {
        console.log(err);
    }
}

exports.panel_unclear = async function (req, res) {
    try {
        await Reservation.updateMany(
            {status: 'On Rent', onItemType: 'Locker'},
            {status: 'Uncleared', penalty: 200}
        );

        let unclearedResLockers = await Reservation
            .find({status: 'Uncleared', onItemType: 'Locker'})
            .select('item')

        if (unclearedResLockers) {
            let unclearedLockers = unclearedResLockers.map(r => r.item)

            await Locker.updateMany(
                {_id: {$in: unclearedLockers}},
                {status: 'uncleared'}
            )
        }

    } catch (err) {
        console.log(err);
    }
    res.redirect('/manage-lockers/');
}

async function isLockerVacantBroken(lockerid) {
    let locker;
    try {
        locker = await Locker.findById(lockerid);
    } catch (err) {
        console.log(err);
    }
    return locker.status === 'vacant' || locker.status === 'broken';
}