const inscription = require('../models/inscription');
const paiement = require('../models/paiement');
const examen = require('../models/examen');
const etudiant = require('../models/etudiant');
const Utilisateurs = require('../models/utilisateurs');
const notification = require('../models/notification');
const notificationEtu = require('../models/notificationEtudiant');
const Counter = require('../models/counter');
const historique = require('../models/historique');
const { getNextSequenceValueHisto } = require('./historiqueController');
const notificationAdmin = require('../models/notificationAdmin');
const annee = require('../models/anneeUniversitaire');

async function CreerInscription(req, res) {
    try {
        const { etudiantId, idExamen, dateExam, descriptionAttendus } = req.body;

        if (!etudiantId || !idExamen || !dateExam || descriptionAttendus.length === 0) {
            return res.json({
                erreur: "Informations manquantes."
            });
        }
        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        const paiements = await paiement.find({ etudiantId: etudiantId, idAnnee: anneeActive.idAnnee });

        const paiementEffectues = paiements.flatMap(p => p.descriptionPaie);

        const paiementsManquantes = descriptionAttendus.filter(
            desc => !paiementEffectues.includes(desc)
        );

        const exmInfo = await examen.findOne({ idExam: idExamen });

        const seqNumber = await getNextSequenceValue('notificationId');
        const idNot = `NOT_${seqNumber.toString().padStart(2, '0')}`;

        if (paiementsManquantes.length === 0) {

            // const inscriptionExistant = await inscription.findOne({
            //     idExam: idExamen,
            // });

            // if (inscriptionExistant) {
            //     return res.json({
            //         message: "Desole! Vous etes deja inscrit a cet examen."
            //     })
            // }

            const incrip = new inscription({
                etudiantMatricule: etudiantId,
                idExam: idExamen,
                statutIns: 'Valide'
            });

            await incrip.save();

            const newNotification = new notification({
                idNot: idNot,
                titre: "Nouvel étudiant inscrit",
                objet: `L'étudiant portant le matricule ${etudiantId} est inscrit à l'examen ${exmInfo.matiere} 
                        de la session ${exmInfo.codeExam} 
                        qui débutera le ${exmInfo.dateExam}.`,
                dateEnvoi: new Date()
            })


            await newNotification.save();

            const newNotificationAdmin = new notificationAdmin({
                idAdmin: exmInfo.secretaireId,
                idNot: idNot,
                dateRecept: new Date()
            });

            await newNotificationAdmin.save();

            const sqHistoNum = await getNextSequenceValueHisto('histoId');
            const idHisto = `H_${sqHistoNum.toString().padStart(2, '0')}`;

            const newhistorique = new historique({
                etuMatricule: etudiantId,
                dateHisto: new Date(),
                idHisto: idHisto,
                motifHisto: `Inscription à l'examen "${exmInfo.matiere}" de la session "${exmInfo.codeExam}"`,
                statutHisto: "Valide"
            });

            await newhistorique.save();

            return res.json({
                succes: true,
                message: "Inscription Validé.",
            });
        }

        const incrip = new inscription({
            etudiantMatricule: etudiantId,
            idExam: idExamen,
            statutIns: 'En attente'
        });

        await incrip.save();

        const sqHistoNum = await getNextSequenceValueHisto('histoId');
        const idHisto = `H_${sqHistoNum.toString().padStart(2, '0')}`;

        const newhistorique = new historique({
            etuMatricule: etudiantId,
            dateHisto: new Date(),
            idHisto: idHisto,
            motifHisto: `Inscription à l'examen "${exmInfo.matiere}" de la session "${exmInfo.codeExam}"`,
            statutHisto: "En attente"
        });

        await newhistorique.save();

        const newNotification = new notification({
            idNot: idNot,
            titre: `Inscription à l'examen ${exmInfo.matiere}`,
            objet: `Votre inscription à l'examen ${exmInfo.matiere} 
                    de la session ${exmInfo.codeExam} 
                    est mise en attente en raison du fait que vous n'avez pas 
                    encore réglé les frais de formation suivants : ${paiementsManquantes.join(", ")}`,
        });


        await newNotification.save();

        const newNotificationEtu = new notificationEtu({
            etuMatricule: etudiantId,
            idNot: idNot,
            dateRecept: new Date()
        });

        await newNotificationEtu.save();

        return res.json({
            succes: false,
            message: "Votre paiement est incomplet. Votre inscription est mise en attente jusqu'à la régularisation.",
            raisons: [
                "Certains frais obligatoires n'ont pas encore été réglés.",
                "Le montant total requis n'a pas encore été atteint.",
                "Nous avons détecté des paiements partiels, mais ils ne couvrent pas tous les frais."
            ],
            paiementsManquantes
        });

    } catch (error) {
        console.log(error.message)
        res.json({
            message: 'Erreur de server'
        });
    }
}

