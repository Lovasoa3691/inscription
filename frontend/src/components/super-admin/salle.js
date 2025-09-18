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

                                </div>
                            </div>
                            <div className="card-body">

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