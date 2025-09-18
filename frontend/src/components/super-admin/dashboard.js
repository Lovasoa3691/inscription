
import { useEffect, useState } from "react";
import LineChart from "../../chart/lineChart";
import PieChart from "../../chart/pieChart";
import BarChart from "../../chart/barChart";
import { Sparklines, SparklinesLine, SparklinesBars, SparklinesSpots } from "react-sparklines";
import axios from "axios";
import api from "../API/api";


const Dashboard = () => {

    const [data, setData] = useState(0);
    const [examCount, setExamCount] = useState(0);
    const [examProcessingCount, setExamProcessingCount] = useState(0);
    const [examTermineCount, setExamTermineCount] = useState(0);
    const [examAnnuleCount, setExamAnnuleCount] = useState(0);
    const [insCount, setInsCount] = useState(0);
    const [examEnCours, setExamEnCours] = useState([]);

    const getDataInfo = () => {
        api.get('/etudiants/count')
            .then((rep) => {
                setData(rep.data)
            })
    }

    const getExamCount = () => {
        api.get('/examens/all/count')
            .then((rep) => {
                setExamCount(rep.data.examCount)
            })
    }

    const getExamProcessCount = () => {
        api.get('/examens/encours/count')
            .then((rep) => {
                setExamProcessingCount(rep.data.examCount)
                setExamTermineCount(rep.data.examTermine)
                setExamAnnuleCount(rep.data.examAnnule)
            })
    }

    const getInsCount = () => {
        api.get('/inscriptions/etudiants/all')
            .then((rep) => {
                setInsCount(rep.data.inscriptionCount)
            })
    }

    const getAllExamEnCours = () => {
        api.get('/examens/encours')
            .then((rep) => {
                // console.log(rep.data)
                setExamEnCours(rep.data);
            })
    }

    const formatDate = (dateReception) => {
        const current = new Date(dateReception);
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        // const hours = String(current.getHours()).padStart(2, '0');
        // const minutes = String(current.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        getDataInfo();
        getExamCount();
        getExamProcessCount();
        getInsCount();
        getAllExamEnCours();
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            getAllExamEnCours();
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="container">
            <div className="page-inner">
                <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
                    <div>
                        <h3 className="fw-bold mb-3">Tableau de bord</h3>
                    </div>
                </div>
                <div className="row mt--4">
                    <div className="col-sm-6 col-lg-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <span className="stamp stamp-md bg-secondary me-3">
                                    <i className="fa fa-calendar"></i>
                                </span>
                                <div>
                                    <h5 className="mb-1">
                                        <b
                                        ><a>{examCount} <small></small></a></b
                                        >
                                    </h5>
                                    <small className="text-muted">Examens planifiés</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <span className="stamp stamp-md bg-warning me-3">
                                    <i className="fas fa-hourglass"></i>
                                </span>
                                <div>
                                    <h5 className="mb-1">
                                        <b
                                        ><a>{examProcessingCount} <small>En Cours</small></a></b
                                        >
                                    </h5>
                                    <small className="text-muted">{examTermineCount} Terminé / {examAnnuleCount} Annulé</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <span className="stamp stamp-md bg-success me-3">
                                    <i className="fas fa-graduation-cap"></i>
                                </span>
                                <div>
                                    <h5 className="mb-1">
                                        <b
                                        ><a>{data} <small></small></a></b
                                        >
                                    </h5>
                                    <small className="text-muted">Total étudiants</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="card p-3">
                            <div className="d-flex align-items-center">
                                <span className="stamp stamp-md bg-danger me-3">
                                    <i className="fa fa-users"></i>
                                </span>
                                <div>
                                    <h5 className="mb-1">
                                        <b
                                        ><a>{insCount} <small></small></a></b
                                        >
                                    </h5>
                                    <small className="text-muted">Etudiants inscrit(e)s</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4">
                        <div className="card card-round">
                            <div className="card-header">
                                <div className="card-head-row">
                                    <div className="card-title">Statistiques des étudiants</div>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="chart-container" >
                                    <PieChart></PieChart>
                                    {/* <BarChart></BarChart> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Les prochains examens à suivre</div>
                            </div>
                            <div className="card-body">

                                {
                                    examEnCours && examEnCours.length > 0 ? (


                                        <table className="table table-head-bg-primary mt-0">

                                            <thead>
                                                <tr>
                                                    <th scope="col">Date</th>
                                                    <th scope="col">Matiere</th>
                                                    <th scope="col">Horaire</th>
                                                    <th scope="col">classe</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    examEnCours.map((exam) => (
                                                        <tr key={exam.examen.idExam}>
                                                            <td>{formatDate(exam.examen.dateExam)}</td>
                                                            <td>{exam.examen.matiere}</td>
                                                            <td>{exam.examen.heureDebut} - {exam.examen.heureFin}</td>
                                                            <td>{exam.examen.classe.join(', ')}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>

                                        </table>

                                    ) : (
                                        <div className="text-center">Aucun examen en cours disponible</div>
                                    )
                                }


                            </div>
                        </div>
                    </div>
                </div>

                {
                    examEnCours && examEnCours.length > 0 ? (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-header">
                                        <div className="d-flex align-items-center">

                                            <h5 className="card-title">Prochain examen: [{examEnCours[0].examen.matiere} - {formatDate(examEnCours[0].examen.dateExam)}] ( {examEnCours[0].infoEtudiant.length} étudiants inscrits )</h5>


                                        </div>
                                    </div>
                                    <div className="card-body">

                                        <div className="col-md-12">
                                            <div className="card card-round">

                                                {
                                                    examEnCours[0] && examEnCours[0].infoEtudiant.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <table className="table align-items-center mb-0">
                                                                <thead className="thead-light">
                                                                    <tr>
                                                                        {/* <th scope="col">Numero de paiement</th> */}
                                                                        <th scope="col" className="text-start">MATRICULE</th>
                                                                        <th scope="col" className="text-start">NOM & PRENOM</th>
                                                                        <th scope="col" className="text-start">MENTION</th>
                                                                        <th scope="col" className="text-start">NIVEAU</th>

                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {
                                                                        examEnCours[0].infoEtudiant.map((etu) => (
                                                                            <tr key={etu.matricule}>
                                                                                <td>{etu.matricule}</td>
                                                                                <td>{etu.momEtu} {etu.prenomEtu}</td>
                                                                                <td>{etu.mention}</td>
                                                                                <td>{etu.niveau}</td>
                                                                            </tr>
                                                                        ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">Aucun étudiant inscrit à cet examen</div>
                                                    )
                                                }
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted"></span>
                    )
                }
            </div>
        </div>
    )
}

export default Dashboard;