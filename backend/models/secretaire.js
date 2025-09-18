const mongoose = require('mongoose');

const SecretaireSchema = new mongoose.Schema({
    idSec: { type: String, reuired: true },
    nomSec: { type: String, reuqired: true },
    prenomSec: { type: String, required: true },
});

const secretaire = mongoose.model('secretaire', SecretaireSchema);

module.exports = secretaire;