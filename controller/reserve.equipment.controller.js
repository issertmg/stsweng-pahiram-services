const Equipment = require('../model/equipment.model');
const Reservation = require('../model/reservation.model');

exports.equipment = async function (req, res) {
    try {
        let equipment = await Equipment.find({$expr: {$lt: ['$onRent', '$quantity']}})
        let active_reservation = await has2ActiveEquipmentReservations(req.session.idNum);
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
        let invalid = await has2ActiveEquipmentReservations(req.session.idNum);
        if (!invalid) {
            let equipment = await Equipment.findById(req.body.equipmentid);
            let equipmentid = req.body.equipmentid;
            let reason = req.body.reason;
            let pickupDate = new Date();
            do {
                pickupDate.setDate(pickupDate.getDate()+1);                
            }  while (pickupDate.getDay()==0 || pickupDate.getDay()==6);    //0 is Sunday, 6 is Saturday

            switch(parseInt(req.body.borrowtime)) {
                case 1: pickupDate.setHours(7,30,0); break;
                case 2: pickupDate.setHours(9,15,0); break;
                case 3: pickupDate.setHours(11,0,0); break;
                case 4: pickupDate.setHours(12,45,0); break;
                case 5: pickupDate.setHours(14,30,0); break;
                case 6: pickupDate.setHours(16,15,0); break;
                default: pickupDate.setHours(0,0,0);
            }
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
}