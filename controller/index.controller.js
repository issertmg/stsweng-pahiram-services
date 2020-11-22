const User = require('../model/user.model');
const passport = require('passport');
const hbs = require('hbs');

const { validationResult } = require('express-validator');

/**
 * Helper that checks if the user is a student representative
 */
hbs.registerHelper('isAdmin', (type) => {
    return type === 'studentRep';
});

/**
 * Loads and renders the homepage
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 */
exports.home = function (req, res) {
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

/**
 * Loads and renders the terms page
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 */
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

/**
 * Loads and renders the about page
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 */
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

/**
 * Signs the user in using passport, Google OAuth 2.0
 */
exports.signin = passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'],
    hostedDomain: 'dlsu.edu.ph'
});

/**
 * Sets up passport to handle callbacks
 */
exports.callback = passport.authenticate('google', {
    failureRedirect: '/login'
});

/**
 * Passport callback when the user has successfully logged in via Google account
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>}
 */
exports.callback_success = async function (req, res) {
    req.session.token = req.user.token;

    try {
        let user = await User.findOneAndUpdate(
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

/**
 * Determines if the user has already registered. If not, the user is redirected to the register page.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.register_get = async function (req, res) {
    const colleges = User.schema.path('college').enumValues;

    try {
        let user = await User.findOne({ email: req.session.passport.user.profile.emails[0].value });
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

/**
 * Adds a new user object and saves it in the database.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>} - nothing
 */
exports.register_post = async function (req, res) {

    try {
        var errors = validationResult(req);
        let colleges = User.schema.path('college').enumValues;

        if (errors.isEmpty()) {
            const sameIDNum = await User.countDocuments({idNum: req.body.idNum});
            const sameContactNum = await User.countDocuments({ contactNum: req.body.phone });
            if (sameIDNum === 0 && sameContactNum === 0) {
                const count = await User.countDocuments();
                let user = new User({
                    firstName: req.session.passport.user.profile.name.givenName,
                    lastName: req.session.passport.user.profile.name.familyName,
                    email: req.session.passport.user.profile.emails[0].value,
                    idNum: req.body.idNum,
                    college: User.schema.path('college').enumValues[req.body.college],
                    degreeProg: req.body.degProg,
                    contactNum: req.body.phone,
                    type: (count === 0 ? 'studentRep' : 'student'),
                    dpURL: req.session.passport.user.profile.photos[0].value
                });

                user = await user.save();

                req.session.idNum = user.idNum;
                req.session.type = user.type;

                res.redirect('/');
            } else {
                let errorLabels = {};
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

            let errorLabels = {};
            for (let i = 0; i < errors.length; i++)
                errorLabels[errors[i].param + 'Error'] = errors[i].msg;

            res.render('register', {
                errLabels: errorLabels,
                colleges: colleges,
                email: req.session.passport.user.profile.emails[0].value
            });
        }

    } catch (err) {
        console.log('Error registering: ' + err);
        res.redirect('/');
    }
};

/**
 * Logs the user in the web app.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 */
exports.login = function (req, res) {
    if (req.session.token)
        res.redirect('/');
    else
        res.render('login-page');
};

/**
 * Logs the user out of the web app.
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 */
exports.logout = function (req, res) {
    req.logout();
    req.session = null;
    res.redirect('/');
};

/**
 * Gets the user associated with the ID number and sends it as an HTTP response object
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>}
 */
exports.id_get = async function (req, res) {
    try {
        let user = await User.findOne({ idNum: req.query.idNum });
        res.send(user);
    } catch (err) {
        console.log(err);
    }
}

/**
 * Gets the user associated with the phone number and sends it as an HTTP response object
 * @param req - the HTTP request object
 * @param res - the HTTP response object
 * @returns {Promise<void>}
 */
exports.phone_get = async function (req, res) {
    try {
        let phone;
        if (req.query.idNum)
            phone = await User.findOne({ contactNum: req.query.phone }).where('idNum').ne(req.query.idNum);
        else
            phone = await User.findOne({ contactNum: req.query.phone });

        res.send(phone);
    } catch (err) {
        console.log(err);
    }
}