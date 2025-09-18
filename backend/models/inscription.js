const mongoose = require('mongoose');

const InscriptionSchema = new mongoose.Schema({
    etudiantMatricule: { type: String },
    idExam: { type: String },
    dateInsc: { type: Date, default: Date.now },
    statutIns: { type: String }
});

const inscription = mongoose.model('inscriptions', InscriptionSchema);

module.exports = inscription;