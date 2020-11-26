const path = require('path');
const express = require('express');
const hbs = require('hbs');
const mongoose = require('mongoose');
const port = 3000;
const app = express();

require('dotenv').config()

// Handlebars
app.set('view engine', 'hbs');

// Express static files
app.use(express.static(path.join(__dirname, 'public')));

// BodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Google OAuth
const passport = require('passport');
const auth = require('./auth');

// Cookies and session
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

// Passport for Google oauth
auth(passport);
app.use(passport.initialize());

// Cookies and sessions
app.use(cookieSession({
    name: 'session',
    keys: ['123']
}));
app.use(cookieParser());

// My middleware
const UserAuth = require('./helpers/user-validation');

// Routes
const index = require('./routes/index.routes');
const profile = require('./routes/user.routes');
const reserve = require('./routes/reserve.routes');
const myReservations = require('./routes/reservations.routes');
const panel = require('./routes/panel.routes');
const equipment = require('./routes/equipment.routes');

// Connecting to the db
mongoose.connect('mongodb://rootuser:p%40ssword@pahiram-shard-00-00-eypip.mongodb.net:27017,pahiram-shard-00-01-eypip.mongodb.net:27017,pahiram-shard-00-02-eypip.mongodb.net:27017/test?ssl=true&replicaSet=pahiram-shard-0&authSource=admin&retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }).catch(err => {
    console.log('Error connecting to the db: ' + err);
});

hbs.registerPartials(__dirname + '/views/partials');

app.use('/', index);
app.use('/profile', UserAuth.userIsLoggedIn, UserAuth.userIsNew, profile);
app.use('/reserve', UserAuth.userIsLoggedIn, UserAuth.userIsNew, reserve);
app.use('/reservations', UserAuth.userIsLoggedIn, UserAuth.userIsNew, myReservations);
app.use('/manage-lockers', UserAuth.userIsLoggedIn, UserAuth.userIsNew, panel);
app.use('/manage-equipment', UserAuth.userIsLoggedIn, UserAuth.userIsNew, equipment);

app.use(function(req, res, next) {
    res.status(404).render('404-page', {
        sidebarData: {
            dp: req.session.passport.user.profile.photos[0].value,
            name: req.session.passport.user.profile.displayName,
            type: req.session.type
        }
    });
})

app.listen(process.env.PORT || port, function() {
    console.log('Google Auth Callback URL: ' + process.env.GOOGLE_AUTH_CALLBACK_URL)
    console.log('Listening at port ' + port);
});