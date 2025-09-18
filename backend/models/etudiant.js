
const mongoose = require('mongoose');

const EtudiantSchema = new mongoose.Schema({
    matricule: { type: String, required: true, unique: true },
    nomEtu: { type: String, required: true },
    prenomEtu: { type: String, required: true },
    adresseEtu: { type: String, required: true },
    contactEtu: { type: String, required: true },
    mention: { type: String, required: true },
    niveau: { type: String, required: true },
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateurs' },
    SecreataireId: { type: String, required: true },
    idAnnee: { type: String, reuired: true },
}, { timestamps: true });

const etudiant = mongoose.model('etudiants', EtudiantSchema);


module.exports = etudiant;