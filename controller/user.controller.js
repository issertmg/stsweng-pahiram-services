const User = require('../model/user.model');

const { validationResult } = require('express-validator');

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

exports.people_update = async function (req, res) {

    try {
        await User.findByIdAndUpdate(
            req.body.id,
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                idNum: req.body.idNum,
                college: req.body.college,
                degreeProg: req.body.degProg,
                contactNum: req.body.mobile
            }
        );

    } catch (err) {
        console.log(err);
    }

    res.redirect('/profile/manage');
}

exports.people_get = async function (req, res) {
    try {
        const itemsPerPage = 10;

        var people = new Object();

        people.totalCt = await User
            .find({ idNum: { $regex: '[0-9]*' + req.query.idnum + '[0-9]*' } })
            .countDocuments();

        people.items = await User
            .find({ idNum: { $regex: '[0-9]*' + req.query.idnum + '[0-9]*' } })
            .sort('lastname')
            .skip((req.query.page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        if (people)
            res.send(people);

    } catch (err) {
        console.log(err);
    }
}

exports.profile_details = async function (req, res) {
    try {
        var user = await User.findOne({ idNum: req.session.idNum });
        if (user) {
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