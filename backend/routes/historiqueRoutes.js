const express = require('express');

const { verifieToken } = require('../controllers/AuthController');
const { getHistoriqueEtudiant, CreerHistorique, supprimerHistorique } = require('../controllers/historiqueController');


const router = express.Router();


router.get('/historiques', verifieToken, getHistoriqueEtudiant);
router.post('/historique/save', CreerHistorique);
router.delete('/historique/:idHisto', supprimerHistorique);

module.exports = router;