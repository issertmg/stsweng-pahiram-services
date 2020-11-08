const User = require('../model/user.model');
const passport = require('passport');
const hbs = require('hbs');

const { validationResult } = require('express-validator');

hbs.registerHelper('isAdmin', (type) => {
    return type == 'studentRep';
});

exports.home = function (req, res) {

    console.log('home');

    /* var reservation = new Reservation({
        userID: 11826401,
        reservationType: 'locker',
        status: 'Pending',
        Description: 'This is a description.',
        Remarks: 'This is remarkable.'
    });
    await reservation.save().catch(err => {
        console.log('Error writing to db');
    }); // TODO: test using CREATE method instead */

    res.cookie('token', req.session.token);
    res.render('index', {
        active: { active_index: true }, // indicates which page is active in the nav partial.
        sidebarData: {
            dp: req.session.passport.user.profile.photos[0].value,
            name: req.session.passport.user.profile.displayName,
            type: req.session.type
        }
    });
};

exports.terms = function (req, res) {
    res.render('terms-page', {
        active: { active_terms: true },
        sidebarData: {
            dp: req.session.passport.user.profile.photos[0].value,
            name: req.session.passport.user.profile.displayName,
            type: req.session.type
        }
    });
};

exports.about = function (req, res) {
    res.render('about-us-page', {
        active: { active_about_us: true },
        sidebarData: {
            dp: req.session.passport.user.profile.photos[0].value,
            name: req.session.passport.user.profile.displayName,
            type: req.session.type
        }
    });
}

exports.signin = passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'],
    hostedDomain: 'dlsu.edu.ph'
});

exports.callback = passport.authenticate('google', {
    failureRedirect: '/login'
});

exports.callback_success = async function (req, res) {
    req.session.token = req.user.token;

    try {
        var user = await User.findOneAndUpdate(
            { email: req.session.passport.user.profile.emails[0].value },
            { dpURL: req.session.passport.user.profile.photos[0].value });
        if (user) {
            req.session.idNum = user.idNum;
            req.session.type = user.type;
        }
        else
            console.log('user cannot be accessed');
    } catch (err) {
        console.log(err);
    }

    res.redirect('/');
};

exports.register_get = async function (req, res) {
    var colleges = User.schema.path('college').enumValues;

    console.log(req.session.passport.user.profile.photos[0].value);

    try {
        var user = await User.findOne({ email: req.session.passport.user.profile.emails[0].value });
        if (user == null) {
            res.render('register', {
                colleges: colleges,
                email: req.session.passport.user.profile.emails[0].value
            });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.log(err);
    }
};

exports.register_post = async function (req, res) {

    try {
        var errors = validationResult(req);
        var colleges = User.schema.path('college').enumValues;

        if (errors.isEmpty()) {
            var sameIDNum = await User.countDocuments({ idNum: req.body.idNum });
            var sameContactNum = await User.countDocuments({ contactNum: req.body.phone });
            if (sameIDNum == 0 && sameContactNum == 0) {
                var count = await User.countDocuments();
                var user = new User({
                    firstName: req.session.passport.user.profile.name.givenName,
                    lastName: req.session.passport.user.profile.name.familyName,
                    email: req.session.passport.user.profile.emails[0].value,
                    idNum: req.body.idNum,
                    college: User.schema.path('college').enumValues[req.body.college],
                    degreeProg: req.body.degProg,
                    contactNum: req.body.phone,
                    type: (count == 0 ? 'studentRep' : 'student'),
                    dpURL: req.session.passport.user.profile.photos[0].value
                });

                var user = await user.save();

                req.session.idNum = user.idNum;
                req.session.type = user.type;

                res.redirect('/');
            } else {
                var errorLabels = {};
                if (sameIDNum > 0)
                    errorLabels['idNumError'] = 'ID number already taken.'
                if (sameContactNum > 0)
                    errorLabels['phoneError'] = 'Phone number already taken.'
                res.render('register', {
                    errLabels: errorLabels,
                    colleges: colleges,
                    email: req.session.passport.user.profile.emails[0].value
                });
            }
        } else {
            errors = errors.errors;

            var errorLabels = {};
            for (i = 0; i < errors.length; i++)
                errorLabels[errors[i].param + 'Error'] = errors[i].msg;

            res.render('register', {
                errLabels: errorLabels,
                colleges: colleges,
                email: req.session.passport.user.profile.emails[0].value
            });
        }

    } catch (err) {
        console.log('Error writing to db: ' + err);
        res.redirect('/');
    }
};

exports.login = function (req, res) {
    if (req.session.token)
        res.redirect('/');
    else
        res.render('login-page');
};

exports.logout = function (req, res) {
    req.logout();
    req.session = null;
    res.redirect('/');
};

exports.id_get = async function (req, res) {
    try {
        var user = await User.findOne({ idNum: req.query.idNum });
        res.send(user);
    } catch (err) {
        console.log(err);
    }
}

exports.phone_get = async function (req, res) {
    try {
        var phone;
        if (req.query.idNum)
            phone = await User.findOne({ contactNum: req.query.phone }).where('idNum').ne(req.query.idNum);
        else
            phone = await User.findOne({ contactNum: req.query.phone });

        res.send(phone);
    } catch (err) {
        console.log(err);
    }
}