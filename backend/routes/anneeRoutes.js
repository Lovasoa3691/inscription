const express = require('express');
const { verifieToken } = require('../controllers/AuthController');
const { getAllAnnee, CreerAnnee, activerAnnee, getActiveAnnee, updateAllEntity } = require('../controllers/AnneeController');

const router = express.Router();


router.get('/annee/all', verifieToken, getAllAnnee);

router.get('/annee/active', getActiveAnnee);

router.post('/annee/save', verifieToken, CreerAnnee);

router.put('/annee/active/:idAnnee', activerAnnee);

router.put('/all/update/:idAnnee', updateAllEntity);

module.exports = router;