async function getNextSequenceValue(seq) {
    const counter = await Counter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return counter.sequence_value
}

async function getInscriptionValideCount(req, res) {
    try {
        const { email } = req.user;

        const utilisateur = await Utilisateurs.findOne({ email: email });
        if (!utilisateur) {
            return res.json({ erreur: "Utilisateur non trouvé" });
        }

        const etu = await etudiant.findOne({ utilisateur: utilisateur._id });
        if (!etu) {
            return res.json({ erreur: "Étudiant non trouvé" });
        }

        const matriculeEtu = etu.matricule;
        const mention = etu.mention;
        const niveau = etu.niveau;

        const inscriptionsValide1 = await inscription.find({
            etudiantMatricule: matriculeEtu,
            statutIns: 'Valide',
        });

        if (inscriptionsValide1.length === 0) {
            return res.json({
                message: "Aucune inscription valide trouvée"
            });
        }

        const examIds = inscriptionsValide1.map(insc => insc.idExam);
        const classeValue = [`${mention} ${niveau}`]

        const InscriptionValide2 = await examen.find({
            idExam: { $in: examIds },
            classe: { $in: classeValue },
            statut: 'En cours'
        });

        const examEnCoursCount = await examen.find({
            classe: { $in: classeValue },
            statut: 'En cours'
        });

        return res.json({
            succes: true,
            examEnCoursCount: examEnCoursCount.length,
            nbInscriptionValide: InscriptionValide2.length,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur lors de la récupération des données",
            error: error.message
        });
    }
}


