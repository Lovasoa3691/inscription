import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
// import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import api from '../API/api';
import swal from 'sweetalert';

function SalleContent() {

    const colonne = [
        // {
        //     name: "_ID",
        //     selector: row => row._id,
        //     sortable: true,
        // },
        {
            name: "IDENTIFIANT",
            selector: row => row.idSalle,
            sortable: true,
        },
        {
            name: "NUM_SALLE",
            selector: row => row.numSalle,
            sortable: true,
        },
        {
            name: "CAPACITE",
            selector: row => row.capacite,
            sortable: true,
        },
        {
            name: "LOCALISATION",
            selector: row => row.localisation,
            sortable: true,
        },
        {
            name: "ACTIONS",
            cell: (row) => (
                <div className="form-button-action" style={{ fontWeight: 'normal', fontSize: '20px' }}>
                    <i className="fas fa-edit text-primary"
                        onClick={() => openModalEdit(row)}></i>
                    &nbsp; &nbsp;
                    <i className="fas fa-trash-alt text-danger"
                        onClick={() => deleteSalle(row.idSalle)}></i>
                </div>
            )

        },
    ];


    const [search, setSearch] = useState("");
    const [filtre, setFiltre] = useState([]);
    const [salleData, setSalleData] = useState([]);
    const [salleForm, setSalleForm] = useState({
        idSalle: '', numSalle: '', capacite: '', localisation: ''
    })

    const [isVisible, setVisible] = useState(false);
    const [btnLabel, setBtnLabel] = useState('Enregistrer');
    const [isEdit, setIsEdit] = useState(false);

    const viderChamp = () => {
        salleForm.idSalle = ''
        salleForm.numSalle = ''
        salleForm.capacite = ''
        salleForm.localisation = ''
    }

    const chargerSalles = () => {

        api.get('/salles')
            .then((rep) => {
                // console.log(rep.data);
                setSalleData(rep.data.salle);
                // setFiltre(rep.data);
            })
            .catch(error => {
                console.log("Erreur lors de la recuperation des donnees: ", error);
            })
    };

    useEffect(() => {
        chargerSalles();
    }, []);

    const saveSalle = (e) => {
        e.preventDefault();
        api.post('/salles/save', salleForm)
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
                chargerSalles();
            })
            .catch((err) => {
                console.log("Erreur: ", err.message)
            })
    }

    const updateSalle = (e) => {
        e.preventDefault();
        api.put(`/salles/update/${salleForm.idSalle}`, salleForm)
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
                chargerSalles();
            })
            .catch((err) => {
                console.log("Erreur: ", err.message)
            })
    }

    const deleteSalle = (idSalle) => {
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
                api.delete(`/salles/delete/${idSalle}`)
                    .then((rep) => {

                        swal(`${rep.data.message}`, {
                            icon: "success",
                            buttons: false,
                            timer: 1000,
                        });
                        chargerSalles();
                    })
                    .catch((err) => {
                        console.log(err.message)
                    })
            }
        });

    }

    const handleChangeData = (e) => {
        const { name, value } = e.target;
        setSalleForm({ ...salleForm, [name]: value });
    }


    const openModalEdit = (data) => {
        setVisible(true)
        setIsEdit(true);
        setBtnLabel('Mettre à jour');

        salleForm.idSalle = data.idSalle
        salleForm.numSalle = data.numSalle
        salleForm.capacite = data.capacite
        salleForm.localisation = data.localisation
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


    const paginationComponentOptions = {
        rowsPerPageText: "Lignes par page",
        rangeSeparatorText: "de",
        noRowsPerPage: false, // Cacher l'option "rows per page" si souhaité
        selectAllRowsItem: true,
        selectAllRowsItemText: "Tout",
    };

    return (
        <div className="container">

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des salles</h3>
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center">
                                    {/* <h4 className="card-title">Add Row</h4> */}
                                    <button
                                        className="btn btn-primary btn-round btn-border ms-auto"
                                        // data-bs-toggle="modal"
                                        // data-bs-target="#addRowModal"
                                        onClick={openModal}
                                    >
                                        <i className="fa fa-plus">&nbsp;&nbsp;</i>
                                        Nouvelle salle
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
                                            aria-hidden="true"
                                        >
                                            <form onSubmit={isEdit ? updateSalle : saveSalle}>
                                                <div className="modal-dialog" role="document">
                                                    <div className="modal-content">
                                                        <div className="modal-header border-0">
                                                            <h5 className="modal-title">
                                                                <span className="fw-mediumbold"> Nouvel</span>
                                                                <span className="fw-light"> enregistrement </span>
                                                            </h5>

                                                            <span aria-hidden="true" className='fas fa-2x fa-times text-danger' onClick={closeModal}></span>

                                                        </div>
                                                        <div className="modal-body">


                                                            <div className="row">

                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Numéro de la salle</label>
                                                                        <input
                                                                            onChange={handleChangeData}
                                                                            value={salleForm.numSalle}
                                                                            type="text"
                                                                            className="form-control"
                                                                            name="numSalle"
                                                                            placeholder=""
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Capacité</label>
                                                                        <input
                                                                            onChange={handleChangeData}
                                                                            value={salleForm.capacite}
                                                                            type="number"
                                                                            className="form-control"
                                                                            name="capacite"
                                                                            placeholder=""
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Localisation</label>
                                                                        <select
                                                                            onChange={handleChangeData}
                                                                            value={salleForm.localisation}
                                                                            name="localisation"
                                                                            className="form-select"
                                                                        >
                                                                            <option value="Rée de chaussé">Rée de chaussé</option>
                                                                            <option value="1ere étage">1ere étage</option>
                                                                            <option value="2eme étage">2eme étage</option>

                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className="modal-footer border-0">
                                                            <button
                                                                type="submit"
                                                                className="btn btn-success"
                                                            >
                                                                <i className='fas fa-save'></i>&nbsp;&nbsp;
                                                                Enregistrer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                // data-dismiss="modal"
                                                                onClick={closeModal}
                                                            >
                                                                <i className='fas fa-times'></i>&nbsp;&nbsp;
                                                                Annuler
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </form>

                                        </div>
                                    )
                                }

                                {isVisible && (
                                    <div className='modal-backdrop fade show'></div>
                                )}

                                <div className="table-responsive">
                                    <DataTable
                                        className="table table-hover"
                                        columns={colonne}
                                        data={salleData}
                                        pagination
                                        highlightOnHover
                                        paginationComponentOptions={paginationComponentOptions}
                                        // striped
                                        // subHeader
                                        // subHeaderComponent={
                                        //     <input
                                        //         type='text'
                                        //         placeholder='Recherche'
                                        //         value={search}
                                        //         onChange={(e) => setSearch(e.target.value)}

                                        //         style={{
                                        //             padding: '10px',
                                        //             width: '300px',
                                        //             fontSize: '16px',
                                        //             border: '1px solid #ddd',
                                        //         }}
                                        //     />
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

export default SalleContent;