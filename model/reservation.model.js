const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    title: String,
    userID: { type: String, required: true },
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'onItemType' },
    dateCreated: { type: Date, default: Date.now() },
    status: {
        type: String,
        enum: [
            'Pending',
            'For Pickup',
            'To Pay',
            'On Rent',
            'Denied',
            'Uncleared',
            'Returned'
        ]
    },
    description: String,
    remarks: { type: String, default: '' },
    penalty: { type: Number, default: 0 },
    onItemType: {
        type: String,
        required: true,
        enum: ['Book', 'Equipment', 'Locker']
    },
    lastUpdated: { type: Date, default: Date.now() },
    pickupPayDate: { type: Date, default: null }
});

module.exports = mongoose.model('Reservation', reservationSchema);