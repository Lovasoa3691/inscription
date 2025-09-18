const examen = require('../models/examen');
const etudiant = require('../models/etudiant');
const Utilisateurs = require('../models/utilisateurs');
const inscription = require('../models/inscription');
const examenCounter = require('../models/examenCounter');
const utilisateurs = require('../models/utilisateurs');
const notification = require('../models/notification');
const notificationEtu = require('../models/notificationEtudiant');
const nodemailer = require('nodemailer');
const counter = require('../models/counter');
const annee = require('../models/anneeUniversitaire');

async function getExamen(req, res) {

    const { email } = req.user;

    try {

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

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        const classe = new RegExp(`${etu.mention} ${etu.niveau}`, 'i');

        const examens = await examen.find({ classe: classe, statut: 'En cours', idAnnee: anneeActive.idAnnee });
        if (!examens) {
            return res.json({
                error: "Aucun information trouve"
            });
        }

        const examId = examens.map(id => id.idExam);

        const inscriptionAssocie = await inscription.find({ idExam: { $in: examId }, etudiantMatricule: etu.matricule });

        const examensAvecDates = examens.map(exam => {
            const examStart = new Date(exam.dateExam);
            const [heureDebutHeure, heureDebutMinute] = exam.heureDebut.split(':');
            const [heureFinHeure, heureFinMinute] = exam.heureFin.split(':');

            examStart.setHours(heureDebutHeure, heureDebutMinute);

            const examEnd = new Date(examStart);
            examEnd.setHours(heureFinHeure, heureFinMinute);

            exam.examStart = examStart;
            exam.examEnd = examEnd;

            return exam;
        });

        const examenTries = examensAvecDates.sort((a, b) => a.examStart - b.examStart);

        return res.json({ etu, examenTries, inscriptionAssocie });
    } catch (error) {
        return res.json({ erreur: "Erreur lors de la recuperation.", error });
    }

}


async function getExamEnCoursCount(req, res) {

    const { email } = req.user;

    try {

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

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        const examens = await examen.find({ statut: 'En cours', idAnnee: anneeActive.idAnnee });
        if (!examens) {
            return res.json({
                error: "Aucun information trouve"
            });
        }


        return res.json({ examCount: examens.length });
    } catch (error) {
        return res.json({ erreur: "Erreur lors de la recuperation." });
    }

}

