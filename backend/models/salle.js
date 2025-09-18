
const mongoose = require('mongoose');

const SalleSchema = new mongoose.Schema({
    idSalle: { type: String, required: true, unique: true },
    numSalle: { type: String, required: true, unique: true },
    capacite: { type: Number, required: true },
    localisation: { type: String, required: true },
    idAnnee: { type: String, reuired: true },
});


const salle = mongoose.model('salles', SalleSchema);


module.exports = salle;