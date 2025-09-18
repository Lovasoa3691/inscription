import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
// import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import api from '../API/api';
import swal from 'sweetalert';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'

function ExamenContent() {

    const colonne = [
        // {
        //     name: "_ID",
        //     selector: row => row._id,
        //     sortable: true,
        // },
        {
            name: "IDENTIFIANT",
            selector: row => row.idExam,
            sortable: true,
        },
        {
            name: "SESSION",
            selector: row => row.codeExam,
            sortable: true,
        },
        {
            name: "DATE",
            selector: row => row.dateExam,
            sortable: true,
        },
        {
            name: "MATIERE",
            selector: row => row.matiere,
            sortable: true,
        },
        {
            name: "HORAIRE",
            selector: row => (
                <span className='text-center'>{row.heureDebut} - {row.heureFin}</span>
            ),
            sortable: true,
        },
        {
            name: "CLASSE",
            selector: row => (
                <span>[ {row.classe.join(", ")} ]</span>
            ),
            sortable: true,
        },
        {
            name: "STATUT",
            selector: row => (
                <span className={row.statut === "En cours" ? "badge badge-warning" : row.statut === "Termine" ? "badge badge-primary" : "badge badge-danger"}>
                    {row.statut}
                </span>
            ),
            sortable: true,
        },
        {
            name: "ACTIONS",
            cell: (row) => (
                <div className="form-button-action" style={{ fontWeight: 'normal', fontSize: '20px' }}>

                    <i className="fas fa-file-alt text-primary"
                        onClick={() => afficherListeEtudiantInscrit(row)}
                        title="Candidats"
                    ></i>
                    &nbsp;&nbsp;&nbsp;
                    <i className="fas fa-pen"
                        onClick={() => openModalEdit(row)}
                        title="Editer"
                    ></i>
                    &nbsp;&nbsp;
                    <i className="fas fa-trash-alt text-danger"
                        onClick={() => supprimeExamen(row)}
                        title="Supprimer"
                    ></i>
                    &nbsp;&nbsp;

                    {row.statut === 'En cours' && (
                        <i className="fas fa-times-circle text-warning"
                            onClick={() => annulerExamen(row)}
                            title="Annuler"
                        ></i>
                    )}
                </div>
            )
        },
    ];


    const [search, setSearch] = useState("");
    const [filtre, setFiltre] = useState("");
    const [examData, setExamData] = useState([]);
    const [DonneFiltre, setDonneFiltre] = useState([]);

    // const searchChange = (e) => {
    //     const value = e.target.value;
    //     setSearch(value);

    //     const filtrer = examData.filter((item) =>
    //         item.codeExam.toUpperCase().includes(value.toUpperCase()) ||
    //         item.matiere.toUpperCase().includes(value.toUpperCase()) ||
    //         item.classe.toUpperCase().includes(value.toUpperCase())
    //     );

    //     setDonneFiltre(filtrer);
    // }

    const searchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        const filtrer = examData.filter((item) =>
            (item.codeExam && String(item.codeExam).toUpperCase().includes(value.toUpperCase())) ||
            (item.matiere && String(item.matiere).toUpperCase().includes(value.toUpperCase())) ||
            (item.statut && String(item.statut).toUpperCase().includes(value.toUpperCase())) ||
            (item.classe && (
                Array.isArray(item.classe)
                    ? item.classe.some(classeItem => String(classeItem).toUpperCase().includes(value.toUpperCase()))
                    : String(item.classe).toUpperCase().includes(value.toUpperCase())
            ))
        );

        setDonneFiltre(filtrer);
    };


    // const filtreChange = (e) => {
    //     const { name, value } = e.target;
    //     setFiltre({ ...filtre, [name]: value });

    //     const filtrer = examData.filter(item =>
    //         (item.codeExam.toUpperCase().includes(filtre.codeExam.toUpperCase())) ||
    //         (item.matiere.toUpperCase().includes(filtre.matiere.toUpperCase())) ||
    //         (item.classe.toUpperCase().includes(filtre.classe.toUpperCase()))
    //     );
    //     setDonneFiltre(filtrer);
    // }

    const generateMentions = (categories, levels) => {
        return categories.flatMap(category =>
            levels.map(level => ({ code: `${category} ${level}` }))
        );
    };

    const [mention1, setMention1] = useState(
        generateMentions(["INFO", "BTP", "DROIT", "GM", "ICJ"], ["L1"])
    );

    const [mention2, setMention2] = useState(
        generateMentions(["INFO", "BTP", "DROIT", "GM", "ICJ"], ["L2"])
    );

    const [mention3, setMention3] = useState(
        generateMentions(["INFO", "BTP", "DROIT", "GM", "ICJ"], ["L3"])
    );

    const [mention4, setMention4] = useState(
        generateMentions(["INFO", "BTP", "DROIT", "GM", "ICJ"], ["M1"])
    );

    const [mention5, setMention5] = useState(
        generateMentions(["INFO", "BTP", "DROIT", "GM", "ICJ"], ["M2"])
    );

    const paginationComponentOptions = {
        rowsPerPageText: "Lignes par page",
        rangeSeparatorText: "de",
        noRowsPerPage: false, // Cacher l'option "rows per page" si souhaité
        selectAllRowsItem: true,
        selectAllRowsItemText: "Tout",
    };

    const [examenForm, setExamenForm] = useState({
        idExam: '',
        codeExam: '',
        dateExam: '',
        classe: [],
        heureDebut: '',
        heureFin: '',
        matiere: ''
        , duree: '',
        admin: '',
    })

    function calculerInterval(hDeb, hFin) {
        let debut = new Date(`1970-01-01T${hDeb}:00`);
        let fin = new Date(`1970-01-01T${hFin}:00`);

        let difference = (fin - debut) / (1000 * 60); // Convertir en minutes

        let heures = Math.floor(difference / 60);
        let minutes = difference % 60;

        return `${heures}h ${minutes}min`;
    }


    const chargerExamens = () => {

        api.get('/examens/all')
            .then((rep) => {
                setExamData(rep.data.examens);
                setDonneFiltre(rep.data.examens);
                // setFiltre(rep.data);
            })
            .catch(error => {
                console.log("Erreur lors de la récuperation des données: ", error);
            })
    };

    // useEffect(() => {
    //     chargerExamens();
    // }, []);

    const [isLoading, setLoading] = useState(false);

    const saveExamen = (e) => {
        e.preventDefault();
        examenForm.duree = calculerInterval(examenForm.heureDebut, examenForm.heureFin);

        // // console.log(examenForm)
        api.post('/examens/save', examenForm)
            .then((rep) => {
                setLoading(true);
                // console.log(rep.data)
                if (rep.data.succes) {
                    setVisible(false)
                    swal({
                        text: `${rep.data.message}`,
                        icon: "success",
                        buttons: false,
                        timer: 1500
                    },
                    )
                    setLoading(false);
                    // showToast()
                    if (rep.data.mail) {
                        toast.success("Notification envoié !", {
                            position: 'top-right',
                            autoClose: 4000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true
                        });
                    } else {
                        toast.error("Impossible d'envoyer l'email, problème de connexion !", {
                            position: 'top-right',
                            autoClose: 4000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true
                        });
                    }
                }
                else {
                    swal({
                        text: `${rep.data.message}`,
                        icon: "error",
                        buttons: false,
                        timer: 1500
                    },
                    )
                }
                setVisible(false)
                chargerExamens();
            })
            .catch((err) => {
                console.log("Erreur: ", err.message)
            })
    }

    const updateSalle = (e) => {
        e.preventDefault();
        api.put(`/examens/update/${examenForm.idExam}`, examenForm)
            .then((rep) => {
                if (rep.data.succes) {
                    swal({
                        text: `${rep.data.message}`,
                        icon: "success",
                        buttons: false,
                        timer: 1500
                    },
                    )
                }
                else {
                    swal({
                        text: `${rep.data.message}`,
                        icon: "error",
                        buttons: false,
                        timer: 1500
                    },
                    )
                }
                chargerExamens();
            })
            .catch((err) => {
                console.log("Erreur: ", err.message)
            })
    }

    const annulerExamen = (data) => {

        swal({
            title: "Annulation",
            text: "Vous êtes sûr de vouloir annulé cet examen ?",
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
        }).then((confirm) => {
            if (confirm) {
                api.put(`/examens/update/statut/${data.idExam}`)
                    .then((rep) => {
                        if (rep.data.succes) {
                            swal({
                                text: `${rep.data.message}`,
                                icon: "success",
                                buttons: false,
                                timer: 1500
                            },
                            )

                            // console.log(rep.data.mail)

                            if (rep.data.mail) {
                                toast.success("Notification envoié !", {
                                    position: 'top-right',
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true
                                });
                            } else {
                                toast.erreur("Impossible d'envoyer l'email, problème de connexion !", {
                                    position: 'top-right',
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true
                                });
                            }
                            // showToast();
                        }
                        else {
                            swal({
                                text: `${rep.data.message}`,
                                icon: "error",
                                buttons: false,
                                timer: 1500
                            },
                            )
                        }
                        chargerExamens();
                    })
                    .catch((err) => {
                        console.log("Erreur: ", err.message)
                    })

            } else {
                swal.close();
            }
        });

    }

    const showToast = () => {
        toast.success("Notification envoié !", {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });
    }

    const supprimeExamen = (data) => {
        if (data.statut === "En cours") {
            swal("Desolé ! Vous ne pouvez pas supprimer un examen en cours!", {
                title: 'Interruption',
                icon: "warning",
                buttons: {
                    confirm: {
                        className: "btn btn-success",
                    },
                },
            });
        } else {
            swal({
                title: "Etes-vous sur?",
                text: "Une fois supprimé, vous ne pourrez plus récuperer cet information !",
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
                    api.delete(`examens/delete/${data.idExam}`)
                        .then((rep) => {
                            if (rep.data.succes) {
                                swal(`${rep.data.message}`, {
                                    icon: "success",
                                    buttons: {
                                        confirm: {
                                            className: "btn btn-success",
                                        },
                                    },
                                });
                                chargerExamens();
                            } else {
                                swal(`${rep.data.message}`, {
                                    icon: "error",
                                    buttons: {
                                        confirm: {
                                            className: "btn btn-success",
                                        },
                                    },
                                });
                                chargerExamens();
                            }
                        })

                } else {
                    swal.close();
                }
            });
        }
    }

    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState('');


    const [isVisible, setVisible] = useState(false);
    const [isVisibleList, setVisibleList] = useState(false);
    const [btnLabel, setBtnLabel] = useState('Enregistrer');
    const [isEdit, setIsEdit] = useState(false);

    const [etudiantIsncrit, setEtudiantInscrit] = useState([]);

    const [matiere, setMatiere] = useState('');
    const [session, setSession] = useState('');

    const viderChamp = () => {
        examenForm.idExam = ''
        examenForm.codeExam = ''
        examenForm.dateExam = ''
        examenForm.classe = []
        examenForm.heureDebut = ''
        examenForm.heureFin = ''
        examenForm.matiere = ''
        examenForm.duree = ''
    }

    const afficherListeEtudiantInscrit = (data) => {
        setMatiere(data.matiere)
        setSession(data.codeExam)
        try {
            api.get(`/inscriptions/${data.idExam}`)
                .then((rep) => {
                    setEtudiantInscrit(rep.data)
                })
                .catch((error) => {
                    console.log(error.message)
                })
            setVisibleList(true);
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleChangeData = (e) => {
        const { name, value, type } = e.target;
        if (type === "time" && (name === "heureDebut" || name === "heureFin")) {
            if (value < "06:00") {
                setExamenForm({ ...examenForm, [name]: "06:00" });
                return;
            } else if (value > "18:00") {
                setExamenForm({ ...examenForm, [name]: "18:00" });
                return;
            }
        }
        setExamenForm({ ...examenForm, [name]: value });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Conversion si nécessaire
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }


    const openModalEdit = (data) => {
        setVisible(true)
        setIsEdit(true);
        setBtnLabel('Mettre à jour');

        examenForm.idExam = data.idExam
        examenForm.codeExam = data.codeExam
        examenForm.dateExam = formatDate(data.dateExam)
        // examenForm.classe = data.classe
        examenForm.heureDebut = data.heureDebut
        examenForm.heureFin = data.heureFin
        examenForm.matiere = data.matiere
        examenForm.duree = data.duree
    }

    const openListModal = () => {
        setVisibleList(true);
    }

    const closeListModal = () => {
        setVisibleList(false);
    }

    const openModal = () => {
        setVisible(true);
        viderChamp();
        setBtnLabel('Enregistrer');
    }

    const closeModal = () => {
        setVisible(false);
        setIsEdit(false);
        viderChamp();
        setBtnLabel('Enregistrer');
    }

    const handleCheckChange = (value) => {
        setSelectedItems((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value)
            } else {
                return [...prev, value]
            }
        });
    }

    const handleCheckChangeFinal = (value) => {
        setExamenForm((prev) => {
            const updtedClasse = prev.classe.includes(value) ?
                prev.classe.filter((item) => item !== value)
                : [...prev.classe, value];
            // if (prev.includes(value)) {
            //     return prev.filter((item) => item !== value)
            // } else {
            //     return [...prev, value]
            // }

            return { ...prev, classe: updtedClasse };
        });
    }

    const handleSelectChange = (e) => {
        setSelectedIndex(e.target.value);
        // examenForm.codeExam = e.target.value;
    }

    const [salleData, setSalleData] = useState([]);

    const chargerSalles = () => {
        try {
            api.get('/salles')
                .then((rep) => {
                    setSalleData(rep.data.salle)
                })
        } catch (error) {
            console.log(error.message)
        }
    }

    const verifieEtatExamen = async () => {
        await api.get('/updateExamStatus')
            .then((rep) => {
                if (rep.data.succes) {
                    console.log(rep.data.examMiseAJour)
                    const resultat = rep.data.examMiseAJour;
                    if (resultat.length > 0) {
                        chargerExamens();
                    } else {
                        console.log("Aucun examen à mettre à jour")
                    }
                }
            })
            .catch((error) => {
                console.error('Erreur:', error);
            })
    }



    const ImprimerEtudiantsPDF = () => {
        const doc = new jsPDF();

        if (etudiantIsncrit && etudiantIsncrit.length > 0) {
            const colonnes = ["MATRICULE", "NOM & PRENOM", "MENTION", "NIVEAU"];
            const ligne = etudiantIsncrit.map((ligne) => [ligne.matricule, `${ligne.nomEtu} ${ligne.prenomEtu}`, ligne.mention, ligne.niveau]);
            doc.text(`Liste des étudiants inscrit(e)s à l'examen ${matiere} de la session ${session}`, 15, 10);
            doc.autoTable({
                head: [colonnes],
                body: ligne,
                startY: 20,
            });
            doc.save(`liste_etudiant_inscrit_${matiere}.pdf`);
        } else {
            swal({
                text: `Desolé! Aucune liste à imprimer`,
                icon: "error",
                buttons: false,
                timer: 1500
            },
            )
        }
    }

    useEffect(() => {
        chargerSalles();
    }, []);

    useEffect(() => {
        chargerExamens();
        const interval = setInterval(() => {
            verifieEtatExamen();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">

            <ToastContainer />

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des sessions d'examen mises en place</h3>
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">

                                <div className="d-flex align-items-center">
                                    <h4 className="card-title">
                                        <input
                                            type='text'
                                            placeholder='Recherche'
                                            value={search}
                                            onChange={searchChange}
                                            style={{
                                                padding: '7px',
                                                width: '300px',
                                                fontSize: '16px',
                                                border: '1px solid #ddd',
                                            }}
                                        />
                                    </h4>

                                    <button
                                        className="btn btn-primary btn-round btn-border ms-auto"
                                        onClick={openModal}
                                    // data-bs-toggle="modal"
                                    // data-bs-target="#addRowModal"
                                    >
                                        <i className="fa fa-plus">&nbsp;&nbsp;</i>
                                        Créer Session
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">

                                {/* <!-- Modal --> */}

                                {
                                    isVisible && (
                                        <div
                                            className="modal fade show d-block"
                                            id="addRowModal"
                                            // tabindex="-1"
                                            role="dialog"

                                        >
                                            <form onSubmit={saveExamen}>
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header border-0">
                                                            <h5 className="modal-title">
                                                                <span className="fw-mediumbold"> Nouvel</span>
                                                                <span className="fw-light"> enregistrement </span>
                                                            </h5>
                                                            <i className='fas fa-times fa-2x text-danger' onClick={closeModal}></i>
                                                        </div>
                                                        <div className="modal-body">
                                                            {/* <p className="small">
                                                    Vous devraiz remplir tous les champs
                                                </p> */}

                                                            <div className="row">
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Code Examen</label>
                                                                        <select name='codeExam'
                                                                            className="form-select"
                                                                            onChange={handleChangeData}
                                                                            value={examenForm.codeExam}
                                                                        >
                                                                            <option>Choisir...</option>
                                                                            <option value='S1' >S1</option>
                                                                            <option value='S2'>S2</option>
                                                                            <option value='S3'>S3</option>
                                                                            <option value='S4'>S4</option>
                                                                            <option value='S5'>S5</option>
                                                                            <option value='S6'>S6</option>
                                                                            <option value='S7'>S7</option>
                                                                            <option value='S8'>S8</option>
                                                                            <option value='S9'>S9</option>
                                                                            <option value='S10'>S10</option>
                                                                        </select>
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Salle</label>
                                                                        <select name='salleExam'
                                                                            className="form-select"
                                                                            onChange={handleChangeData}
                                                                            value={examenForm.salleExam}
                                                                        >
                                                                            <option>Choisir...</option>
                                                                            {
                                                                                salleData.map(item => (
                                                                                    <option key={item.idSalle} value={item.idSalle}>{item.numSalle}</option>
                                                                                ))
                                                                            }
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Date de l'examen</label>
                                                                        <input
                                                                            onChange={handleChangeData}
                                                                            value={examenForm.dateExam}
                                                                            type="date"
                                                                            className="form-control"
                                                                            name="dateExam"

                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6 pe-0">
                                                                    <div className="form-group">
                                                                        <label>Heure début</label>
                                                                        <input
                                                                            onChange={handleChangeData}
                                                                            value={examenForm.heureDebut}
                                                                            name="heureDebut"
                                                                            type="time"
                                                                            className="form-control"
                                                                            min="06:00"
                                                                            max="18:00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Heure fin</label>
                                                                        <input
                                                                            onChange={handleChangeData}
                                                                            value={examenForm.heureFin}
                                                                            name="heureFin"
                                                                            type="time"
                                                                            className="form-control"
                                                                            min="06:00"
                                                                            max="18:00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Matière</label>
                                                                        <input
                                                                            onChange={handleChangeData}
                                                                            value={examenForm.matiere}
                                                                            type="text"
                                                                            className="form-control"
                                                                            name="matiere"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Duree</label>
                                                                        <input type="text"
                                                                            onChange={handleChangeData}
                                                                            value={examenForm.duree}
                                                                            className='form-control'
                                                                            name='duree'
                                                                        />
                                                                    </div>
                                                                </div> */}

                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Classe concernée</label>
                                                                        <div className="selectgroup selectgroup-pills">
                                                                            {
                                                                                examenForm.codeExam === "S1" || examenForm.codeExam === "S2" ? (
                                                                                    mention1 && mention1.map(item => (
                                                                                        <label className="selectgroup-item" key={item.code}>
                                                                                            <input
                                                                                                onChange={() => handleCheckChangeFinal(item.code)}
                                                                                                type="checkbox"
                                                                                                name="classe"
                                                                                                value={item.code}
                                                                                                className="selectgroup-input"
                                                                                                checked={examenForm.classe.includes(item.code)}
                                                                                            />
                                                                                            <span className="selectgroup-button">{item.code}</span>
                                                                                        </label>
                                                                                    )

                                                                                    )
                                                                                ) : examenForm.codeExam === "S3" || examenForm.codeExam === "S4" ? (
                                                                                    mention2 && mention2.map(item => (
                                                                                        <label className="selectgroup-item" key={item.code}>
                                                                                            <input
                                                                                                onChange={() => handleCheckChangeFinal(item.code)}
                                                                                                type="checkbox"
                                                                                                name="classe"
                                                                                                value={item.code}
                                                                                                className="selectgroup-input"
                                                                                                checked={examenForm.classe.includes(item.code)}
                                                                                            />
                                                                                            <span className="selectgroup-button">{item.code}</span>
                                                                                        </label>
                                                                                    )

                                                                                    )
                                                                                ) : examenForm.codeExam === "S5" || examenForm.codeExam === "S6" ? (
                                                                                    mention3 && mention3.map(item => (
                                                                                        <label className="selectgroup-item" key={item.code}>
                                                                                            <input
                                                                                                onChange={() => handleCheckChangeFinal(item.code)}
                                                                                                type="checkbox"
                                                                                                name="classe"
                                                                                                value={item.code}
                                                                                                className="selectgroup-input"
                                                                                                checked={examenForm.classe.includes(item.code)}
                                                                                            />
                                                                                            <span className="selectgroup-button">{item.code}</span>
                                                                                        </label>
                                                                                    )

                                                                                    )
                                                                                ) : examenForm.codeExam === "S7" || examenForm.codeExam === "S8" ? (
                                                                                    mention4 && mention4.map(item => (
                                                                                        <label className="selectgroup-item" key={item.code}>
                                                                                            <input
                                                                                                onChange={() => handleCheckChangeFinal(item.code)}
                                                                                                type="checkbox"
                                                                                                name="classe"
                                                                                                value={item.code}
                                                                                                className="selectgroup-input"
                                                                                                checked={examenForm.classe.includes(item.code)}
                                                                                            />
                                                                                            <span className="selectgroup-button">{item.code}</span>
                                                                                        </label>
                                                                                    )

                                                                                    )
                                                                                ) : (
                                                                                    mention5 && mention5.map(item => (
                                                                                        <label className="selectgroup-item" key={item.code}>
                                                                                            <input
                                                                                                onChange={() => handleCheckChangeFinal(item.code)}
                                                                                                type="checkbox"
                                                                                                name="classe"
                                                                                                value={item.code}
                                                                                                className="selectgroup-input"
                                                                                                checked={examenForm.classe.includes(item.code)}
                                                                                            />
                                                                                            <span className="selectgroup-button">{item.code}</span>
                                                                                        </label>
                                                                                    )

                                                                                    )
                                                                                )

                                                                            }


                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className="modal-footer border-0">
                                                            <button
                                                                type="submit"
                                                                className="btn btn-success"
                                                            // disabled={isLoading}
                                                            >
                                                                <i className='fas fa-save'></i> &nbsp;&nbsp;
                                                                Enregistrer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                data-dismiss="modal"
                                                                onClick={closeModal}
                                                            // disabled={isLoading}
                                                            >
                                                                <i className='fas fa-times'></i>&nbsp;&nbsp;
                                                                Fermer
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    )
                                }

                                {/* Liste etudiants inscrits a l'examen */}
                                {
                                    isVisibleList && (
                                        <div
                                            className="modal fade show d-block"
                                            id="addRowModal"
                                            // tabindex="-1"
                                            role="dialog"
                                            aria-hidden="true"
                                        >

                                            <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
                                                <div className="modal-content">
                                                    <div className="modal-header border-0">
                                                        <h5 className="modal-title">
                                                            <span className="fw-mediumbold"> </span>
                                                            <span className="fw-light"> Liste des étudiants inscrit(e)s à l'examen {matiere} de la session {session} </span>
                                                        </h5>
                                                        <i className='fas fa-times fa-2x text-danger' onClick={closeListModal}></i>
                                                    </div>
                                                    <div className="modal-body">
                                                        <div className="row">
                                                            {/* <div className="table-responsive"> */}
                                                            <div className="col-md-12">

                                                                {/* <div className="card"> */}
                                                                {/* <div className="card-header">
                                                                        <div className="card-title">Journal de mes examens</div>
                                                                    </div> */}

                                                                {
                                                                    etudiantIsncrit && etudiantIsncrit.length > 0 ? (
                                                                        <div className="card-body">
                                                                            <table className="table table-bordered table-head-bg-info table-bordered-bd-info mt-4">
                                                                                <thead>
                                                                                    <tr className='text-center'>
                                                                                        <th scope='col'>Matricule</th>
                                                                                        <th scope="col">Nom & Prenom</th>
                                                                                        <th scope="col">Mention</th>
                                                                                        <th scope="col">Niveau</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className='text-center'>
                                                                                    {
                                                                                        etudiantIsncrit.map(item => (
                                                                                            <tr key={item.matricule}>
                                                                                                <td>{item.matricule}</td>
                                                                                                <td>{item.nomEtu} {item.prenomEtu}</td>
                                                                                                <td>{item.mention}</td>
                                                                                                <td>{item.niveau}</td>
                                                                                            </tr>
                                                                                        ))
                                                                                    }


                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    ) : (
                                                                        <div className='text-center fw-bold' style={{ fontSize: '20px' }}>Aucun candidat inscrit à cet examen</div>
                                                                    )
                                                                }


                                                            </div>
                                                            {/* </div> */}
                                                        </div>
                                                    </div>
                                                    <div className="modal-footer border-0">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-border"
                                                            onClick={ImprimerEtudiantsPDF}
                                                        >
                                                            <i className='fas fa-print'></i> &nbsp;&nbsp;
                                                            Imprimer
                                                        </button>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )
                                }


                                {
                                    isVisible && (
                                        <div className="modal-backdrop fade show"></div>
                                    )
                                }

                                {
                                    isVisibleList && (
                                        <div className="modal-backdrop fade show"></div>
                                    )
                                }


                                <div className="table-responsive">
                                    <DataTable
                                        className="table table-hover"
                                        columns={colonne}
                                        data={DonneFiltre}
                                        pagination
                                        highlightOnHover
                                        fixedHeader
                                        // fixedHeaderScrollHeight='300px'
                                        noDataComponent="Aucune donnee disponible"
                                        paginationComponentOptions={paginationComponentOptions}
                                        // striped
                                        // subHeader
                                        // subHeaderComponent={

                                        // }

                                        customStyles={{
                                            rows: {
                                                style: {
                                                    backgroundColor: '#f8f9fa',
                                                    '&:nth-of-type(odd)': {
                                                        backgroundColor: '#e9ecef'
                                                    },
                                                }
                                            },
                                            headCells: {
                                                style: {
                                                    backgroundColor: '#343a40',
                                                    color: '#ffffff',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center'
                                                },
                                            },
                                            cells: {
                                                style: {
                                                    textAlign: 'center',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ExamenContent;