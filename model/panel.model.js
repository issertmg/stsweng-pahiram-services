const mongoose = require('mongoose');
const locker = require('./locker.model');

const panelSchema = new mongoose.Schema({
    number: {type: Number, required: true},
    type: { type: String, required: true, enum: ['big', 'small'] },
    building: { type: String, required: true, trim: true },
    level: { type: Number, min: 1, max: 50, required: true, trim: true },
    lockers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Locker'}],
    lowerRange: { type: Number, required: true},
    upperRange: { type: Number, required: true}
});

module.exports = mongoose.model('Panel', panelSchema);
