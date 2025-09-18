const express = require('express');

const { getExamen,
    mettreAjourStatutExam,
    getExamEnCoursCount,
    getAllExamens,
    supprimeExamen,
    CreerExamen,
    getExamenCount,
    getAllExamEnCoursCount,
    getAllExamEnCours,
    annuleExamen } = require('../controllers/ExamenController');

const { authentificate, verifieToken } = require('../controllers/AuthController')

const { CreerInscription,
    getInscriptionParEtudiant,
    supprimerInscription,
    getInscriptionEnCoursParEtudiant,
    getInscriptionValideCount,
    getInscription,
    getAllInscriptions,
    getInscriptionEtudiantSpecifique,
    getAllInscriptionParEtudiant } = require('../controllers/InscriptionController')

const router = express.Router();

// router.use(verifieToken);

router.get('/examens', verifieToken, getExamen);

router.get('/examens/all/count', verifieToken, getExamenCount);

router.get('/examens/encours/count', verifieToken, getAllExamEnCoursCount);

router.get('/examens/encours', verifieToken, getAllExamEnCours);

router.post('/examens/save', verifieToken, CreerExamen)

router.get('/examens/all', verifieToken, getAllExamens);

router.get('/examen/count', verifieToken, getInscriptionValideCount);

router.get('/prochaineExam', verifieToken, getInscriptionEnCoursParEtudiant);

router.get('/updateExamStatus', mettreAjourStatutExam);

// router.get('/inscriptions/count', verifieToken, getInscriptionValideCount);

router.post('/inscrire', CreerInscription);

router.get('/inscriptions/:idExam', getInscription);

router.get('/inscriptions', verifieToken, getInscriptionParEtudiant);

router.get('/inscriptions/all/etudiant', verifieToken, getAllInscriptionParEtudiant);

router.get('/inscriptions/etudiants/all', verifieToken, getAllInscriptions);

router.delete('/inscription/:idInscription', supprimerInscription);

router.delete('/examens/delete/:idExam', supprimeExamen);

router.put('/examens/update/statut/:idExam', annuleExamen);

router.get('/inscriptions/etudiants/info', verifieToken, getInscriptionEtudiantSpecifique);

// router.get('/utilisateur', getUtilisateur);

module.exports = router;