const mongoose = require('mongoose');

const lockerSchema = new mongoose.Schema({
    number: { type: Number, required: true},
    status: {
        type: String,
        required: true,
        enum: ['vacant', 'occupied', 'broken', 'uncleared']
    }
});

module.exports = mongoose.model('Locker', lockerSchema);