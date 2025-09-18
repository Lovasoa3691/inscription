const mongoose = require('mongoose');

const AdministrateurSchema = new mongoose.Schema({
    idAdmin: { type: String, reuired: true },
    nomAdmin: { type: String, reuqired: true },
    prenomAdmin: { type: String, required: true },
});

const administrateur = mongoose.model('administrateur', AdministrateurSchema);

module.exports = administrateur;