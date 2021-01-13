const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    authors: [{ type: String, required: true }],
    edition: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    onRent: { type: Number, default: 0 }
}, { collation: { locale: 'en_US', strength: 1 } });

module.exports = mongoose.model('Book', bookSchema);
