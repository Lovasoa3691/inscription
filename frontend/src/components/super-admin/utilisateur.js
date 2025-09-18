import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
// import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import api from '../API/api';
import swal from 'sweetalert';

function UtilisateurContent() {

    const colonne = [
        // {
        //     name: "_ID",
        //     selector: row => row._id,
        //     sortable: true,
        // },
        // {
        //     name: "_ID",
        //     selector: row => row.ID_EXAM,
        //     sortable: true,
        // },
        {
            name: "NOM UTILISATEUR",
            selector: row => row.nom_ut,
            sortable: true,
        },
        {
            name: "EMAIL",
            selector: row => row.email,
            sortable: true,
        },
        {
            name: "ROLE",
            selector: row => row.role,
            sortable: true,
        },

    ];


    const [search, setSearch] = useState("");
    const [filtre, setFiltre] = useState([]);
    const [utilisateurData, setutilisateurData] = useState([]);

    const getColorForLetter = (letter) => {
        const firstLetter = letter.toUpperCase();
        if ("ABCD".includes(firstLetter)) { return 'blue'; }
        else if ("EFGH".includes(firstLetter)) { return 'red'; }
        else if ("IJKL".includes(firstLetter)) { return 'green'; }
        else if ("MNOP".includes(firstLetter)) { return 'purple'; }
        else if ("QRST".includes(firstLetter)) { return 'orange'; }
        else if ("UVWX".includes(firstLetter)) { return 'pink'; }
        else if ("YZ".includes(firstLetter)) { return 'yellow'; }
        else {
            return 'black';
        }
    }

    useEffect(() => {
        chargerUtilisateurs();
    }, []);


    const chargerUtilisateurs = () => {
        api.get('/utilisateur/all')
            .then((rep) => {
                // console.log(rep.data);
                setutilisateurData(rep.data.users);
                setFiltre(rep.data.users);
            })
            .catch(error => {
                console.log("Erreur lors de la recuperation des donnees: ", error);
            })
    };

    const desactiverUtilisateur = (item) => {
        if (item.statut_ut === "En ligne") {
            swal("Desole ! L'utilisateur est en ligne pour le moment. Nous ne pouvons la desactiver maintenant.", {
                title: 'Interruption',
                icon: "error",
                buttons: {
                    confirm: {
                        className: "btn btn-success",
                    },
                },
            });
        } else {
            swal({
                title: "Etes-vous sur?",
                text: "Une fois supprime, vous ne pourrez plus retourner en arriere !",
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
                    api.put(`/utilisateur/update/${item._id}`)
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
                                chargerUtilisateurs();
                            } else {
                                swal(`${rep.data.message}`, {
                                    icon: "error",
                                    buttons: {
                                        confirm: {
                                            className: "btn btn-success",
                                        },
                                    },
                                });
                                chargerUtilisateurs();
                            }
                        })

                } else {
                    swal.close();
                }
            });
        }
    }


    const supprimerUtilisateur = (item) => {
        if (item.statut_ut === "En ligne") {
            swal("Desole ! L'utilisateur est en ligne pour le moment. Nous ne pouvons la supprimer", {
                title: 'Interruption',
                icon: "error",
                buttons: {
                    confirm: {
                        className: "btn btn-success",
                    },
                },
            });
        } else {
            swal({
                title: "Etes-vous sur?",
                text: "Une fois supprime, vous ne pourrez plus retourner en arriere !",
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
                    // console.log(item._id)
                    api.delete(`/utilisateur/delete/${item._id}`)
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
                                chargerUtilisateurs();
                            } else {
                                swal(`${rep.data.message}`, {
                                    icon: "error",
                                    buttons: {
                                        confirm: {
                                            className: "btn btn-success",
                                        },
                                    },
                                });
                                chargerUtilisateurs();
                            }
                        })

                } else {
                    swal.close();
                }
            });
        }
    }

    const [isVisible, setVisible] = useState(false);

    const [UtData, setUtData] = useState({
        nomSec: '',
        prenomsec: '',
        nomUt: '',
        email: '',
        mdp: '',
    })

    const handleChangeData = (e) => {
        const { name, value } = e.target;
        setUtData({ ...UtData, [name]: value });
    }

    const openModal = () => {
        setVisible(true);
    }

    const closeModal = () => {
        setVisible(false);
    }

    const createUser = (e) => {
        e.preventDefault();
        // console.log(examenForm)
        api.post('/utilisateur/save', UtData)
            .then((rep) => {
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
                chargerUtilisateurs();
            })
            .catch((err) => {
                console.log("Erreur: ", err.message)
            })
    }


    return (
        <div className="container">

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des utilisateurs</h3>
                </div>


                {
                    isVisible && (
                        <div
                            className="modal fade show d-block"
                            id="addRowModal"
                            // tabindex="-1"
                            role="dialog"

                        >
                            <form onSubmit={createUser}>
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header border-0">
                                            <h5 className="modal-title">
                                                <span className="fw-mediumbold"> Nouvel</span>
                                                <span className="fw-light"> utilisateur </span>
                                            </h5>
                                            <i className='fas fa-texts fa-2x text-danger' onClick={closeModal}></i>
                                        </div>
                                        <div className="modal-body">
                                            {/* <p className="small">
                                                    Vous devraiz remplir tous les champs
                                                </p> */}

                                            <div className="row">
                                                <div className="col-md-6 pe-0">
                                                    <div className="form-group">
                                                        <label>Nom</label>
                                                        <input
                                                            onChange={handleChangeData}
                                                            value={UtData.nomSec}
                                                            name="nomSec"
                                                            type="text"
                                                            className="form-control"

                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Prenom</label>
                                                        <input
                                                            onChange={handleChangeData}
                                                            value={UtData.prenomsec}
                                                            name="prenomsec"
                                                            type="text"
                                                            className="form-control"

                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="form-group">
                                                        <label>Nom d'utilisateur</label>
                                                        <input
                                                            onChange={handleChangeData}
                                                            value={UtData.nomUt}
                                                            type="text"
                                                            className="form-control"
                                                            name="nomUt"

                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="form-group">
                                                        <label>Adresse mail</label>
                                                        <input
                                                            onChange={handleChangeData}
                                                            value={UtData.email}
                                                            type="email"
                                                            className="form-control"
                                                            name="email"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="form-group">
                                                        <label>Mot de passe</label>
                                                        <input type="password"
                                                            onChange={handleChangeData}
                                                            value={UtData.mdp}
                                                            className='form-control'
                                                            name='mdp'
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                        <div className="modal-footer border-0">
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                            >
                                                <i className='fas fa-save'></i> &nbsp;&nbsp;
                                                Enregistrer
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                data-dismiss="modal"
                                                onClick={closeModal}
                                            >
                                                <i className='fas fa-texts'></i>&nbsp;&nbsp;
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

                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center">
                                    {/* <h4 className="card-title">Add Row</h4> */}
                                    <button
                                        className="btn btn-primary btn-round ms-auto"
                                        // data-bs-toggle="modal"
                                        // data-bs-target="#addRowModal"
                                        onClick={openModal}
                                    >
                                        <i className="fa fa-plus"></i>&nbsp;
                                        Nouveau
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <div className="col-md-12">
                                        <div className="card card-round">

                                            <div className="card-body p-0">
                                                <div className="table-responsive">

                                                    <table className="table align-items-center mb-0">
                                                        <thead className="thead-light">
                                                            <tr>
                                                                {/* <th scope="col">Numero de paiement</th> */}
                                                                <th scope="col" className="text-start">NOM UTILISATEUR</th>
                                                                <th scope="col" className="text-start">EMAIL</th>
                                                                <th scope="col" className="text-start">ROLE</th>
                                                                <th scope="col" className="text-start">STATUT</th>
                                                                <th scope="col" className="text-center">ACTIONS</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className='fw-bold'>

                                                            {
                                                                utilisateurData && utilisateurData.map(item => (
                                                                    <tr key={item._id}>

                                                                        <td className="text-start d-flex align-items-center">
                                                                            <div className={item.statut_ut === "Online" ? "avatar avatar-online" : item.statut_ut === "Offline" ? "avatar avatar-offline" : "avatar avatar-away"}>
                                                                                <span
                                                                                    className="avatar-title rounded-circle border border-white"
                                                                                    style={{ backgroundColor: getColorForLetter(item.nom_ut.charAt(0)) }}
                                                                                >{item.nom_ut.charAt(0)}</span>
                                                                            </div> &nbsp;&nbsp;
                                                                            <div>
                                                                                {item.nom_ut}
                                                                            </div>

                                                                        </td>

                                                                        <td className="text-start">{item.email}</td>
                                                                        <td className="text-start">
                                                                            {item.role}
                                                                        </td>
                                                                        <td className="text-start">
                                                                            {item.statut_ut}
                                                                        </td>
                                                                        <td className="text-center" style={{ fontSize: '20px' }}>
                                                                            {
                                                                                item.statut_ut === "Active" ? (
                                                                                    <i className="fas fa-eye-slash" style={{ cursor: 'pointer' }}
                                                                                        onClick={() => desactiverUtilisateur(item)}
                                                                                    ></i>

                                                                                ) : (
                                                                                    <i className="fas fa-eye" style={{ cursor: 'pointer' }}
                                                                                        onClick={() => desactiverUtilisateur(item)}
                                                                                    ></i>

                                                                                )
                                                                            }
                                                                            &nbsp;&nbsp;
                                                                            <i className="fas fa-trash text-danger"
                                                                                onClick={() => supprimerUtilisateur(item)}
                                                                                style={{ cursor: 'pointer' }}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default UtilisateurContent;