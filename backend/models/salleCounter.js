const mongoose = require('mongoose');

const SallecounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model('salleCounter', SallecounterSchema);
