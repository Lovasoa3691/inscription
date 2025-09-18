import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
// import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import api from '../API/api';
import swal from 'sweetalert';

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
        // {
        //     name: "ACTION",
        //     cell: (row) => (
        //         <div className="form-button-action" style={{ fontWeight: 'normal', fontSize: '20px' }}>

        //             <i className="fas fa-file-alt text-primary"
        //                 onClick={() => afficherListeEtudiantInscrit(row)}
        //                 title="Inscriptions"
        //             ></i>

        //         </div>
        //     )
        // },
    ];


    const [search, setSearch] = useState("");
    const [filtre, setFiltre] = useState([]);
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

    const paginationComponentOptions = {
        rowsPerPageText: "Lignes par page",
        rangeSeparatorText: "de",
        noRowsPerPage: false, // Cacher l'option "rows per page" si souhaité
        selectAllRowsItem: true,
        selectAllRowsItemText: "Tout",
    };

    const chargerExamens = () => {

        api.get('/examens/all')
            .then((rep) => {
                setExamData(rep.data.examens);
                setDonneFiltre(rep.data.examens);
                // setFiltre(rep.data);
            })
            .catch(error => {
                console.log("Erreur lors de la recuperation des donnees: ", error);
            })
    };

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

    // useEffect(() => {
    //     chargerExamens();
    // }, []);

    const [isVisibleList, setVisibleList] = useState(false);


    const [etudiantIsncrit, setEtudiantInscrit] = useState([]);

    const [matiere, setMatiere] = useState('');
    const [session, setSession] = useState('');

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

    const closeListModal = () => {
        setVisibleList(false);
    }

    return (
        <div className="container">

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des sessions d'examen mises en place</h3>
                </div>

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
                                            <span className="fw-light"> Liste des étudiants inscrits à l'examen {matiere} de la session {session} </span>
                                        </h5>
                                        <i className='fas fa-times fa-2x text-danger' onClick={closeListModal}></i>
                                    </div>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="table-responsive">
                                                <div className="col-md-12">

                                                    {/* <div className="card"> */}
                                                    {/* <div className="card-header">
                                                                        <div className="card-title">Journal de mes examens</div>
                                                                    </div> */}
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
                                                                    etudiantIsncrit && etudiantIsncrit.length > 0 ? (
                                                                        etudiantIsncrit.map(item => (
                                                                            <tr key={item.matricule}>
                                                                                <td>{item.matricule}</td>
                                                                                <td>{item.nomEtu} {item.prenomEtu}</td>
                                                                                <td>{item.mention}</td>
                                                                                <td>{item.niveau}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <div className='text-center'>Aucun étudiant inscrit</div>
                                                                    )
                                                                }

                                                            </tbody>
                                                        </table>
                                                    </div>


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-border"
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
                    isVisibleList && (
                        <div className="modal-backdrop fade show"></div>
                    )
                }


                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center">
                                    {/* <h4 className="card-title">Add Row</h4> */}
                                    <input
                                        type='text'
                                        placeholder='Recherche'
                                        className='ms-auto'
                                        value={search}
                                        onChange={searchChange}
                                        style={{
                                            padding: '7px',
                                            width: '300px',
                                            fontSize: '16px',
                                            border: '1px solid #ddd',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="card-body">

                                <div className="table-responsive">
                                    <DataTable
                                        className="table table-hover"
                                        columns={colonne}
                                        data={DonneFiltre}
                                        pagination
                                        highlightOnHover
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