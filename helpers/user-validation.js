
module.exports.userIsLoggedIn = function(req, res, next) {
    if (req.session.token)
        next();
    else
        res.redirect('/login');
}

module.exports.userIsNew = async function(req, res, next) {
    const User = require('../model/user.model');

    try {
        var user = await User.findOne({'email': req.session.passport.user.profile.emails[0].value});
        if (user)
            next();
        else
            res.redirect('/register');
    } catch(err) {
        console.log(err);
        res.redirect('/');
    }
}

module.exports.userIsAdmin = async function(req, res, next) {
    if (req.session.type == 'studentRep')
        next();
    else
        res.redirect('/404');

    /* const User = require('../model/user.model');

    try {
        var user = await User.findOne({'email': req.session.passport.user.profile.emails[0].value});
        if (user && user.type == 'studentRep')
            next();
        else
            res.redirect('/404');
    } catch(err) {
        console.log(err);
        res.redirect('/404');
    } */
}