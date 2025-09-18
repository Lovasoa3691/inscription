const mongoose = require('mongoose');

const AnneeSchema = new mongoose.Schema({
    idAnnee: { type: String, reuired: true },
    annee: { type: String, reuqired: true },
    statutAnnee: { type: String, required: true, default: 'Inactive' },
    idSAdmin: { type: String, required: true },
});

const annee = mongoose.model('anneeUniversitaire', AnneeSchema);

module.exports = annee;