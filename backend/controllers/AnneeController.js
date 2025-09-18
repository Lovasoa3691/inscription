const anneeCounter = require("../models/anneeCounter");
const annee = require("../models/anneeUniversitaire");
const etudiant = require("../models/etudiant");
const etudiantCounter = require("../models/etudiantCounter");
const examen = require("../models/examen");
const paiement = require("../models/paiement");
const salle = require("../models/salle");
const salleCounter = require("../models/salleCounter");
const utilisateurs = require("../models/utilisateurs");

async function getAllAnnee(req, res) {
    const { email } = req.user;

    try {
        const admin = await utilisateurs.findOne({ email });

        if (!admin) {
            return res.json({
                succes: false,
                message: "Utilisateur non trouve"
            })
        }

        const Allannee = await annee.find();

        return res.json({
            succes: true,
            annee: Allannee
        })
    } catch (error) {

    }
}

async function getNextSequenceValueAnnee(seq) {
    const counter = await anneeCounter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return counter.sequence_value
}


async function CreerAnnee(req, res) {

    const { email } = req.user;

    const { debut, fin } = req.body;


    const utilisateur = await utilisateurs.findOne({ email });

    if (!debut || !fin) {
        res.json({
            message: "Informations manquantes"
        })
    }

    const anneeExistant = await annee.findOne({ debut: debut, fin: fin });

    if (anneeExistant) {
        return res.json({
            succes: false,
            message: "Cet année existe déjà !"
        })
    }

    const idSAdmin = utilisateur.id_ut;

    const seqNumber = await getNextSequenceValueAnnee('anneeId');
    const idAnnee = `A${seqNumber.toString()}`;

    const newYear = new annee({
        idAnnee: idAnnee,
        annee: `${debut} - ${fin}`,
        idSAdmin: idSAdmin
    })

    await newYear.save();

    return res.json({
        succes: true,
        message: "Nouvelle annee universitaire a ete cree avec succes"
    });


}

async function activerAnnee(req, res) {
    try {
        const { idAnnee } = req.params;

        if (!idAnnee) {
            return res.json({
                succes: false,
                message: "Information manquant"
            })
        }

        await annee.updateMany({}, { statutAnnee: 'Inactive' });

        const anneeUpdated = await annee.findOneAndUpdate(
            { idAnnee },
            { statutAnnee: 'Active' }
        );

        if (!anneeUpdated) {
            return res.json({
                succes: false,
                message: "Aucune année trouvée avec cet ID"
            });
        }

        return res.json({
            succes: true,
            message: `L'annee ${anneeUpdated.annee} a ete active`
        });
    } catch (error) {
        return res.json({
            succes: false,
            message: "Erreur lors de la mise a jour de l'information de l'etudiant",
            erreur: error.message
        });
    }

}


async function updateAllEntity(req, res) {

    const { idAnnee } = req.params;

    if (!idAnnee) {
        return res.json({
            succes: false,
            message: 'Information manquant'
        })
    }

    // const anneeActive = await annee.findOne({ statutAnnee: 'Active' });

    // const idAnneeActive = anneeActive.idAnnee;

    await etudiant.updateMany({}, { idAnnee: idAnnee, SecreataireId: 'SC03' });

    // await examen.updateMany({}, { idAnnee: idAnnee });

    // await salle.updateMany({}, { idAnnee: idAnnee });

    // await paiement.updateMany({}, { idAnnee: idAnnee });

    return res.json({
        success: true,
        message: 'Informations a ete mises a jour'
    })
}

async function getActiveAnnee(req, res) {
    try {
        const activeAnnee = await annee.findOne({ statutAnnee: 'Active' });

        if (!activeAnnee) {
            return res.json({
                success: false,
                message: 'Aucun annee en active'
            })
        }

        return res.json({
            success: true,
            activeAnnee
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

async function desactiverAnnee(req, res) {
    try {
        const { idAnnee } = req.params;

        if (!idAnnee) {
            return res.json({
                succes: false,
                message: "Information manquant"
            })
        }

        const anneeUpdated = await annee.findOneAndUpdate(
            { idAnnee },
            { statutAnnee: 'Desactive' }
        );

        return res.json({
            succes: true,
            message: `L'annee ${anneeUpdated.annee} a ete desactive`
        });
    } catch (error) {
        return res.json({
            succes: false,
            message: "Erreur lors de la mise a jour de l'information de l'etudiant",
            erreur: error.message
        });
    }

}


module.exports = {
    getAllAnnee,
    desactiverAnnee,
    activerAnnee,
    CreerAnnee,
    getActiveAnnee,
    updateAllEntity
}