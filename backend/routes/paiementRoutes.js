const express = require('express')
const { verifieToken } = require('../controllers/AuthController');
const { CreerPaiement, getAllPaiement, createPaiementStripe, getDistictPaiement, verifierPaiementEtudiant, verifierPaiements, getToken, initPaiement, sendFile, deletePaiement, getPaiementEtudiant } = require('../controllers/PaiementController');
const upload = require('../middleware/uploadMiddleware');


const router = express.Router();

router.get('/paiements', verifieToken, getAllPaiement);

router.get('/paiements/distinct', verifieToken, getDistictPaiement);

router.get('/paiements/verification', verifieToken, verifierPaiementEtudiant);

router.get('/paiements/etudiant/:id', verifieToken, getPaiementEtudiant);

router.post('/paiements/save', CreerPaiement);

router.put('/paiements/en-attente/verification', verifieToken, verifierPaiements);

router.post('/mvola/token', verifieToken, getToken);

router.post('/mvola/payment', verifieToken, initPaiement);

router.post('/stripe/payment', createPaiementStripe);

router.delete('/paiement/delete/:id', deletePaiement);

router.post('/paiement/recu', upload.single('file'), sendFile);

// router.delete('/salles/delete/:idSalle', supprimerSalle);

// router.put('/salles/update/:idSalle', modifierSalle);


module.exports = router;