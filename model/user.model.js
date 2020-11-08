const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {type: String, required: true },
    idNum: { type: String, required: true },
    college: {
        type: String, required: true,
        enum: [
            'College of Education',
            'College of Computer Studies',
            'College of Liberal Arts',
            'College of Science',
            'College of Engineering',
            'College of Business',
            'School of Economics']
    },
    degreeProg: { type: String, required: true },
    contactNum: { type: Number, required: true },
    type: { type: String, default: 'student', enum: ['student', 'studentRep'] },
    dpURL: { type: String, default: '../static/profile-img.jpg'}
});

module.exports = mongoose.model('User', userSchema);