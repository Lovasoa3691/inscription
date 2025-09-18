const express = require('express');

const { login, logout, inscription, getUtilisateur, verifieToken, verifieRefreshToken, CreateSuperAdmin, getAllUsers, disableAccountUser, deleteUser, CreateAdminGestion } = require('../controllers/AuthController');

const router = express.Router();


router.post('/login', login);

router.post('/logout', logout);

router.post('/inscription', inscription);

router.get('/utilisateur', verifieToken, getUtilisateur);

router.get('/utilisateur/all', verifieToken, getAllUsers);

router.put('/utilisateur/update/:id', verifieToken, disableAccountUser);

router.delete('/utilisateur/delete/:id', verifieToken, deleteUser);

router.post('/refresh-token', verifieRefreshToken);

router.post('/utilisateur/create-admin', CreateSuperAdmin);

router.post('/utilisateur/save', CreateAdminGestion);

module.exports = router;