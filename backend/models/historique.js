const mongoose = require('mongoose');

const HistoriqueSchema = new mongoose.Schema({
    idHisto: { type: String, required: true, unique: true },
    dateHisto: { type: Date, required: true },
    motifHisto: { type: String, required: true },
    statutHisto: { type: String, required: true },
    etuMatricule: { type: String, required: true },
});

const historique = mongoose.model('historiques', HistoriqueSchema);


module.exports = historique;