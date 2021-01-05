const mongoose = require('mongoose');

const rentalDatesSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    returnDate: { type: Date, required: true }
});

module.exports = mongoose.model('RentalDates', rentalDatesSchema);
