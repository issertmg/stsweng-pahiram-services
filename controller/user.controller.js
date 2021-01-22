const User = require('../model/user.model');
const Reservation = require('../model/reservation.model');
const { validationResult } = require('express-validator');

/**
 * Renders and loads the Manage People page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.people_details = function (req, res) {

    var colleges = User.schema.path('college').enumValues;

    res.render('manage-people-page', {
        active: { active_manage_people: true },
        sidebarData: {
            dp: req.session.passport.user.profile.photos[0].value,
            name: req.session.passport.user.profile.displayName,
            type: req.session.type
        },
        colleges: colleges
    });
}

/**
 * Updates the info of a user.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.people_update = async function (req, res) {

    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            const user = await User.findById(req.body.id);
            const formerIdNum = user.idNum;
            await User.findByIdAndUpdate(
                req.body.id,
                {
                    idNum: req.body.idNum,
                    college: req.body.college,
                    degreeProg: req.body.degProg,
                    contactNum: req.body.mobile
                }
            );
            await Reservation.updateMany({ userID: formerIdNum }, { userID: req.body.idNum });
            if (req.session.idNum === formerIdNum) {
                req.session.idNum = req.body.idNum;
            }
        }
    } catch (err) {
        console.log(err);
    }

    res.redirect('/profile/manage');
}

/**
 * AJAX function used to initialize the table containing the users' info in the Manage People page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.people_get = async function (req, res) {
    try {
        let sortObject;
        if (req.query.order[0] == null)
            sortObject = getSortValue(-1, -1);  // default sort
        else
            sortObject = getSortValue(req.query.order[0].column, req.query.order[0].dir);

        let count = await User
            .find().countDocuments();

        let data = await User
            .find(
                {
                    $or: [
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { "$concat": ["$lastName", ", ", "$firstName"]},
                                    regex: req.query.search.value,  //Your text search here
                                    options: "i"
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { "$concat": ["$firstName", " ", "$lastName"]},
                                    regex: req.query.search.value,  //Your text search here
                                    options: "i"
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: "$idNum",
                                    regex: req.query.search.value,  //Your text search here
                                    options: "i"
                                }
                            }
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { "$concat": ["$lastName", " ", "$firstName"]},
                                    regex: req.query.search.value,  //Your text search here
                                    options: "i"
                                }
                            }
                        }
                    ]

                })
            .sort(sortObject)
            .skip(parseInt(req.query.start))
            .limit(parseInt(req.query.length)).lean();

        if (data && count) {
            data.forEach(user => user.contactNum = pad(user.contactNum))
            let datatable = {
                recordsTotal: count,
                recordsFiltered: count,
                data: data,
            }
            res.send(datatable);
        }
    } catch (err) {
        console.log(err);
        res.send({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        });
    }
}

/**
 * Renders and loads the User Profile page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.profile_details = async function (req, res) {
    try {
        let user = await User.findOne({ idNum: req.session.idNum }).lean();

        if (user) {
            user.contactNum = pad(user.contactNum);
            res.render('profile-page', {
                active: { active_profile: true },
                sidebarData: {
                    dp: req.session.passport.user.profile.photos[0].value,
                    name: req.session.passport.user.profile.displayName,
                    type: req.session.type
                },
                user: user
            });
        } else {
            console.log('profile: user cannot be accessed');
            res.redirect('/');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

/**
 * Updates the profile of a user.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.profile_update = async function (req, res) {
    try {
        var errors = validationResult(req);
        if (errors.isEmpty()) {
            var sameContactNum = await User.countDocuments(
                {contactNum: req.body.phone}).where('idNum').ne(req.body.idNum);
            if (sameContactNum == 0) {
                const filter = { idNum: req.body.idNum };
                const update = { contactNum: req.body.phone };
                await User.findOneAndUpdate(filter, update);
            }
        }
        res.redirect('/profile');
    } catch (err) {
        console.log(err);
    }
}

/**
 * Promotes a student user to studentRep type given the user's id.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.people_promote = async function (req, res) {
    try {
        await User.findByIdAndUpdate(
            { _id: req.body.userID },
            { type: 'studentRep' }
        );
    } catch (err) { 
        console.log(err);
    }
    res.redirect('/profile/manage');
}

/**
 * Demotes a studentRep user to student type given the user's id.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.people_demote = async function (req, res) {
    try {
        await User.findByIdAndUpdate(
            { _id: req.body.userID },
            { type: 'student' }
        );
    } catch (err) { 
        console.log(err);
    }
    res.redirect('/profile/manage');
}

/**
 * AJAX function for getting the count of studentRep users.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.count_studentrep_get = async function (req, res) {
    try {
        const studentRepCount = await User.find({
            type: "studentRep"
        }).countDocuments();
        res.send({count: studentRepCount});
    }
    catch (err) {
        console.log(err);
    }
}

/**
 * Determines the field to sort and the order.
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
        case '1':
            return {'idNum': dir};
        case '2':
            return {'lastName': dir};
        // case '3':
        //     return {'email': dir};
        // case '4':
        //     return {'degreeProg': dir};
        case '3':
            return {'college': dir};
        case '4':
            return {'type': dir};
        case '5':
            return {'contactNum': dir};
        default:
            return {'idNum': 1}
    }
}

/**
 * AJAX function for checking if a user with the same contact number and/or id number already exists.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.check_mobile_id_duplicate_get = async function (req, res) {
    try {
        const duplicateMobile = await User.find({
            _id: {$ne: req.query.userid},
            contactNum: req.query.mobile
        }).countDocuments();
        const duplicateID = await User.find({
            _id: {$ne: req.query.userid},
            idNum: req.query.idnumber
        }).countDocuments();
        res.send({duplicateMobile: duplicateMobile, duplicateID: duplicateID});
    }
    catch (err) {
        console.log(err);
    }
}

function pad(num) {
    let s = "0000000000" + num;
    return s.substr(-10);
}