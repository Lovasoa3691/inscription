import React, { useEffect, useState } from 'react'
import axios from 'axios';
import swal from 'sweetalert';
import api from '../API/api';
import Select from 'react-select';

function MyExamContent() {

    const [mesExamens, setMesExamens] = useState([]);

    const verifieEtatExamen = async () => {
        await api.get('/updateExamStatus')
            .then((rep) => {
                if (rep.data.succes) {
                    console.log(rep.data.examMiseAJour)
                    const resultat = rep.data.examMiseAJour;
                    if (resultat.length > 0) {
                        chargerExamens();
                    } else {
                        console.log("Aucun examen a mettre a jour")
                    }
                }
            })
            .catch((error) => {
                console.error('Erreur:', error);
            })
    }

    useEffect(() => {
        chargerExamens();
        const interval = setInterval(() => {
            verifieEtatExamen();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const chargerExamens = () => {
        api.get('/inscriptions')
            .then((rep) => {
                // console.log(rep.data);
                // setMatriculeEtu(rep.data.etu['matricule']);
                setMesExamens(rep.data);
                setDonneFiltre(rep.data);
            })
            .catch((error) => {
                // localStorage.removeItem('token');
                console.log("Erreur lors de la recuperation des donnees: ", error);
            })
    };

    const formatDate = (dateExam) => {
        const current = new Date(dateExam);
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0'); // Ajout de 1 car les mois commencent à 0
        const day = String(current.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`;
    };

    const handleDeleteExam = async (idInscription, event) => {

        const row = event.target.closest("tr")
        // setIdExam(row.getAttribute('data-key'));
        const cells = row.querySelectorAll("td")
        const statut = cells[5].textContent;

        if (statut === "En cours") {
            swal("Désolé ! Vous ne pouvez pas supprimer un examen en cours !", {
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
                title: "Êtes-vous sûr ?",
                text: "Une fois supprimé, vous ne pourrez plus récupérer cet information !",
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
                    api.delete(`inscription/${idInscription}`)
                        .then((rep) => {
                            if (rep.data.succes) {
                                swal(`Poof! ${rep.data.succes}`, {
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


    };

    const [selectedFiltre, setSelectedFiltre] = useState(null);
    const [donneeFiltre, setDonneFiltre] = useState([])

    const filtreOptions = [
        { value: null, label: "Tous" },
        { value: "Termine", label: "Terminé" },
        { value: "Annule", label: "Annulé" },
        { value: "En cours", label: "En cours" },
    ]

    useEffect(() => {
        filtrerData(selectedFiltre);
        console.log(selectedFiltre);
    }, [selectedFiltre]);

    const filtrerData = (selected) => {
        const filtered = mesExamens.filter(item =>
            !selected || !selected.value || item.statut === selected.value
        );
        setDonneFiltre(filtered);
    };

    const handleFiltreChange = (selected) => {
        setSelectedFiltre(selected);
    };

    return (
        <div className="container">

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Calendriers de mes examens</h3>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center">
                                    <div className="card-tools d-flex align-items-center">

                                        {/* <div className="dropdown">
                                            <button
                                                className="btn btn-label-success btn-round btn-sm dropdown-toggle"
                                                type="button"
                                                id="dropdownMenuButton"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                            >
                                                Exporter
                                            </button>

                                        </div> */}

                                    </div>
                                    {/* <div
                                        className=" ms-auto"
                                    // data-bs-toggle="modal"
                                    // data-bs-target="#addRowModal"
                                    // onClick={openModal}
                                    > <label className='label-control'> Filtrer par : &nbsp;&nbsp;&nbsp;</label>
                                        <Select
                                            options={filtreOptions}
                                            placeholder="Selectionner"
                                            value={selectedFiltre}
                                            onChange={handleFiltreChange}
                                            isClearable
                                        />
                                    </div> */}
                                </div>
                            </div>
                            <div className="card-body">

                                <div className="table-responsive">
                                    <div className="col-md-12">

                                        {/* <div className="card"> */}
                                        {/* <div className="card-header">
                                            <div className="card-title">Journal de mes examens</div>
                                        </div> */}
                                        <div className="card-body">

                                            {
                                                donneeFiltre && donneeFiltre.length > 0 ? (
                                                    <table className="table table-bordered table-head-bg-info table-bordered-bd-info mt-4">
                                                        <thead>
                                                            <tr className='text-center'>
                                                                <th scope="col">SESSION</th>
                                                                <th scope="col">DATE</th>
                                                                <th scope="col">MATIÈRE</th>
                                                                <th scope="col">HORAIRE</th>
                                                                <th scope="col">DURÉE</th>
                                                                <th scope="col">STATUT</th>
                                                                <th scope="col">ACTIONS</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {

                                                                donneeFiltre.map((ex) => (
                                                                    <tr key={ex.mon_inscription._id} data-key={ex.mon_inscription._id} className='text-center fw-bold'>
                                                                        <td>{ex.mon_examen.codeExam}</td>
                                                                        <td>{formatDate(ex.mon_examen.dateExam)}</td>
                                                                        <td>{ex.mon_examen.matiere}</td>
                                                                        <td>{ex.mon_examen.heureDebut} - {ex.mon_examen.heureFin}</td>
                                                                        <td>{ex.mon_examen.duree}</td>
                                                                        <td>
                                                                            <span className={ex.mon_examen.statut === "Termine" ? "badge badge-primary fw-bold" : ex.mon_examen.statut === "En cours" ? "badge badge-warning fw-bold" : "badge badge-danger fw-bold"}>{ex.mon_examen.statut}</span>
                                                                        </td>
                                                                        <td>
                                                                            <i className='fa fa-times text-danger'
                                                                                onClick={(e) => handleDeleteExam(ex.mon_inscription._id, e)}
                                                                                style={{ fontSize: '20px', cursor: 'pointer' }}></i>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="text-center">Vous n'avez pas encore de nouvelles sessions d'examens à suivre</div>
                                                )
                                            }

                                        </div>
                                        {/* </div> */}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default MyExamContent;