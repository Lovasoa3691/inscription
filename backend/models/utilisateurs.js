
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const utilisateurSchema = new mongoose.Schema({
    id_ut: { type: String, default: uuidv4, unique: true },
    nom_ut: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    mdp: { type: String, required: true },
    role: { type: String, required: true },
    statut_ut: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Utilisateurs", utilisateurSchema);