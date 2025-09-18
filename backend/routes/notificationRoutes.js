const express = require('express');

const { getAllNotification,
    supprimerNotification,
    updateNotificationStatus,
    getNotificationCount,
    getNotificationRecent,
    getNotificationCountAdmin,
    getAllNotificationAdmin,
    supprimerNotificationAdmin,
    updateNotificationStatusAdmin
} = require('../controllers/notificationController');
const { verifieToken } = require('../controllers/AuthController')


const router = express.Router();

router.get('/notifications', verifieToken, getAllNotification);

router.get('/notifications/admin', verifieToken, getAllNotificationAdmin);

router.put('/notificationEtu/:idNot', updateNotificationStatus);

router.delete('/notification/:idNot', supprimerNotification);

router.put('/notification/admin/:idNot', updateNotificationStatusAdmin);

router.delete('/notification/admin/:idNot', supprimerNotificationAdmin);

router.get('/notification/count', verifieToken, getNotificationCount);

router.get('/notification/admin/count', verifieToken, getNotificationCountAdmin);

router.get('/notification/recents', verifieToken, getNotificationRecent);

module.exports = router;