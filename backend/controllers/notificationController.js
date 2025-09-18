const etudiant = require('../models/etudiant');
const notificationEtu = require('../models/notificationEtudiant');
const notification = require('../models/notification');
const Utilisateurs = require('../models/utilisateurs');
const notificationAdmin = require('../models/notificationAdmin');


async function getAllNotification(req, res) {
    try {
        const { email } = req.user;

        const utilisateur = await Utilisateurs.findOne({ email: email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const etu = await etudiant.findOne({ utilisateur: utilisateur._id });

        if (!etu) {
            return res.json({
                erreur: "Etudiant non trouve"
            });
        }

        const matriculeEtu = etu.matricule;

        const notificat = await notificationEtu.find({ etuMatricule: matriculeEtu });

        if (notificat.length === 0) {
            return res.json({
                message: "Aucun notification trouve"
            })
        }

        const idNotification = notificat.map(notify => notify.idNot);

        const notifications = await notification.find({ idNot: { $in: idNotification } })
            .sort({ dateEnvoi: -1 });

        const resultats = notifications.map(not => {
            const notificationAssocie = notificat.find(notif => notif.idNot === not.idNot);
            return {
                ma_notification: notificationAssocie,
                notificationOriginal: not,
            };
        });

        return res.json(resultats);

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Erreur lors de la recuperation de l'inscription"
        });
    }
}

async function getAllNotificationAdmin(req, res) {
    try {
        const { email } = req.user;

        const utilisateur = await Utilisateurs.findOne({ email: email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const notificat = await notificationAdmin.find({ idAdmin: utilisateur.id_ut });

        if (notificat.length === 0) {
            return res.json({
                message: "Aucun notification trouve"
            })
        }

        const idNotification = notificat.map(notify => notify.idNot);

        const notifications = await notification.find({ idNot: { $in: idNotification } })
            .sort({ dateEnvoi: -1 });

        const resultats = notifications.map(not => {
            const notificationAssocie = notificat.find(notif => notif.idNot === not.idNot);
            return {
                ma_notification: notificationAssocie,
                notificationOriginal: not,
            };
        });

        return res.json(resultats);

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Erreur lors de la recuperation de l'inscription"
        });
    }
}

async function updateNotificationStatus(req, res) {
    const { idNot } = req.params;
    try {

        const notificationCible = await notificationEtu.findOneAndUpdate(
            { idNot: idNot },
            { statutNot: "lu" }
        );

        if (!notificationCible) {
            return res.json({
                succes: false,
                message: "Notification  non trouve"
            });
        }

        return res.json({
            succes: true,
        })
    } catch (error) {
        return res.json({
            succes: false,
            message: "Erreur de serveur"
        });
    }

}


async function updateNotificationStatusAdmin(req, res) {
    const { idNot } = req.params;
    try {

        const notificationCible = await notificationAdmin.findOneAndUpdate(
            { idNot: idNot },
            { statutNot: "lu" }
        );

        if (!notificationCible) {
            return res.json({
                succes: false,
                message: "Notification  non trouve"
            });
        }

        return res.json({
            succes: true,
        })
    } catch (error) {
        return res.json({
            succes: false,
            message: "Erreur de serveur"
        });
    }

}


async function supprimerNotification(req, res) {
    try {
        const { idNot } = req.params;

        if (!idNot) {
            return res.json({
                succes: false,
                message: "Identifiant manquant"
            })
        }

        const notSupprime = await notification.findOneAndDelete(idNot);
        const notEtuSupprime = await notificationEtu.findOneAndDelete(idNot);

        if (!notSupprime && !notEtuSupprime) {
            return res.json({
                succes: false,
                message: "Notification non trouve"
            });
        }

        return res.json({
            succes: true,
            message: "Notification supprime avec succes.",
            notify: notSupprime
        });
    } catch (error) {
        console.log(error.message);
        return res.json({
            succes: false,
            message: "Erreur lors de la suppression de l'inscription"
        });

    }
}

