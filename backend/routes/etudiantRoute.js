const express = require('express');
const etudiant = require('../models/etudiant');
const { AjouterEtudiant, supprimerEtudiant, mettreAjourEtudiant, getAllEtudiant, getEtudiantCount, updateAllStudent } = require('../controllers/EtudiantController');
const { verifieToken } = require('../controllers/AuthController');
const annee = require('../models/anneeUniversitaire');

const router = express.Router();

router.post('/etudiants/save', verifieToken, AjouterEtudiant);

router.delete('/etudiants/delete/:matricule', supprimerEtudiant);

router.put('/etudiants/update/:matricule', mettreAjourEtudiant);

router.put('/etudiants/all', updateAllStudent);

router.get('/etudiants', verifieToken, getAllEtudiant);

router.get('/etudiants/count-by-mention', getEtudiantCount);

router.get('/etudiants/count', async (req, res) => {
    try {
        const anneeActive = await annee.findOne({ statutAnnee: 'Active' });

        if (!anneeActive) {
            return res.json({ message: "Aucune année académique active trouvée." });
        }
        const countEtu = await etudiant.countDocuments({ idAnnee: anneeActive.idAnnee });
        res.json(countEtu);
    } catch (error) {
        res.json({ message: 'Erreur lors de la recuperation des donnees', error });
    }
})

module.exports = router;