const express = require('express');
const { getAllSalle, AjouterSalle, supprimerSalle, modifierSalle } = require('../controllers/SalleController');
const { verifieToken } = require('../controllers/AuthController');

const router = express.Router();

router.get('/salles', verifieToken, getAllSalle);

router.post('/salles/save', AjouterSalle);

router.delete('/salles/delete/:idSalle', supprimerSalle);

router.put('/salles/update/:idSalle', modifierSalle);


module.exports = router;