async function getAllExamEnCoursCount(req, res) {

    const { email } = req.user;

    try {

        const utilisateur = await Utilisateurs.findOne({ email: email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        if (utilisateur.role === "Admin") {
            const examens = await examen.find({ statut: 'En cours', idAnnee: anneeActive.idAnnee });
            if (!examens) {
                return res.json({
                    error: "Aucun information trouve"
                });
            }

            const examensTermine = await examen.find({ statut: 'Termine', idAnnee: anneeActive.idAnnee });
            if (!examensTermine) {
                return res.json({
                    error: "Aucun information trouve"
                });
            }

            const examensAnnule = await examen.find({ statut: 'Annule', idAnnee: anneeActive.idAnnee });
            if (!examensAnnule) {
                return res.json({
                    error: "Aucun information trouve"
                });
            }

            return res.json({
                examCount: examens.length,
                examTermine: examensTermine.length,
                examAnnule: examensAnnule.length
            });
        }

        const examens = await examen.find({ secretaireId: utilisateur.id_ut, statut: 'En cours', idAnnee: anneeActive.idAnnee });
        if (!examens) {
            return res.json({
                error: "Aucun information trouve"
            });
        }

        const examensTermine = await examen.find({ secretaireId: utilisateur.id_ut, statut: 'Termine', idAnnee: anneeActive.idAnnee });
        if (!examensTermine) {
            return res.json({
                error: "Aucun information trouve"
            });
        }

        const examensAnnule = await examen.find({ secretaireId: utilisateur.id_ut, statut: 'Annule', idAnnee: anneeActive.idAnnee });
        if (!examensAnnule) {
            return res.json({
                error: "Aucun information trouve"
            });
        }

        return res.json({
            examCount: examens.length,
            examTermine: examensTermine.length,
            examAnnule: examensAnnule.length
        });
    } catch (error) {
        return res.json({ erreur: "Erreur lors de la recuperation." });
    }

}


async function getAllExamEnCours(req, res) {

    const { email } = req.user;

    try {

        const utilisateur = await Utilisateurs.findOne({ email: email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' });

        if (utilisateur.role === "Admin") {
            const examens = await examen.find({ statut: 'En cours', idAnnee: anneeActive.idAnnee }).limit(6);
            if (!examens) {
                return res.json({
                    error: "Aucun information trouve"
                });
            }

            const resultats = await Promise.all(
                examens.map(async (examen) => {
                    const inscriptions = await inscription.find({ idExam: { $in: examen.idExam }, statutIns: 'Valide' });

                    const matriculeEtu = inscriptions.map(mat => mat.etudiantMatricule);

                    const infoEtudiant = await etudiant.find({ matricule: { $in: matriculeEtu } });

                    return {
                        examen,
                        infoEtudiant
                    };
                })
            )

            return res.json(resultats);
        }

        const examens = await examen.find({ secretaireId: utilisateur.id_ut, statut: 'En cours', idAnnee: anneeActive.idAnnee }).limit(6);
        if (!examens) {
            return res.json({
                error: "Aucun information trouve"
            });
        }

        const resultats = await Promise.all(
            examens.map(async (examen) => {
                const inscriptions = await inscription.find({ idExam: { $in: examen.idExam }, statutIns: 'Valide' });

                const matriculeEtu = inscriptions.map(mat => mat.etudiantMatricule);

                const infoEtudiant = await etudiant.find({ matricule: { $in: matriculeEtu } });

                return {
                    examen,
                    infoEtudiant
                };
            })
        )

        return res.json(resultats);

        // const idExamens = examens.map(exam => exam.idExam);

        // const inscriptions = await inscription.find({ idExam: { $in: idExamens } });

        // const matriculeEtu = inscriptions.map(mat => mat.etudiantMatricule);

        // const infoEtudiant = await etudiant.find({ matricule: { $in: matriculeEtu } });

        // const resultats = examens.map(exam => {
        //     const inscriptionAssocie = inscriptions.find(ins => ins.idExam === exam.idExam);
        //     return {
        //         mon_examen: exam,
        //         mon_inscription: inscriptionAssocie
        //     };
        // });


        // return res.json({ examens: examens, infoEtudiant });
    } catch (error) {
        return res.json({ erreur: "Erreur lors de la recuperation." });
    }

}


async function mettreAjourStatutExam(req, res) {
    try {
        const now = new Date();

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        const exams = await examen.find({ dateExam: { $gte: new Date().setHours(0, 0, 0, 0) }, idAnnee: anneeActive.idAnnee });

        const AJour = await Promise.all(
            exams.map(async (exam) => {
                const examStart = new Date(exam.dateExam);
                examStart.setHours(exam.heureDebut.split(':')[0], exam.heureFin.split(':')[1]);

                const examEnd = new Date(exam.dateExam);
                examEnd.setHours(exam.heureDebut.split(':')[0], exam.heureFin.split(':')[1]);

                if (now > examEnd) {
                    return await examen.findOneAndUpdate(
                        { idExam: exam.idExam },
                        { statut: 'Termine' }
                    );
                }
                return exam;
            })
        );

        return res.json({
            succes: true,
            examMiseAJour: AJour
        });
    } catch (error) {
        return res.json({
            succes: false,
            erreur: error.message
        });
    }
}

async function getNextSequenceValueExamen(seq) {
    const counter = await examenCounter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return counter.sequence_value
}

async function getAllExamens(req, res) {
    const { email } = req.user;

    try {
        const utilisateur = await utilisateurs.findOne({ email });

        if (!utilisateur) {
            return res.json({
                erreur: "Utilisateur non trouve"
            });
        }

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' });
        const idAnnee = anneeActive.idAnnee;

        if (utilisateur.role === "Admin") {
            const examens = await examen.find({ idAnnee: idAnnee }).sort({ dateExam: -1 });
            if (!examens) {
                return res.json({
                    error: "Aucun information trouve"
                });
            }

            return res.json({
                examens
            });
        }

        const examens = await examen.find({ secretaireId: utilisateur.id_ut, idAnnee: idAnnee }).sort({ dateExam: -1 });
        if (!examens) {
            return res.json({
                error: "Aucun information trouve"
            });
        }

        return res.json({
            examens
        });

    } catch (error) {
        return res.json({
            message: error.message
        })
    }
}

async function getNextSequenceValue(seq) {
    const Counters = await counter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return Counters.sequence_value
}


async function CreerExamen(req, res) {

    try {

        const { email } = req.user;
        const { codeExam, dateExam, heureDebut, heureFin, matiere, duree, classe, salleExam } = req.body;

        if (!codeExam || !dateExam || !heureDebut || !heureFin || !matiere || !duree || !classe || !salleExam) {
            return res.json({
                succes: false,
                message: "Informations manquantes"
            })
        }

        if (!email) {
            return res.json(
                {
                    succes: false,
                    message: "Utilisateur non trouve"
                }
            )
        }

        const utilisateur = await utilisateurs.findOne({ email });
        if (!utilisateur) {
            return res.json(
                {
                    succes: false,
                    message: "Utilisateur non trouve"
                }
            )
        }

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        const idAdmin = utilisateur.id_ut;
        // const hDeb = new Date(`2000-01-01T${heureDebut}:00Z`);
        // const hFin = new Date(`2000-01-01T${heureFin}:00Z`);

        // const verifieConflit = await examen.findOne({
        //     salleExam,
        //     dateExam,
        //     $or: [
        //         {
        //             $and: [
        //                 { heureDebut: { $lte: heureFin } },
        //                 { heureFin: { $gte: heureDebut } }
        //             ]
        //         }
        //     ]
        // });

        // if (verifieConflit) {
        //     return res.json({
        //         succes: false,
        //         message: "Chevauchement detecte: Un autre examen existe deja sur cette plage d'horaire"
        //     })
        // }

        const seqNumber = await getNextSequenceValueExamen('examId');
        const idExam = `EX_${seqNumber.toString().padStart(2, '00')}`;

        const newExam = new examen({
            idExam,
            codeExam,
            dateExam,
            heureDebut,
            heureFin,
            matiere,
            classe,
            salleExam,
            duree,
            secretaireId: idAdmin,
            idAnnee: anneeActive.idAnnee
        })
        await newExam.save();


        const mentionsNiveaux = classe.map(cls => {
            const [mention, niveau] = cls.split(' ');
            return { mention, niveau };
        })

        const etudiantsList = await Promise.all(
            mentionsNiveaux.map(async ({ mention, niveau }) => {
                return await etudiant.find({ mention, niveau, idAnnee: anneeActive.idAnnee });
            })
        )

        const allEtudiants = etudiantsList.flat();

        const matricules = allEtudiants.map(etudiant => etudiant.matricule);

        const inscriptions = await inscription.find({ etudiantMatricule: { $in: matricules } });

        const matriculesInscrites = inscriptions.map(incs => incs.etudiantMatricule);

        const users = await Utilisateurs.find({ id_ut: { $in: matriculesInscrites } });

        const etuMatricule = users.map(user => (user.id_ut));
        const etuMail = users.map(user => (user.email));

        console.log(etuMail)

        // Envoi notification par mail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'lovaniainasarahandrianarisoa@gmail.com',
                pass: 'xsgh bsrp xukf klti'
            }
        });

        // if (etuMatricule.length === 0) {
        //     return res.json({
        //         message: "Etudiant Inconnu"
        //     })
        // }

        // Envoi notification via systeme
        const seqNumberNot = await getNextSequenceValue('notificationId');
        const idNot = `NOT_${seqNumberNot.toString().padStart(2, '0')}`;

        const newNotification = new notification({
            idNot: idNot,
            titre: `Nouvel examen disponible !`,
            objet: `Chers étudiants,\n
            Un nouvel examen supplémentaire vient d'être ajouté.
            Ne manquez pas cette opportunité ! \n
            Les inscriptions sont ouvertes pour une durée limitée.
            Consultez votre espace << session d'examen disponible >> pour plus de détails.`,
            dateEnvoi: new Date()
        });

        await newNotification.save();

        const idNotFinal = newNotification.idNot;

        for (const matriculeEtudiant of etuMatricule) {
            const newNotificationEtu = new notificationEtu({
                etuMatricule: matriculeEtudiant,
                idNot: idNotFinal,
                dateRecept: new Date()
            });
            await newNotificationEtu.save();
        }



        // setTimeout(async () => {
        // for (const email of etuMail) {
        //     try {
        //         await transporter.sendMail({
        //             from: '"Institut de Formation Technique" <lovaniainasarahandrianarisoa@gmail.com>',
        //             to: email,
        //             subject: "Préparez-vous pour de nouveaux examens.",
        //             text: `Chers étudiants,
        //         De nouvelles sessions d'examen ont été ouvertes ! 
        //         C'est l'occasion idéale de démontrer vos compétences et de valider vos acquis. 
        //         Consultez votre espace étudiant dès maintenant pour plus de détails.`,
        //         });

        //         await Promise.all()
        //         return res.json({
        //             mail: true,
        //             message: "Notification envoié !"
        //         })
        //     } catch (error) {
        //         return res.json({
        //             mail: false,
        //             message: "Impossible d'envoyer l'email, problème de connexion"
        //         })
        //     }
        // }
        var mail = false;

        try {
            const emailPromises = etuMail.map(email =>
                transporter.sendMail({
                    from: '"Institut de Formation Technique" <lovaniainasarahandrianarisoa@gmail.com>',
                    to: email,
                    subject: "Préparez-vous pour de nouveaux examens.",
                    text: `Chers étudiants,
                        De nouvelles sessions d'examen ont été ouvertes ! 
                        C'est l'occasion idéale de démontrer vos compétences et de valider vos acquis. 
                        Consultez votre espace étudiant dès maintenant pour plus de détails.`,
                })
            );

            // Attendre l'envoi de tous les emails
            await Promise.all(emailPromises);

            console.log("succes")
            return res.json({
                mail: true,
                succes: true,
                message: "Examen ajouté avec succès"
            });
            // return res.json({
            //     mail: true,
            //     // message: "Notification envoié !"
            // });
        } catch (error) {
            console.log("erreur")
            return res.json({
                mail: false,
                succes: true,
                message: "Examen ajouté avec succès"
            });
            // return res.json({
            //     mail: false,
            //     // message: "Impossible d'envoyer l'email, problème de connexion !"
            // });
        }
        // }, 2000);


        // return res.json({
        //     succes: true,
        //     message: "Examen ajouté avec succès"
        // });

    } catch (error) {
        console.log(error.message)
        return res.json({
            message: "Erreur du serveur"
        });
    }
}

async function supprimeExamen(req, res) {

    try {
        const { idExam } = req.params;

        if (!idExam) {
            return res.json({
                message: "Examen non trouve"
            })
        }

        const examenCible = await examen.findOneAndDelete({ idExam: idExam });
        const inscriptionCible = await inscription.deleteMany({ idExam: idExam });

        if (!examenCible || !inscriptionCible) {
            return res.json({
                message: "Examen non trouve"
            })
        }

        return res.json({
            succes: true,
            message: "Examen supprimé avec succès"
        })
    } catch (error) {
        console.log(error.message)
        return res.json({
            succes: false,
            message: "Erreur lors de la suppression d'examen"
        })
    }
}

async function annuleExamen(req, res) {

    try {
        const { idExam } = req.params;

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        if (!idExam) {
            return res.json({
                message: "Examen non trouvé"
            })
        }

        const examenCible = await examen.findOneAndUpdate(
            { idExam: idExam, idAnnee: anneeActive.idAnnee },
            { $set: { statut: "Annule" } }
        );


        if (!examenCible) {
            return res.json({
                message: "Examen non trouvé"
            })
        }

        const mentionsNiveaux = examenCible.classe.map(cls => {
            const [mention, niveau] = cls.split(' ');
            return { mention, niveau };
        })

        const etudiantsList = await Promise.all(
            mentionsNiveaux.map(async ({ mention, niveau }) => {
                return await etudiant.find({ mention, niveau, idAnnee: anneeActive.idAnnee });
            })
        )

        const allEtudiants = etudiantsList.flat();

        const matricules = allEtudiants.map(etudiant => etudiant.matricule);

        const inscriptions = await inscription.find({ etudiantMatricule: { $in: matricules } });

        const matriculesInscrites = inscriptions.map(incs => incs.etudiantMatricule);

        const users = await Utilisateurs.find({ id_ut: { $in: matriculesInscrites } });

        const etuMatricule = users.map(user => (user.id_ut));
        const etuMail = users.map(user => (user.email));

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'lovaniainasarahandrianarisoa@gmail.com',
                pass: 'xsgh bsrp xukf klti'
            }
        });

        const seqNumberNot = await getNextSequenceValue('notificationId');
        const idNot = `NOT_${seqNumberNot.toString().padStart(2, '0')}`;

        const newNotification = new notification({
            idNot: idNot,
            titre: `Annulation d'examen`,
            objet: `Chers étudiants,\n
                    Nous regrettons de vous informer que la session d'examen prévue a été annulée.
                    Veuillez consulter votre espace pour plus d'informations concernant cette annulation et les démarches à suivre.\n
                    Nous vous présentons nos excuses pour la gêne occasionnée et vous tiendrons informés des prochaines sessions disponibles.`,
            dateEnvoi: new Date()
        });

        await newNotification.save();

        const idNotFinal = newNotification.idNot;

        for (const matriculeEtudiant of etuMatricule) {
            const newNotificationEtu = new notificationEtu({
                etuMatricule: matriculeEtudiant,
                idNot: idNotFinal,
                dateRecept: new Date()
            });
            await newNotificationEtu.save();
        }

        var mail = false;

        // setTimeout(async () => {
        try {
            const emailPromises = etuMail.map(email =>
                transporter.sendMail({
                    from: '"Institut de Formation Technique" <lovaniainasarahandrianarisoa@gmail.com>',
                    to: email,
                    subject: "Annulation d'examen.",
                    text: `Chers étudiants,\n
                                Nous regrettons de vous informer que la session d'examen prévue a été annulée.
                                Veuillez consulter votre espace pour plus d'informations concernant cette annulation et les démarches à suivre.\n
                                Nous vous présentons nos excuses pour la gêne occasionnée et vous tiendrons informés des prochaines sessions disponibles.`,
                })
            );

            // Attendre l'envoi de tous les emails
            await Promise.all(emailPromises);
            mail = true;

            console.log("succes")
            return res.json({
                succes: true,
                mail: mail,
                message: "Examen est annulé !"
            })
        } catch (error) {
            mail = false;
            console.log("erreur")
            return res.json({
                succes: true,
                mail: mail,
                message: "Examen est annulé !"
            });
        }
        // }, 2000);


        // return res.json({
        //     succes: true,
        //     mail: mail,
        //     message: "Examen est annulé !"
        // })
    } catch (error) {
        console.log(error.message)
        return res.json({
            succes: false,
            message: "Erreur lors de l'annulation de l'examen"
        })
    }
}

async function getExamenCount(req, res) {
    try {

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        const examCount = await examen.find({ idAnnee: anneeActive.idAnnee });

        return res.json({ examCount: examCount.length });
    } catch (error) {

    }
}


module.exports = {
    getExamen,
    getAllExamens,
    mettreAjourStatutExam,
    getExamEnCoursCount,
    CreerExamen,
    supprimeExamen,
    getExamenCount,
    getAllExamEnCoursCount,
    getAllExamEnCours,
    annuleExamen
};

