const historique = require("../models/historique");
const etudiant = require('../models/etudiant');
const Utilisateurs = require('../models/utilisateurs');
const histo_counter = require("../models/histo_counter");

async function getNextSequenceValueHisto(seq) {
    const counter = await histo_counter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return counter.sequence_value
}


async function CreerHistorique(req, res) {
    try {

        // console.log('Donnees recus: ', req.body);
        // const { etudiantId, idExamen, dateExam } = req.body;

        // if (!etudiantId || !idExamen || !dateExam) {
        //     return res.json({
        //         erreur: "Informations manquantes."
        //     });
        // }

        const seqNumber = await getNextSequenceValue('notificationId');
        const idHisto = `H_${seqNumber.toString().padStart(2, '0')}`;

        const newHistorique = new historique({
            idHisto: idHisto,
            etuMatricule: "E1151",
            dateHisto: new Date(),
            motifHisto: `Inscription a l'examen JAVA IHM de la session EXAM.S5`,
            statutHisto: "Valide",
        })

        await newHistorique.save();

        res.json({
            succes: true,
            message: "Historique cree avec succes"
        });

    } catch (error) {
        console.log(error)
        res.json({
            message: 'Erreur de server'
        });

    }
}


async function getHistoriqueEtudiant(req, res) {
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

        const histo = await historique.find({ etuMatricule: matriculeEtu });

        if (histo.length === 0) {
            return res.json({
                message: "Aucun historique trouve"
            })
        }

        return res.json({ succes: true, histo });

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Erreur lors de la recuperation de l'inscription"
        });
    }
}

async function supprimerHistorique(req, res) {
    try {
        const { idHisto } = req.params;

        // console.log(idHisto);

        if (!idHisto) {
            return res.json({
                succes: false,
                message: "Identifiant de l'historique manquant"
            })
        }

        const histoSupprime = await historique.findOneAndDelete(idHisto);

        if (!histoSupprime) {
            return res.json({
                succes: false,
                message: "Historique non trouve"
            });
        }

        return res.json({
            succes: true,
            message: "Historique supprime avec succes."
        });
    } catch (error) {
        return res.json({
            succes: false,
            message: "Erreur lors de la suppression de l'historique",
            erreur: error.message
        });
    }
}

module.exports = {
    getHistoriqueEtudiant,
    CreerHistorique,
    getNextSequenceValueHisto,
    supprimerHistorique
}