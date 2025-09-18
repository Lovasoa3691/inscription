
const mongoose = require('mongoose');

const PaiementSchema = new mongoose.Schema({
    idPaie: { type: String, required: true, unique: true },
    montant: { type: String, required: true },
    typePaie: { type: String, required: true },
    descriptionPaie: [{ type: String, required: true }],
    datePaie: { type: Date, required: true },
    statutPaie: { type: String, required: true },
    modePaie: { type: String, required: true },
    etudiantId: { type: String, required: true },
    idAnnee: { type: String, reuired: true },
});

const paiement = mongoose.model('paiements', PaiementSchema);


module.exports = paiement;