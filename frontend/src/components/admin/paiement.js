import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import axios from 'axios';
import api from '../API/api';
import swal from 'sweetalert';
import { createRoot } from 'react-dom/client';
import Recu from '../etudiant/recuPaiement';
import html2pdf from 'html2pdf.js';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/ReactToastify.css'

function PaiementContent() {

    const [search, setSearch] = useState("");
    const [filtre, setFiltre] = useState([]);
    const [paieData, setpaieData] = useState([]);
    const [etudiantData, setEtudiantData] = useState([]);
    const [selectedMention, setSelectedMention] = useState(null);
    const [selectedNiveau, setSelectedNiveau] = useState(null);
    const [donneeFiltre, setDonneFiltre] = useState([]);

    const [paiementForm, setPaiementForm] = useState({
        montant: '', typePaie: '', descriptionPaie: [], etudiantId: '', nom: '', prenom: ''
    });

    const [total, setTotal] = useState(0);

    const [selectedEtudiant, setSelectedEtudiant] = useState(null);

    const [showModa, setShowModal] = useState(false);

    const formatDate = (dateHisto) => {
        const current = new Date(dateHisto);
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const hours = String(current.getHours()).padStart(2, '0');
        const minutes = String(current.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const chargerEtudiants = () => {

        api.get('/etudiants')
            .then((rep) => {
                setDonneFiltre(rep.data.etudiant)
                setEtudiantData(rep.data.etudiant);
            })
            .catch(error => {
                console.log("Erreur lors de la recuperation des donnees: ", error);
            })
    };


    const chargerPaiements = () => {
        api.get('/paiements')
            .then((rep) => {
                const uniquePaiements = rep.data.paiements.reduce((acc, paiement) => {
                    const etudiant = acc.find(p => p.etudiantId === paiement.etudiantId);
                    if (etudiant) {
                        // if (!etudiant.descriptions.includes(paiement.descriptionPaie)) {
                        //     etudiant.descriptions.push(paiement.descriptionPaie);
                        // }
                        // paiement.descriptionPaie.forEach(desc => {
                        //     // Aplatir les descriptions et vérifier si elles sont déjà présentes
                        //     desc.forEach(subDesc => {
                        //         if (!etudiant.descriptions.includes(subDesc)) {
                        //             etudiant.descriptions.push(subDesc);
                        //         }
                        //     });
                        // });
                        // etudiant.montantTotal += Number(paiement.montant);

                        paiement.descriptionPaie.forEach(desc => {
                            if (Array.isArray(desc)) {
                                // Si desc est un tableau, fusionner ses éléments
                                desc.forEach(subDesc => {
                                    if (!etudiant.descriptions.includes(subDesc)) {
                                        etudiant.descriptions.push(subDesc);
                                    }
                                });
                            } else {
                                // Si desc n'est pas un tableau, l'ajouter directement
                                if (!etudiant.descriptions.includes(desc)) {
                                    etudiant.descriptions.push(desc);
                                }
                            }
                        });
                        etudiant.montantTotal += Number(paiement.montant);
                    } else {
                        // acc.push({
                        //     etudiantId: paiement.etudiantId,
                        //     datePaie: paiement.datePaie,
                        //     montantTotal: Number(paiement.montant),
                        //     descriptions: [...paiement.descriptionPaie]
                        // });
                        const flattenedDescriptions = paiement.descriptionPaie.flat(); // Aplatir les descriptions
                        acc.push({
                            etudiantId: paiement.etudiantId,
                            datePaie: paiement.datePaie,
                            montantTotal: Number(paiement.montant),
                            descriptions: flattenedDescriptions // Utilisation des descriptions aplaties
                        });
                    }
                    return acc;
                }, []);

                const descriptionsRequises = ["FF1", "FF2", "FF3", "FF4", "FF5", "FF6", "FF7", "FF8", "FF9", "FF10"];

                const paiementsAvecStatut = uniquePaiements.map(p => {
                    const estComplet = descriptionsRequises.every(desc => p.descriptions.includes(desc));
                    return {
                        ...p,
                        statut: estComplet ? "Complet" : "En cours"
                    };
                });

                setpaieData(paiementsAvecStatut);

                const total = uniquePaiements.reduce((sum, etudiant) => sum + etudiant.montantTotal, 0);
                setTotal(total);
            })
            .catch((error) => {
                console.log(error.message);
            });
    };

    useEffect(() => {
        chargerPaiements();
        console.log(paieData);
    }, []);


    useEffect(() => {
        chargerEtudiants();
    }, []);


    // const chargerPaiements = () => {
    //     api.get('/paiements')
    //         .then((rep) => {

    //             const uniquePaiements = rep.data.paiements.reduce((acc, paiement) => {
    //                 const etudiant = acc.find(p => p.etudiantId === paiement.etudiantId);
    //                 if (etudiant) {
    //                     etudiant.montantTotal += Number(paiement.montant);
    //                 } else {
    //                     acc.push({
    //                         etudiantId: paiement.etudiantId,
    //                         datePaie: paiement.datePaie,
    //                         montantTotal: Number(paiement.montant)
    //                     });
    //                 }
    //                 return acc;
    //             }, []);

    //             setpaieData(uniquePaiements);


    //             const total = uniquePaiements.reduce((sum, etudiant) => sum + etudiant.montantTotal, 0);
    //             setTotal(total);
    //         })
    //         .catch((error) => {
    //             console.log(error.message);
    //         });
    // };

    // const chargerPaiements = () => {
    //     api.get('/paiements')
    //         .then((rep) => {
    //             // Définition des frais attendus
    //             const fraisAttendus = ["FF1", "FF2", "FF3", "FF4", "FF5", "FF6", "FF7", "FF8", "FF9", "FF10"];

    //             // Regrouper les paiements par étudiant
    //             const uniquePaiements = rep.data.paiements.reduce((acc, paiement) => {
    //                 const etudiant = acc.find(p => p.etudiantId === paiement.etudiantId);
    //                 if (etudiant) {
    //                     etudiant.montantTotal += Number(paiement.montant);
    //                     etudiant.fraisPaye.push(paiement.descriptionPaie); // Stocke la description
    //                 } else {
    //                     acc.push({
    //                         etudiantId: paiement.etudiantId,
    //                         datePaie: paiement.datePaie,
    //                         montantTotal: Number(paiement.montant),
    //                         fraisPaye: [paiement.descriptionPaie] // Stocke la description
    //                     });
    //                 }
    //                 return acc;
    //             }, []);

    //             // Vérification des frais FF1 - FF10
    //             uniquePaiements.forEach(etudiant => {
    //                 const fraisPaye = etudiant.fraisPaye.join(" "); // Regroupe toutes les descriptions en une seule chaîne
    //                 const fraisManquants = fraisAttendus.filter(frais => !fraisPaye.includes(frais));

    //                 etudiant.fraisComplets = fraisManquants.length === 0;
    //                 etudiant.fraisManquants = fraisManquants; // Stocke les frais manquants
    //             });

    //             setpaieData(uniquePaiements);

    //             const total = uniquePaiements.reduce((sum, etudiant) => sum + etudiant.montantTotal, 0);
    //             setTotal(total);
    //         })
    //         .catch((error) => {
    //             console.log(error.message);
    //         });
    // };


    const afficherDetails = (etudiantId) => {

        api.get('/paiements')
            .then((rep) => {
                const details = rep.data.paiements.filter(paiement => paiement.etudiantId === etudiantId);
                setSelectedEtudiant(details);
                setShowModal(true);
                // console.log(details)
            })
            .catch((error) => {
                console.log(error.message);
            });
    };

    const fermerModal = () => {
        setShowModal(false);
        setSelectedEtudiant([]);
    };


    const generateMentions = (categories, levels) => {
        return categories.flatMap(category =>
            levels.map(level => ({ code: `${category}${level}` }))
        );
    };


    const [fraisFormation, setFraisFormation] = useState(
        generateMentions(["FF"], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    );

    const handleChangeData = (e) => {
        const { name, value } = e.target;
        const etudiantSelectionne = donneeFiltre.find(item => item.matricule === value);

        setPaiementForm(prevState => ({
            ...prevState,
            [name]: value,
            nom: etudiantSelectionne ? etudiantSelectionne.nomEtu : "",
            prenom: etudiantSelectionne ? etudiantSelectionne.prenomEtu : ""
        }));

        // console.log(paiementForm.nom);
    }


    const [isVisible, setVisible] = useState(false);

    const mentionOptions = [
        { value: "DROIT", label: "DROIT" },
        { value: "BTP", label: "BTP" },
        { value: "INFO", label: "INFO" },
        { value: "GM", label: "GM" },
        { value: "ICJ", label: "ICJ" },
    ]

    const niveauOptions = [
        { value: "L1", label: "L1" },
        { value: "L2", label: "L2" },
        { value: "L3", label: "L3" },
        { value: "M1", label: "M1" },
        { value: "M2", label: "M2" },
    ]

    const filtrerData = (mention, niveau) => {
        const filtered = etudiantData.filter(item =>
            (!mention || item.mention === mention.value) &&
            (!niveau || item.niveau === niveau.value)
        )
        setDonneFiltre(filtered);
    }

    const handleMentionChange = (selectedMention) => {
        setSelectedMention(selectedMention)
        filtrerData(selectedMention, selectedNiveau)
    }

    const handleNiveauChange = (selectedNiveau) => {
        setSelectedNiveau(selectedNiveau)
        filtrerData(selectedMention, selectedNiveau)
    }

    const openModal = () => {
        viderChamp()
        setVisible(true);
    }

    const closeModal = () => {
        setVisible(false);
    }


    const handleCheckChangeFinal = (value) => {
        // Déterminer le montant en fonction du niveau sélectionné
        let montantActuel;
        switch (selectedNiveau?.value) {
            case "L1": montantActuel = 50000; break;
            case "L2": montantActuel = 65000; break;
            case "L3": montantActuel = 80000; break;
            case "M1": montantActuel = 100000; break;
            default: montantActuel = 130000; break;
        }

        // Mettre à jour l'état du paiement
        setPaiementForm((prev) => {
            const updatedPaie = prev.descriptionPaie.includes(value)
                ? prev.descriptionPaie.filter((item) => item !== value)
                : [...prev.descriptionPaie, value];

            return {
                ...prev,
                descriptionPaie: updatedPaie,
                montant: montantActuel * updatedPaie.length, // Mettre à jour après modification
            };
        });
    };

    const formatDate1 = (dateString) => {
        const date = new Date(dateString); // Conversion si nécessaire
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours());
        const min = String(date.getMinutes());
        const sec = String(date.getSeconds());
        return `${year}/${month}/${day} ${hour}:${min}:${sec}`;
    }

    const [isLoading, setIsLoading] = useState(false);

    const savePaiement = () => {
        // e.preventDefault();
        try {
            // imprimerRecu();
            api.post('/paiements/save', paiementForm)
                .then((rep) => {
                    // console.log(rep.data.message)
                    setVisible(false)
                    swal({
                        text: `${rep.data.message}`,
                        icon: "success",
                        buttons: false,
                        timer: 1500
                    },
                    )
                    chargerPaiements();
                    imprimerRecu();
                })
                .catch((err) => {
                    console.log(err.message)
                })
        } catch (error) {
            console.log(error.message);
        }
    }

    const imprimerRecu = async () => {
        const paiementData = {
            nom: paiementForm.nom,
            prenom: paiementForm.prenom,
            montant: paiementForm.montant,
            mention: selectedMention.value,
            descriptionPaie: paiementForm.descriptionPaie,
            niveau: selectedNiveau.value,
        };

        setIsLoading(true);

        const div = document.createElement("div");
        document.body.appendChild(div);

        const root = createRoot(div);
        root.render(<Recu {...paiementData} />);

        const date = formatDate1(Date.now()).replace(/[:]/g, "-");
        const fichier = `recu_${date}.pdf`;

        try {
            const opt = {
                margin: 1,
                filename: fichier,
                html2canvas: {
                    scale: 2,
                    logging: true,
                    useCORS: true,
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait",
                },
            };

            // Attendre un peu pour que le rendu React soit terminé
            await new Promise((resolve) => setTimeout(resolve, 100));


            const pdfBlob = await html2pdf().from(div).set(opt).outputPdf("blob");

            const pdfUrl = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = fichier;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pdfUrl);

            // console.log(paiementForm.nom);
            // Nettoyage
            root.unmount();
            document.body.removeChild(div);

            setIsLoading(false);

            await envoyerPDF(pdfBlob, fichier);


        } catch (error) {
            console.error("Erreur lors de la génération du PDF :", error);
            setIsLoading(false);
        }
    };


    const envoyerPDF = async (pdfBlob, filename) => {
        const formData = new FormData();

        // Convertir le Blob en File (nécessaire pour Multer)
        const file = new File([pdfBlob], filename, { type: "application/pdf" });

        formData.append("file", file);
        formData.append("email", "fenonantenaikolovasoa@gmail.com");

        try {
            const response = await api.post("/paiement/recu", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // alert(response.data.message);
            // console.log(response.data.message)
            toast.success(response.data.message, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });

        } catch (error) {
            console.error("Erreur lors de l'envoi du PDF :", error);
            toast.error("Erreur lors de l'envoi de l'email", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            // alert("Erreur lors de l'envoi de l'email.");
        }
    };

    const showToast = () => {
        toast.success("Reçu envoié avec succès", {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    }


    const deletPaiement = (id) => {
        swal({
            title: "Etes-vous sûr?",
            text: "Une fois supprimé, cette information ne pourra pas être récupérée !",
            icon: "warning",
            buttons: {
                confirm: {
                    text: "Oui",
                    className: "btn btn-success",
                },
                cancel: {
                    text: "Non",
                    visible: true,
                    className: "btn btn-danger"
                }
            },
            // dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                api.delete(`/paiement/delete/${id}`)
                    .then((rep) => {
                        swal(`${rep.data.message}`, {
                            icon: "success",
                            buttons: false,
                            timer: 1500,
                        });
                        chargerPaiements();
                    })
                    .catch((err) => {
                        console.log(err.message)
                    })
            }
        });

    }

    const [fraisPayes, setFraisPayes] = useState([]); // Frais déjà payés par l'étudiant

    useEffect(() => {
        const fetchFraisPayes = async () => {
            console.log(paiementForm.etudiantId)
            try {
                api.get(`/paiements/etudiant/${paiementForm.etudiantId}`)
                    .then((rep) => {
                        // console.log(rep.data)
                        setFraisPayes(rep.data)
                    })
                    .catch((error) => {
                        console.error("Erreur de récupération des frais :", error.message);
                    })

            } catch (error) {
                console.error("Erreur réseau :", error);
            }
        };

        if (paiementForm.etudiantId) {
            fetchFraisPayes();
        }
    }, [paiementForm.etudiantId]);

    const viderChamp = () => {
        setPaiementForm({
            montant: '',
            typePaie: '',
            descriptionPaie: [],
            etudiantId: '',
            nom: '',
            prenom: ''
        });
        setFraisFormation(generateMentions(["FF"], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
        setSelectedMention(null);
        setSelectedNiveau(null);
    };


    return (
        <div className="container">
            <ToastContainer />

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des paiements</h3>
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center">
                                    {/* <h4 className="card-title">Add Row</h4> */}
                                    <button
                                        className="btn btn-primary btn-round btn-border ms-auto"
                                        onClick={openModal}
                                    >
                                        <i className="fa fa-plus">&nbsp;&nbsp;</i>
                                        Nouveau paiement
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">

                                {/* <!-- Modal --> */}
                                {
                                    isVisible && (
                                        <div
                                            className="modal fade show d-block"
                                            // id="addRowModal"
                                            // tabindex="-1"
                                            role="dialog"
                                        // aria-hidden="true"
                                        >
                                            <form
                                            // onSubmit={imprimerRecu}
                                            >
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header border-0">
                                                            <h5 className="modal-title">
                                                                <span className="fw-mediumbold"> Nouvel</span>
                                                                <span className="fw-light"> enregistrement </span>
                                                            </h5>
                                                            <i className='fas fa-times fa-2x' onClick={closeModal}></i>
                                                        </div>
                                                        <div className="modal-body">
                                                            {/* <p className="small">
                                                    Vous devraiz remplir tous les champs
                                                </p> */}

                                                            <div className="row">
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Filtre</label>
                                                                        <div className="row">
                                                                            <div className="col-sm-6">
                                                                                <Select
                                                                                    options={mentionOptions}
                                                                                    placeholder="Mention"
                                                                                    value={selectedMention}
                                                                                    onChange={handleMentionChange}
                                                                                    isClearable
                                                                                />
                                                                            </div>
                                                                            <div className="col-sm-6">
                                                                                <Select
                                                                                    options={niveauOptions}
                                                                                    placeholder="Niveau"
                                                                                    value={selectedNiveau}
                                                                                    onChange={handleNiveauChange}
                                                                                    isClearable
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Nom et Prenom de l'étudiant</label>
                                                                        <select name='etudiantId'
                                                                            className="form-select"
                                                                            value={paiementForm.etudiantId}
                                                                            onChange={handleChangeData}
                                                                        >
                                                                            {/* <option>Choisir...</option> */}
                                                                            {
                                                                                donneeFiltre && donneeFiltre.map(item => (
                                                                                    <option key={item.matricule} value={item.matricule}><strong>{(item.matricule)}</strong> {(item.nomEtu).toUpperCase()} {item.prenomEtu}</option>
                                                                                ))
                                                                            }
                                                                        </select>
                                                                    </div>
                                                                </div>


                                                                <div className="col-md-12">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Description</label>
                                                                        <div className="selectgroup selectgroup-pills">
                                                                            {fraisFormation && fraisFormation.map(item => {
                                                                                const isPaid = fraisPayes.includes(item.code);
                                                                                return (
                                                                                    <label className="selectgroup-item" key={item.code}>
                                                                                        <input
                                                                                            onChange={() => handleCheckChangeFinal(item.code)}
                                                                                            type="checkbox"
                                                                                            name="descriptionPaie"
                                                                                            value={item.code}
                                                                                            className="selectgroup-input"
                                                                                            checked={paiementForm.descriptionPaie.includes(item.code)}
                                                                                            disabled={isPaid}
                                                                                        />
                                                                                        <span className={`selectgroup-button ${isPaid ? "btn-success text-white" : ""}`}>
                                                                                            {item.code}
                                                                                        </span>
                                                                                    </label>
                                                                                );
                                                                            })}


                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Montant à paye</label>
                                                                        <div className="input-group mb-3">
                                                                            <span className="input-group-text">Ar</span>
                                                                            <input
                                                                                value={paiementForm.montant}
                                                                                onChange={handleChangeData}
                                                                                type="text"
                                                                                name='montant'
                                                                                className="form-control"
                                                                                aria-label="Amount (to the nearest dollar)"
                                                                            />
                                                                            <span className="input-group-text">.00</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className="modal-footer border-0">
                                                            <button
                                                                type="button"
                                                                className="btn btn-success btn-outer"
                                                                onClick={savePaiement}
                                                                disabled={isLoading}
                                                            >
                                                                Enregistrer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                onClick={closeModal}
                                                                disabled={isLoading}
                                                            >
                                                                Fermer
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    )
                                }

                                {
                                    isVisible && (
                                        <div className="modal-backdrop fade show"></div>
                                    )
                                }




                                {/* <div className="table-responsive"> */}
                                <div className="col-md-12">
                                    <div className="card card-round">

                                        <div className="card-body p-0">
                                            <div className="table-responsive">

                                                <table className="table align-items-center mb-0">
                                                    <thead className="thead-light">
                                                        <tr>
                                                            <th scope="col">Numéro de paiement</th>
                                                            <th scope="col" className="text-end">Date et Heure</th>
                                                            <th scope="col" className="text-end">Montant Total</th>
                                                            <th scope="col" className="text-end">Status</th>
                                                            <th scope="col" className="text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {
                                                            paieData && paieData.map(item => (
                                                                <tr key={item.etudiantId}>
                                                                    <th scope="row">
                                                                        {item.statut === "Complet" ? (
                                                                            <button
                                                                                className="btn btn-icon btn-round btn-success btn-sm me-2"
                                                                            >
                                                                                <i className="fa fa-check text-white"></i>
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                className="btn btn-icon btn-round btn-warning btn-sm me-2"
                                                                            >
                                                                                <i className="fa fa-hourglass-half text-white"></i>
                                                                            </button>
                                                                        )}
                                                                        {/* <button
                                                                            className="btn btn-icon btn-round btn-success btn-sm me-2"
                                                                        >
                                                                            <i className="fa fa-check"></i>
                                                                        </button> */}
                                                                        Paiement de la part de l'étudiant {item.etudiantId}
                                                                    </th>
                                                                    <td className="text-end">{formatDate(item.datePaie)}</td>
                                                                    <td className="text-end">{(item.montantTotal).toLocaleString("fr-FR", { style: 'currency', currency: 'MGA' })}</td>
                                                                    <td className="text-end">
                                                                        {item.statut === "Complet" ? (
                                                                            <span className="badge badge-success text-white">Complet</span>
                                                                        ) : (
                                                                            <span className="badge badge-warning text-white">
                                                                                En cours
                                                                            </span>
                                                                        )}

                                                                    </td>
                                                                    <td className="text-center">
                                                                        <i className="fas fa-archive fa-2x" title='Voir details' onClick={() => afficherDetails(item.etudiantId)}></i>
                                                                        &nbsp;&nbsp;&nbsp;
                                                                        <i className="fas fa-times fa-2x text-danger" title='Supprimer'
                                                                            onClick={() => deletPaiement(item.etudiantId)}
                                                                        ></i>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {
                                    showModa && (
                                        <div
                                            className="modal fade show d-block"
                                            role="dialog"
                                        >

                                            <div className="modal-dialog modal-lg ">
                                                <div className="modal-content">


                                                    <div className="modal-header">
                                                        <h4 className="modal-title">Details du paiement pour l'étudiant {selectedEtudiant[0].etudiantId}</h4>
                                                        <button type="button" className="btn-close" onClick={fermerModal} ></button>
                                                    </div>


                                                    <div className="modal-body">
                                                        <table className="table align-items-center mb-0">
                                                            <thead className="thead-light">
                                                                <tr>
                                                                    {/* <th scope="col">Numero de paiement</th> */}
                                                                    <th scope="col" className="text-start">Date paiement</th>
                                                                    <th scope="col" className="text-start">Descriptions</th>
                                                                    <th scope="col" className="text-start">Montant</th>
                                                                    <th scope="col" className="text-start">Statut</th>

                                                                </tr>
                                                            </thead>
                                                            <tbody className='fw-bold'>

                                                                {
                                                                    selectedEtudiant && selectedEtudiant.map(item => (
                                                                        <tr key={item.idPaie}>
                                                                            <td className="text-start">
                                                                                {item.datePaie}
                                                                            </td>
                                                                            <td className="text-start">
                                                                                {item.descriptionPaie.join(', ')}
                                                                            </td>
                                                                            <td className="text-start">
                                                                                {item.montant}
                                                                            </td>
                                                                            <td className="text-start">
                                                                                {item.statutPaie}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                }

                                                            </tbody>
                                                        </table>
                                                    </div>


                                                    <div className="modal-footer">
                                                        <button type="button" className="btn btn-danger"
                                                            onClick={fermerModal}
                                                        >Fermer</button>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    )
                                }

                                {
                                    showModa && (
                                        <div className="modal-backdrop fade show"></div>
                                    )
                                }

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PaiementContent;