async function supprimerNotificationAdmin(req, res) {
    try {
        const { idNot } = req.params;

        if (!idNot) {
            return res.json({
                succes: false,
                message: "Identifiant manquant"
            })
        }

        const notSupprime = await notification.findOneAndDelete(idNot);
        const notEtuSupprime = await notificationAdmin.findOneAndDelete(idNot);

        if (!notSupprime && !notEtuSupprime) {
            return res.json({
                succes: false,
                message: "Notification non trouve"
            });
        }

        return res.json({
            succes: true,
            message: "Notification supprime avec succes.",
            notify: notSupprime
        });
    } catch (error) {
        console.log(error.message);
        return res.json({
            succes: false,
            message: "Erreur lors de la suppression de l'inscription"
        });

    }
}

async function getNotificationCount(req, res) {
    try {
        const { email } = req.user;

        const utilisateur = await Utilisateurs.findOne({ email: email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const etu = await etudiant.findOne({ utilisateur: utilisateur._id });

        if (!etu) {
            return res.json({
                erreur: "Etudiant non trouve"
            });
        }

        const matriculeEtu = etu.matricule;

        const notificat = await notificationEtu.find({ etuMatricule: matriculeEtu });

        if (notificat.length === 0) {
            return res.json({
                message: "Aucun notification trouve"
            })
        }

        const count = await notificationEtu.countDocuments({ etuMatricule: matriculeEtu, statutNot: 'Non lu' });


        return res.json({ count });

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Erreur lors de la recuperation de l'inscription"
        });
    }
}

async function getNotificationCountAdmin(req, res) {
    try {
        const { email } = req.user;

        const utilisateur = await Utilisateurs.findOne({ email: email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const notificat = await notificationAdmin.find({ idAdmin: utilisateur.id_ut, statutNot: 'Non lu' });

        if (notificat.length === 0) {
            return res.json({
                message: "Aucun notification trouve"
            })
        }

        const count = await notificationAdmin.countDocuments({ statutNot: 'Non lu' });

        const idNotification = notificat.map(notify => notify.idNot);

        const notifications = await notification.find({ idNot: { $in: idNotification } })
            .sort({ dateEnvoi: -1 });

        const resultats = notifications.map(not => {
            // const notificationAssocie = notificat.find(notif => notif.idNot === not.idNot);
            return not;
        });

        // const notificationDetail = await notification.find({ idNot: notificat.idNot });

        // if (notificationDetail.length === 0) {
        //     return res.json({
        //         message: "Aucun notification trouve"
        //     })
        // }

        return res.json(resultats);

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Erreur lors de la recuperation de l'inscription"
        });
    }
}

async function getNotificationRecent(req, res) {
    try {
        const { email } = req.user;

        const utilisateur = await Utilisateurs.findOne({ email: email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const etu = await etudiant.findOne({ utilisateur: utilisateur._id });

        if (!etu) {
            return res.json({
                erreur: "Etudiant non trouve"
            });
        }

        const matriculeEtu = etu.matricule;

        const notificat = await notificationEtu.find({ etuMatricule: matriculeEtu, statutNot: 'Non lu' })
            .sort({ dateRecept: -1 })
            .limit(5);

        if (notificat.length === 0) {
            return res.json({
                message: "Aucun notification trouve"
            })
        }

        const idNotification = notificat.map(notify => notify.idNot);

        const notifications = await notification.find({ idNot: { $in: idNotification } });
        // .sort({ dateEnvoi: -1 });

        const resultats = notifications.map(not => {
            const notificationAssocie = notificat.find(notif => notif.idNot === not.idNot);
            return {
                ma_notification: notificationAssocie,
                notificationOriginal: not,
            };
        });

        return res.json(resultats);

        // const resultats = await notificationEtu
        //     .find({ statutNot: 'Non lu' })
        //     .sort({ dateRecept: -1 })
        //     .limit(10);


        // const resultats = notifications.map(not => {
        //     const notificationAssocie = notificat.find(notif => notif.idNot === not.idNot);
        //     return {
        //         ma_notification: notificationAssocie,
        //         notificationOriginal: not,
        //     };
        // });

        // return res.json(resultats);

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Erreur lors de la recuperation de l'inscription"
        });
    }
}

module.exports = {
    getAllNotification,
    supprimerNotification,
    updateNotificationStatus,
    getNotificationCount,
    getNotificationRecent,
    getNotificationCountAdmin,
    getAllNotificationAdmin,
    updateNotificationStatusAdmin,
    supprimerNotificationAdmin
};