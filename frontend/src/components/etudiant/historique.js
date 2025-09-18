import React, { useEffect, useState } from 'react'
import api from '../API/api';
import axios from 'axios';
import swal from 'sweetalert';

function HistoriqueContent() {

    const [histoData, setHistoData] = useState([]);

    const chargerHistoriques = () => {
        api.get("/historiques")
            .then((rep) => {
                // console.log(rep.data);
                if (rep.data.succes) {
                    setHistoData(rep.data.histo);
                }
            })
    };

    const formatDate = (dateHisto) => {
        const current = new Date(dateHisto);
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const hours = String(current.getHours()).padStart(2, '0');
        const minutes = String(current.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const deleteHistorique = (idHisto) => {
        swal({
            title: "Êtes-vous sûr ?",
            text: "Une fois supprimée, vous ne pourrez plus récupérer cette information !",
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

        }).then((willDelete) => {
            if (willDelete) {
                api.delete(`/historique/${idHisto}`)
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
                            chargerHistoriques();
                        }
                        else {
                            console.log(rep.data.erreur)
                            swal(`${rep.data.message}`, {
                                icon: "error",
                                buttons: {
                                    confirm: {
                                        className: "btn btn-success",
                                    },
                                },
                            });
                            chargerHistoriques();
                        }
                    })

            } else {
                swal.close();
            }
        });
    }

    useEffect(() => {
        chargerHistoriques();
    }, []);

    return (

        <div className="container">
            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Historique des inscriptions</h3>
                </div>
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-head-row card-tools-still-right">
                                <div className="card-title">Activités récentes</div>
                            </div>
                        </div>

                        <div className="card-body">
                            <ol className="activity-feed" style={{ padding: '20px' }}>
                                {
                                    histoData && histoData.length > 0 ? (
                                        histoData.map((data) => (
                                            <li className="feed-item feed-item-secondary">
                                                <time className="date">{formatDate(data.dateHisto)}</time>
                                                <span className="text fw-bold text-md">{data.motifHisto}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                                {
                                                    data.statutHisto === "Valide" ? (
                                                        <span className="badge badge-success fw-bold">{data.statutHisto}</span>
                                                    ) : data.statutHisto === "En attente" ? (
                                                        <span className="badge badge-warning fw-bold">{data.statutHisto}</span>
                                                    ) : (
                                                        <span className="badge badge-danger fw-bold">{data.statutHisto}</span>
                                                    )
                                                }

                                                <div className='float-end pt-1'>
                                                    <i className='fa fa-times text-danger' onClick={() => deleteHistorique(data.idHisto)} style={{ cursor: 'pointer', fontSize: '20px' }}></i>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="text-center">Aucun historique pour le moment.</div>
                                    )
                                }
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
}

export default HistoriqueContent;