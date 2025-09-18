const examen = require('../models/examen');
const paiement = require('../models/paiement');
const etudiant = require('../models/etudiant');
const paiementCounter = require('../models/paiementCounter');
const annee = require('../models/anneeUniversitaire');
const moment = require('moment');
const inscription = require('../models/inscription');
const InscriptionUpdate = require('../models/inscription');
const axios = require('axios');
const { urlencoded } = require('body-parser');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const notification = require('../models/notification');
const counter = require('../models/counter');
const notificationEtu = require('../models/notificationEtudiant');


async function verifierPaiement(req, res) {
    try {
        const { etuId, examId } = req.body;

        if (!etuId || !examId) {
            return res.json({
                erreur: "Etudiant et examsn sont requis"
            });
        }

        const exam = await examen.findOne({ idExam: examId });

        if (!exam) {
            return res.json({
                erreur: "Examen non trouve"
            });
        }

        const dateExam = new Date(exam.dateExam);
        const moisExam = dateExam.getMonth();
        const anneeExam = dateExam.getFullYear();


        // Recuperation des paiements de l'etudiant pour tout les mois de l'examen
        const paiemnts = await paiement.find({
            etudiantId: etuId,
            $or: [
                { annee: { $lt: anneeExam } },
                { annee: anneeExam, mois: { $lte: moisExam + 1 } },
            ]
        });

        // Veifiction des mois payes
        const moisPayes = paiemnts.map(p => `${p.mois}-${p.annee}`);
        const moisrequis = [];
        for (let i = moisExam; i >= 0; i--) {
            moisrequis.push(`${new Date(anneeExam, i).toLocaleString('fr', { month: 'long' })}-${anneeExam}`);
        }

        const paiementsManquantes = moisrequis.filter(m => !moisPayes.incluides(m));

        if (paiementsManquantes.length > 0) {
            return res.json({
                erreur: "Paiements incomplets",
                paiementsManquantes
            })
        }

        re.json({
            succes: "Paiement satisfait"
        })
    } catch (error) {
        res.json({
            message: 'Erreur de server'
        });

    }
}


