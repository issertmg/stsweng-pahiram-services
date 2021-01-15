const Book = require('../model/book.model');

exports.book = async function (req, res) {
    try {
        res.render('book-form', {
            active: { active_index: true },
            sidebarData: {
                dp: req.session.passport.user.profile.photos[0].value,
                name: req.session.passport.user.profile.displayName,
                type: req.session.type
            }
        });
    } catch (err) {
        console.log(err);
    }
}