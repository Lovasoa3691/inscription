const annee = require("../models/anneeUniversitaire");
const salle = require("../models/salle");
const salleCounter = require("../models/salleCounter");
const utilisateurs = require("../models/utilisateurs");

async function getAllSalle(req, res) {
    const { email } = req.user;

    try {
        const admin = await utilisateurs.findOne({ email });

        if (!admin) {
            return res.json({
                succes: false,
                message: "Utilisateur non trouve"
            })
        }

        const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

        const salles = await salle.find({ idAnnee: anneeActive.idAnnee });

        return res.json({
            succes: true,
            salle: salles
        })
    } catch (error) {

    }
}

async function getNextSequenceValueSalle(seq) {
    const counter = await salleCounter.findByIdAndUpdate(
        { _id: seq },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );

    return counter.sequence_value
}


async function AjouterSalle(req, res) {
    const { numSalle, capacite, localisation } = req.body;

    if (!numSalle || !capacite || !localisation) {
        res.json({
            message: "Informations manquantes"
        })
    }

    const anneeActive = await annee.findOne({ statutAnnee: 'Active' })

    const salleExistant = await salle.findOne({ numSalle: numSalle });

    if (salleExistant) {

        salleExistant.capacite = capacite
        salleExistant.localisation = localisation
        // salleExistant.idAnnee = anneeActive.idAnnee
        salleExistant.updateOne();

        return res.json({
            message: "Salle existe deja"
        });
    }

    const seqNumber = await getNextSequenceValueSalle('salleId');
    const idSalle = `S_${seqNumber.toString().padStart(2, '0')}`;

    const nouveauSalle = new salle({
        idSalle: idSalle,
        numSalle: numSalle,
        capacite: capacite,
        localisation: localisation,
        idAnnee: anneeActive.idAnnee
    })

    await nouveauSalle.save();

    return res.json({
        succes: true,
        message: "Nouvelle salle ajoute avec succes"
    });

}

async function modifierSalle(req, res) {
    try {
        const { idSalle } = req.params;
        const { numSalle, capacite, localisation } = req.body;

        if (!idSalle) {
            return res.json({
                succes: false,
                message: "Identifiant de la salle manquant"
            })
        }

        const salleModifie = await salle.findOneAndUpdate(
            { idSalle: idSalle },
            { numSalle: numSalle, capacite: capacite, localisation: localisation }
        );

        if (!salleModifie) {
            return res.json({
                succes: false,
                message: "Salle non trouve"
            });
        }

        return res.json({
            succes: true,
            message: "Une ligne a ete modifie avec succes."
        });
    } catch (error) {
        return res.json({
            succes: false,
            message: "Erreur lors de la mise a jour de la salle",
            erreur: error.message
        });
    }

}


async function supprimerSalle(req, res) {
    try {
        const { idSalle } = req.params;

        if (!idSalle) {
            return res.json({
                succes: false,
                message: "Identifiant de la salle manquant"
            })
        }

        const salleSupprime = await salle.findOneAndDelete({ idSalle: idSalle });

        if (!salleSupprime) {
            return res.json({
                succes: false,
                message: "Salle non trouve"
            });
        }

        return res.json({
            succes: true,
            message: "Une ligne a ete supprime."
        });
    } catch (error) {
        return res.json({
            succes: false,
            message: "Erreur lors de la suppression de la salle",
            erreur: error.message
        });
    }
}

module.exports = {
    getAllSalle,
    AjouterSalle,
    modifierSalle,
    supprimerSalle
}