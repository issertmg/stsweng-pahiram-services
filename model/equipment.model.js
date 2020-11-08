const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    onRent: { type: Number, default: 0 },
    imageURL: { type: String, required: true }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