async function getInscriptionParEtudiant(req, res) {
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

        const inscriptions = await inscription.find({ etudiantMatricule: matriculeEtu, statutIns: 'Valide' });

        if (inscriptions.length === 0) {
            return res.json({
                message: "Aucun inscription trouve"
            })
        }

        const idExamens = inscriptions.map(inscription => inscription.idExam);

        const examens = await examen.find({ idExam: { $in: idExamens } });

        const resultats = examens.map(exam => {
            const inscriptionAssocie = inscriptions.find(ins => ins.idExam === exam.idExam);
            return {
                mon_examen: exam,
                mon_inscription: inscriptionAssocie
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


async function getAllInscriptionParEtudiant(req, res) {
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

        const inscriptions = await inscription.find({ etudiantMatricule: matriculeEtu });

        if (inscriptions.length === 0) {
            return res.json({
                message: "Aucun inscription trouve"
            })
        }

        const idExamens = inscriptions.map(inscription => inscription.idExam);

        const examens = await examen.find({ idExam: { $in: idExamens } });

        const resultats = examens.map(exam => {
            const inscriptionAssocie = inscriptions.find(ins => ins.idExam === exam.idExam);
            return {
                mon_examen: exam,
                mon_inscription: inscriptionAssocie
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


async function getInscription(req, res) {
    try {

        const { idExam } = req.params;

        const inscriptions = await inscription.find({ idExam: idExam, statutIns: 'Valide' });

        if (inscriptions.length === 0) {
            return res.json({
                message: "Aucun inscription trouve"
            })
        }

        const etudiantMat = inscriptions.map(inscription => inscription.etudiantMatricule);

        const etudiants = await etudiant.find({ matricule: { $in: etudiantMat } });

        const resultats = etudiants.map(etu => {
            return etu;
        });

        return res.json(resultats);

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Erreur lors de la recuperation de l'inscription"
        });
    }
}

async function getInscriptionEnCoursParEtudiant(req, res) {
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

        const inscriptions = await inscription.find({ etudiantMatricule: matriculeEtu, statutIns: 'Valide' });

        if (inscriptions.length === 0) {
            return res.json({
                message: "Aucun inscription trouve"
            })
        }

        const idExamens = inscriptions.map(inscription => inscription.idExam);

        const examens = await examen.find({ idExam: { $in: idExamens }, statut: 'En cours' }).limit(5);

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

        return res.json({ examenTries });

        // const resultats = examens.map(exam => {
        //     const inscriptionAssocie = inscriptions.find(ins => ins.idExam === exam.idExam);
        //     return {
        //         mon_examen: exam,
        //         mon_inscription: inscriptionAssocie
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

async function supprimerInscription(req, res) {
    try {
        const { idInscription } = req.params;
        // console.log(idInscription);

        if (!idInscription) {
            return res.json({
                message: "Identifiant de l'inscription manquant"
            })
        }

        const inscriptionSupprime = await inscription.findByIdAndDelete(idInscription);

        if (!inscriptionSupprime) {
            return res.json({
                message: "Inscription non trouve"
            });
        }

        return res.json({
            succes: "Inscription supprimé avec succès.", inscription: inscriptionSupprime
        });
    } catch (error) {
        return res.json({
            message: "Erreur lors de la suppression de l'inscription"
        });
    }
}

async function getAllInscriptions(req, res) {
    try {
        // const inscriptionsCount = await inscription.find({ statutIns: 'Valide' });

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        if (!anneeActive || anneeActive.length === 0) {
            return res.json({ message: "Aucune année universitaire active trouvée" });
        }

        const activeYearIds = anneeActive.idAnnee;


        const activeStudents = await etudiant.find({ idAnnee: activeYearIds });


        const activeExams = await examen.find({ idAnnee: activeYearIds });


        if (activeStudents.length === 0 || activeExams.length === 0) {
            return res.json({ inscriptionCount: 0 });
        }

        const activeStudentMatricules = activeStudents.map(student => student.matricule);
        const activeExamIds = activeExams.map(exam => exam.idExam);

        const inscriptionsCount = await inscription.distinct('etudiantMatricule',
            {
                statutIns: 'Valide',
                etudiantMatricule: { $in: activeStudentMatricules },
                idExam: { $in: activeExamIds }
            }
        );

        if (!inscriptionsCount) {
            return res.json({
                message: "Aucun etudiant inscrit"
            })
        }

        return res.json({
            inscriptionCount: inscriptionsCount.length
        })
    } catch (error) {
        console.log(error.message)
    }
}

async function getInscriptionEtudiantSpecifique(req, res) {
    const { email } = req.user;

    const utilisateur = await Utilisateurs.findOne({ email: email });
    if (!email) {
        return res.json({
            message: "Utilisateur pas trouve"
        })
    }

    const etu = utilisateur.id_ut;

    const anneeActive = await annee.findOne({ statutAnnee: 'Active' });

    const etuMatricule = await etudiant.findOne({ matricule: etu, idAnnee: anneeActive.idAnnee });

    // if (!etuMatricule) {
    //     console.log(etuMatricule);
    // }

    const inscriptions = await inscription.find({ etudiantMatricule: etuMatricule.matricule, statutIns: 'Valide' })

    const inscriptionsWithExams = await Promise.all(
        inscriptions.map(async (ins) => {
            // Récupérez tous les examens associés
            const exams = await examen.find({ idExam: { $in: ins.idExam }, statut: 'En cours' });
            // Stockez les examens dans un tableau
            ins.examDetails = exams;
            return { ...ins.toObject(), etuMatricule, examDetails: ins.examDetails };
        })
    );

    return res.json(inscriptionsWithExams)

}

module.exports = {
    CreerInscription,
    getInscriptionEnCoursParEtudiant,
    getInscriptionParEtudiant,
    getAllInscriptionParEtudiant,
    supprimerInscription,
    getInscriptionValideCount,
    getInscription,
    getAllInscriptions,
    getInscriptionEtudiantSpecifique
};