async function verifierPaiementEtudiant(req, res) {
    try {
        const anneeActive = await annee.findOne({ statutAnnee: 'Active' });
        if (!anneeActive) {
            return res.status(404).json({ error: "Aucune année active trouvée" });
        }

        const examens = await examen.find({ statut: 'En cours', idAnnee: anneeActive.idAnnee });
        if (!examens.length) {
            return res.json({ error: "Aucun examen trouvé" });
        }

        const examIdList = examens.map(exam => exam.idExam);
        const inscriptions = await inscription.find({ idExam: { $in: examIdList }, statutIns: 'En attente' });

        if (!inscriptions.length) {
            return res.json({ message: "Aucune inscription en attente" });
        }

        const result = [];
        const today = moment().startOf('day');

        for (const insc of inscriptions) {
            const exam = examens.find(e => e.idExam === insc.idExam);
            if (!exam) continue;

            // Déterminer les frais attendus
            const fraisAttendus = ["S1", "S3", "S5", "S7"].includes(exam.codeExam)
                ? ["FF1", "FF2", "FF3", "FF4"]
                : ["FF5", "FF6", "FF7", "FF8"];

            // Utiliser distinct() pour récupérer les frais payés par l'étudiant
            const descriptionsPaiement = await paiement.distinct("descriptionPaie", { etudiantId: insc.etudiantMatricule });

            if (descriptionsPaiement.length > 0) {
                // Vérifier si tous les frais attendus sont couverts
                const fraisCouverts = fraisAttendus.every(frais => descriptionsPaiement.includes(frais));

                if (fraisCouverts) {
                    // Vérifier si l'examen est dans 3 jours ou moins
                    result.push({ etudiant: insc.etudiantMatricule, statut: "Accepté" });
                } else {
                    const dateExam = moment(exam.dateExam, 'YYYY-MM-DD');
                    const diffJours = dateExam.diff(today, 'days');

                    if (diffJours <= 3) {
                        await inscription.findOneAndUpdate({ etudiantMatricule: insc.etudiantMatricule }, { statutIns: 'Rejeté' });
                        // result.push({
                        //     etudiant: insc.etudiantMatricule,
                        //     statut: "Rejeté",
                        //     raison: `L'examen est dans ${diffJours} jour(s), inscription annulée malgré le paiement complet`
                        // });

                        result.push({
                            etudiant: insc.etudiantMatricule,
                            statut: "Rejeté",
                            raison: "Frais de formation non entièrement couverts"
                        });

                        // Envoyer une notification (ajouter ici la logique d'envoi)
                        console.log(`Notification envoyée à l'étudiant ${insc.etudiantMatricule} pour rejet d'inscription`);

                    } else {
                        // Inscription acceptée car frais couverts ET examen pas trop proche
                        result.push({ etudiant: insc.etudiantMatricule, statut: "Accepté" });
                    }

                }
            } else {
                result.push({ etudiant: insc.etudiantMatricule, statut: "Rejeté", raison: "Aucun paiement trouvé" });
            }
        }

        return res.json(result);
    } catch (error) {
        console.error("Erreur lors de la vérification des paiements :", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

async function getNextSequenceValue(seq) {
    const count = await counter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return count.sequence_value
}


async function verifierPaiements(req, res) {
    const anneeActive = await annee.findOne({ statutAnnee: 'Active' });
    if (!anneeActive) {
        return res.status(404).json({ error: "Aucune année active trouvée" });
    }

    const examens = await examen.find({ statut: 'En cours', idAnnee: anneeActive.idAnnee });
    if (!examens.length) {
        return res.json({ error: "Aucun examen trouvé" });
    }

    const examIdList = examens.map(exam => exam.idExam);
    const inscriptions = await inscription.find({ idExam: { $in: examIdList }, statutIns: 'En attente' });

    if (!inscriptions.length) {
        return res.json({ message: "Aucune inscription en attente" });
    }

    // Accumuler les erreurs de paiements manquants
    const paiementsManquantsParEtudiant = [];

    // Parcourir chaque inscription et vérifier les paiements
    for (let inscription of inscriptions) {
        const etudiantId = inscription.etudiantMatricule;  // ID de l'étudiant
        const examId = inscription.idExam;  // ID de l'examen

        // 1. Récupérer les informations de l'étudiant
        const etudiants = await etudiant.findOne({ matricule: etudiantId });

        // 2. Récupérer l'examen associé à l'inscription
        const examens = await examen.findOne({ idExam: examId });  // Utilisation de l'ID de l'examen

        const paiements = await paiement.find({
            etudiantId: etudiants.matricule,
            idAnnee: anneeActive.idAnnee
        });

        // 6. Extraire toutes les descriptions de paiement effectuées
        const paiementEffectues = paiements.flatMap(p => p.descriptionPaie);

        let descriptionAttendus = [];

        // // Vérification des paiements en fonction du codeExam
        if (['S1', 'S3', 'S5', 'S7'].includes(examens.codeExam)) {
            descriptionAttendus = ['FF1', 'FF2', 'FF3', 'FF4'];  // Paiements attendus pour S1, S3, S5, S7
        }
        if (['S2', 'S4', 'S6', 'S8'].includes(examens.codeExam)) {
            descriptionAttendus = ['FF5', 'FF6', 'FF7', 'FF8'];  // Paiements attendus pour les autres examens
        }

        // // 8. Vérifier si toutes les descriptions de paiement attendues ont été effectuées
        const paiementsManquants = descriptionAttendus.filter(desc => !paiementEffectues.includes(desc));

        if (paiementsManquants.length === 0) {

            const updated = await InscriptionUpdate.findOneAndUpdate(
                { etudiantMatricule: etudiants.matricule, statutIns: 'En attente' },
                { $set: { statutIns: 'Valide' } }
            )

            if (updated) {

                const seqNumber = await getNextSequenceValue("notificationId");
                const idNot = `NOT_${seqNumber.toString().padStart(2, "0")}`;

                const newNotification = new notification({
                    idNot: idNot,
                    titre: `Confirmation d'inscription à l'examen "${examens.matiere}"`,
                    objet: `Félicitations ! Votre inscription à l'examen ${examens.matiere} 
            de la session ${examens.codeExam} a été validée avec succès. 
            Vous pouvez maintenant vous préparer sereinement à votre épreuve.`,
                    etudiantMatricule: etudiants.matricule,
                    dateEnvoi: new Date(),
                    statut: "Non lu"
                });

                await newNotification.save();


                await newNotification.save();

                const newNotificationEtu = new notificationEtu({
                    etuMatricule: etudiantId,
                    idNot: idNot,
                    dateRecept: new Date()
                });

                await newNotificationEtu.save();
            }

            // const inscr = await InscriptionUpdate.find({ etudiantMatricule: etudiants.matricule, statutIns: 'En attente' });

            // console.log("Reultat : ", inscr)

        } else {
            paiementsManquantsParEtudiant.push({
                etudiant: etudiants.matricule,
                paiementsManquants,
                message: "Paiements manquants, inscription non validée"
            });
        }


        // const updatedInsc = await InscriptionUpdate.findOneAndUpdate(
        //     { etudiantMatricule: etudiants.matricule, idExam: examens.idExam },
        //     { $set: { statutIns: 'Valide' } },
        //     { returnDocument: 'after' }
        // );

        // if (updatedInsc) {
        //     paiementsManquantsParEtudiant.push({
        //         etudiant: etudiants.matricule,
        //         codeExam: examens.codeExam,
        //         paiementsManquants: [],
        //         message: "Inscription mise à jour avec succès"
        //     });

        //     // Envoi de notification
        // } else {
        //     paiementsManquantsParEtudiant.push({
        //         etudiant: etudiants.matricule,
        //         paiementsManquants: [],
        //         message: "Aucune inscription trouvée pour la mise à jour"
        //     });
        // }

    }

    if (paiementsManquantsParEtudiant.length > 0) {
        return res.json({
            message: "Des paiements sont manquants pour certains étudiants.",
            paiementsManquantsParEtudiant
        });
    }

    return res.json({
        message: "Tous les paiements sont vérifiés et complets pour les inscriptions en attente.",
        paiementsManquantsParEtudiant,
    });
}



async function getNextSequenceValuePaiement(seq) {
    const counter = await paiementCounter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return counter.sequence_value
}

async function getDistictPaiement(req, res) {

    // const descriptionsPaie = await paiement.distinct('descriptionPaie', { etudiantId: paieEtu.etudiantId })

    const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

    const paiemntsEtu = await paiement.find({ idAnnee: anneeActive.idAnnee })

    const paiements = await paiement.distinct('descriptionPaie', { etudiantId: 'E1151', idAnnee: anneeActive.idAnnee })


    return res.json({ paiements })

    // const result = {}

    // for (const paieEtu of paiemntsEtu){
    //     const descriptionsPaie = await paiement.distinct('descriptionPaie', { etudiantId: paieEtu.etudiantId })

    //     result[paieEtu.etudiantId] = descriptionsPaie
    // }

    // return res.json(result)
}

async function getAllPaiement(req, res) {

    const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

    const paiements = await paiement.find({ idAnnee: anneeActive.idAnnee })

    return res.json({
        paiements
    })
}

async function CreerPaiement(req, res) {
    const { etudiantId, descriptionPaie, montant, } = req.body;

    const etudniantsCible = await etudiant.findOne({ matricule: etudiantId });
    const niveauEtu = etudniantsCible.niveau;
    let FFMontant = 0;

    switch (niveauEtu) {
        case "L1": FFMontant = 50000
            break;
        case "L2": FFMontant = 70000
            break;
        case "L3": FFMontant = 80000
            break;
        case "M1": FFMontant = 100000
            break;
        default: FFMontant = 130000
            break;
    }

    const montantPaye = FFMontant * descriptionPaie.length;

    const statutPaie = montant < montantPaye ? "En cours" : "Complet";


    const sqNumber = await getNextSequenceValuePaiement("paiementId");
    const idPaie = `P_${sqNumber.toString().padStart(2, '0')}`;

    const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

    const newPaiement = new paiement({
        idPaie: idPaie,
        typePaie: 'Frais de formation',
        etudiantId: etudiantId,
        descriptionPaie: descriptionPaie,
        montant: montant,
        modePaie: 'Espece',
        statutPaie: statutPaie,
        datePaie: new Date(),
        idAnnee: anneeActive.idAnnee
    })

    await newPaiement.save();

    return res.json({
        message: "Paiement a ete faite"
    })
}

const MVOLA_BASE_URL = "https://devapi.mvola.mg";
const MVOLA_CONSUMER_KEY = 'oKsm31p2sk2cUGGRe0jVKD7IHEEa';
const MVOLA_CONSUMER_SECRET = 'vM5R3Q13eHQArVmWT3EkYyWQgFUa';

async function getToken(req, res) {

    try {
        const rep = await axios.post(
            `${MVOLA_BASE_URL}/token`,
            null,
            // urlencoded: {
            //     grant_type: "client_credentials",
            //     scope: "EXT_INT_MVOLA_SCOPE"
            // },
            new URLSearchParams({
                grant_type: "client_credentials",
                scope: "EXT_INT_MVOLA_SCOPE"
            }),
            {
                headers: {
                    // 'Authorization': `Bearer eyJ4NXQiOiJOMkpqTWpOaU0yRXhZalJrTnpaalptWTFZVEF4Tm1GbE5qZzRPV1UxWVdRMll6YzFObVk1TlEiLCJraWQiOiJNREpsTmpJeE4yRTFPR1psT0dWbU1HUXhPVEZsTXpCbU5tRmpaalEwWTJZd09HWTBOMkkwWXpFNFl6WmpOalJoWW1SbU1tUTBPRGRpTkRoak1HRXdNQV9SUzI1NiIsInR5cCI6ImF0K2p3dCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJqdWxpYW5ub3Q5QGdtYWlsLmNvbSIsImF1dCI6IkFQUExJQ0FUSU9OIiwiYXVkIjoib0tzbTMxcDJzazJjVUdHUmUwalZLRDdJSEVFYSIsIm5iZiI6MTczODg1NTE4MiwiYXpwIjoib0tzbTMxcDJzazJjVUdHUmUwalZLRDdJSEVFYSIsInNjb3BlIjoiRVhUX0lOVF9NVk9MQV9TQ09QRSIsImlzcyI6Imh0dHBzOlwvXC9kZXZlbG9wZXIubXZvbGEubWdcL29hdXRoMlwvdG9rZW4iLCJyZWFsbSI6eyJzaWduaW5nX3RlbmFudCI6ImNhcmJvbi5zdXBlciJ9LCJleHAiOjE3Mzg4NTg3ODIsImlhdCI6MTczODg1NTE4MiwianRpIjoiZTkwMzBmMzgtMTU5Ny00NTcwLTgyZTItN2NhZThmOGMwMmQ2In0.WFVd3Y7OlN6ex7RC14TLklkK25167I-uEyuGzSzoAxHPuStc18c85BbBCJhL_8xCsu-86lyb7x2zpQnXdakhSA7k13ihcQrp_E8EO3wX7XZ2djcudb4pbmumULSnMDUZ5qsFOxzqeusvj9hEKW2JPomLZCpJ0OoN0lTFzcDayopY0dhXtC1pUNGREfShgwGt4TulazB6Sa7onBqOTK8MSnZeKvi9juRPNd-01vsMy8mpCsL-q5HJqnj4xKyjPlnP6e5d56qjVJ9lj_4UHvrsRVlI1fVI3TMi9MUP1U_mqI9yTOpRUU2D2-lDhp-9Tf-swvipOWsn-e8f6Nok3C1XhQ`,
                    'Authorization': `Basic ${Buffer.from(`${MVOLA_CONSUMER_KEY}:${MVOLA_CONSUMER_SECRET}`).toString('base64')}`,
                    // 'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 'Content-Type': 'application/json',
                    // 'Cache-Control': 'no-cache'
                }
            }
        )
        console.log(process.env.MVOLA_CONSUMER_KEY)

        res.json(rep.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || "Erreur de connexion à MVola" });
    }
}

async function initPaiement(req, res) {

    try {
        const { amount, phoneNumber, token } = req.body;


        const transactionId = `TXN_${Date.now()}`; // ID unique pour la transaction
        const payload = {
            amount,
            currency: "Ar",
            description: "Paiement Mobile Money",
            creditParty: [{ key: "MSISDN", value: phoneNumber }],
            requestDate: new Date().toISOString(),
            transactionId
        };

        const response = await axios.post(
            `${MVOLA_BASE_URL}/mvola/mm/transactions/type/merchantpay/1.0.0/`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Correlation-ID': transactionId,
                    'Version': '1.0'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || "Erreur de paiement MVola" });
    }
}


async function createPaiementStripe(req, res) {
    try {
        const { amount, currency } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Montant en centimes (ex: 1000 = 10.00€)
            currency
        });

        return res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function deletePaiement(req, res) {
    try {
        const { id } = req.params;

        const deletedPaie = await paiement.deleteMany({ etudiantId: id });
        if (!deletedPaie) {
            return res.json({ message: "Aucun information trouvé" })
        }

        return res.json({ message: "Information supprime avec succes" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function sendFile(req, res) {
    try {
        // console.log("Fichier reçu :", req.file); // Ajout pour déboguer
        // console.log("Email reçu :", req.body.email); // Vérifier l'email

        if (!req.file || !req.body.email) {
            return res.status(400).json({ message: "Fichier ou email manquant" });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'lovaniainasarahandrianarisoa@gmail.com',
                pass: 'xsgh bsrp xukf klti'
            }
        });

        const recipientEmail = req.body.email;
        const filePath = path.join(__dirname, '..', 'middleware', 'uploads', req.file.filename);

        const mailOptions = {
            from: '"Institut de Formation Technique" <lovaniainasarahandrianarisoa@gmail.com>',
            to: recipientEmail,
            subject: "Votre reçu de paiement",
            text: "Bonjour, \n\nVeuillez trouver ci-joint votre reçu de paiement.",
            attachments: [{ filename: req.file.filename, path: filePath }]
        };

        await transporter.sendMail(mailOptions);
        fs.unlinkSync(filePath);

        return res.json({ message: "Reçu envoié avec succès !" });
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de l'envoi du mail", error: error.message });
    }
}


async function getPaiementEtudiant(req, res) {
    const { id } = req.params;

    console.log(id)

    const descriptionsPaiement = await paiement.distinct("descriptionPaie", { etudiantId: id });

    if (!descriptionsPaiement) {
        return res.json({ message: "Aucun paiement pour cet etudiant" })
    }

    return res.json(descriptionsPaiement)
}

module.exports = {
    getDistictPaiement,
    getAllPaiement,
    CreerPaiement,
    verifierPaiement,
    verifierPaiementEtudiant,
    verifierPaiements,
    initPaiement,
    getToken,
    createPaiementStripe,
    sendFile,
    deletePaiement,
    getPaiementEtudiant,
    getNextSequenceValue
}

