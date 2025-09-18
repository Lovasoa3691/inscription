
import { useEffect, useState } from "react";
import { Sparklines, SparklinesLine, SparklinesBars, SparklinesSpots } from "react-sparklines";

import api from "../API/api";
import Swal from "sweetalert2";


const Dashboard = () => {

    const [notificationRecent, setNotificationRecent] = useState([]);
    const [prochaineExam, setProchaineExam] = useState([]);
    const nom = "INSTITUT DE FORMATION TECHNIQUIE"
    const [timeLeft, setTimeLeft] = useState({
        j: 0, h: 0, min: 0, sec: 0
    });
    const [minDate, setMinDate] = useState('Non identifie');
    const [mat, setMat] = useState('Aucun');
    const [nbExamEnCours, setNbExamEnCours] = useState('');
    const [nbInscription, setNbInscription] = useState('');
    const [erreur, setErreur] = useState(null);


    const formatDate = (date) => {
        const current = new Date(date);
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0'); // Ajout de 1 car les mois commencent à 0
        const day = String(current.getDate()).padStart(2, '0');
        const hours = String(current.getHours()).padStart(2, '0');
        const minutes = String(current.getMinutes()).padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}`;
    };

    const formatDate2 = (date) => {
        const current = new Date(date);
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`;
    };


    const getColorForLetter = (letter) => {
        const firstLetter = letter.toUpperCase();
        if ("AHOU".includes(firstLetter)) { return 'blue'; }
        else if ("BIPV".includes(firstLetter)) { return 'red'; }
        else if ("CJQW".includes(firstLetter)) { return 'green'; }
        else if ("DKRX".includes(firstLetter)) { return 'purple'; }
        else if ("ELSY".includes(firstLetter)) { return 'orange'; }
        else if ("FMTZ".includes(firstLetter)) { return 'pink'; }
        else if ("GN".includes(firstLetter)) { return 'yellow'; }
        else {
            return 'black';
        }
    }


    const showNotificationDetails = (notification) => {

        localStorage.setItem('countNotify', '0');

        Swal.fire({
            title: `<h3><strong>${notification.notificationOriginal.titre}</strong></h3>`,
            html: `
                <div>
                    <p><strong>Objet :</strong> ${notification.notificationOriginal.objet}</p>
                    <p><strong>Date et Heure : </strong> ${formatDate(notification.ma_notification.dateRecept)}</p>
                </div>
            `,
            confirmButtonColor: 'Fermer',
            customClass: {
                confirmButton: '',
                popup: '',
            },
            buttonsStyling: true,
        }).then((result) => {
            if (result.isConfirmed) {
                updateNotificationStatut(notification.ma_notification.idNot);
                getNotificationRecents();
            }
        })
    };

    const updateNotificationStatut = async (idNot) => {
        try {
            const rep = await api.put(`/notificationEtu/${idNot}`)

            if (rep.data.succes) {
                console.log("Succes")
            } else {
                console.log(rep.data.message)
            }
        } catch (error) {
            console.log("Serveur est indisponible pour le moment");
            setErreur("Serveur est indisponible pour le moment. Veullez ressayer s'il vous plait");
        }
    }

    const getProchaineExam = () => {
        try {
            api.get('/prochaineExam')
                .then((rep) => {
                    // console.log(rep.data);
                    setProchaineExam(rep.data.examenTries);
                })
        } catch (error) {
            console.log("Serveur est indisponible pour le moment");
            setErreur("Serveur est indisponible pour le moment. Veullez ressayer s'il vous plait");
        }

    }

    const getIntervaleTemps = () => {
        if (prochaineExam.length > 0 && prochaineExam[0].dateExam) {
            const now = new Date();
            const examDate = new Date(prochaineExam[0].dateExam);
            const diff = examDate.getTime() - now.getTime();
            // console.log(diff);

            if (diff > 0) {
                return {
                    j: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    min: Math.floor((diff / (1000 * 60)) % 60),
                    sec: Math.floor((diff / 1000) % 60),
                };
            } else {
                return {
                    j: 0, h: 0, min: 0, sec: 0
                };
            }
        } else {
            console.error("Date de l'examen non definie");
            return {
                j: 0, h: 0, min: 0, sec: 0
            };
        }

    }

    const getNotificationRecents = () => {
        try {
            api.get('/notification/recents')
                .then((rep) => {
                    // console.log(rep.data)
                    setNotificationRecent(rep.data);
                })
        } catch (error) {
            console.log("Serveur est indisponible pour le moment");
            setErreur("Serveur est indisponible pour le moment. Veullez ressayer s'il vous plait");
        }

    }

    const getInscriptionValideCount = () => {
        try {
            api.get('/examen/count')
                .then((rep) => {
                    console.log(rep.data);
                    setNbExamEnCours(rep.data.examEnCoursCount);
                    setNbInscription(rep.data.nbInscriptionValide)
                })
        } catch (error) {
            console.log("Serveur est indisponible pour le moment");
            setErreur("Serveur est indisponible pour le moment. Veullez ressayer s'il vous plait");
        }

    }

    const chargerProchaineInsc = () => {
        try {
            api.get('/inscriptions')
                .then((rep) => {
                    // console.log(rep.data);
                    setMinDate(rep.data[0].mon_examen.dateExam);
                    // setMat(rep.data[0].mon_examen.matiere);
                })
                .catch((error) => {
                    console.log("Erreur lors de la recuperation des donnees: ", error);
                })
        } catch (error) {
            console.log("Serveur est indisponible pour le moment");
            setErreur("Serveur est indisponible pour le moment. Veullez ressayer s'il vous plait");
        }
    }

    useEffect(() => {
        getNotificationRecents();
        getProchaineExam();
        getInscriptionValideCount();
        // setdateExamen(prochaineExam[0].dateExam);
        const interval = setInterval(() => {
            getNotificationRecents();
            getProchaineExam();
            getInscriptionValideCount();
        }, 5000);

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        if (prochaineExam && prochaineExam.length > 0) {
            const timer = setInterval(() => {
                setTimeLeft(getIntervaleTemps());
                setMat(prochaineExam[0].matiere);
            }, 1000);

            return () => clearInterval(timer);
        }

    }, [prochaineExam]);

    useEffect(() => {
        chargerProchaineInsc();
        const timer = setInterval(() => {
            chargerProchaineInsc();
        }, 1000);

        return () => clearInterval(timer);
    }, [])

    const createSuperAdmin = () => {
        api.post('/utilisateur/create-admin')
            .then((rep) => {
                alert(rep.data.message)
            });
    }



    return (
        <div className="container">
            {erreur ? (
                <div className="erreur text-center">{erreur}</div>
            ) : (
                <div className="page-inner">
                    <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
                        {/* <div>
                        <h3 className="fw-bold mb-3">Tableau de bord</h3>
                    </div> */}

                    </div>

                    <div className="row">
                        {/* <button onClick={createSuperAdmin}>Nouveau Admin</button> */}
                        <div className="col-md-4">
                            <div className="card card-secondary bg-secondary-gradient">
                                <div className="card-body skew-shadow">
                                    <img
                                        src="/assets/img/hourglass.png"
                                        height="12.5"
                                        alt=""
                                    />
                                    <h2 className="py-4 mb-0">Examens en cours</h2>
                                    <div className="row">
                                        <div className="col-8 pe-0">
                                            <h3 className="fw-bold mb-1">Semaine du</h3>
                                            {
                                                minDate === "" ? (
                                                    <div className="text-md text-uppercase fw-bold op-8">
                                                        Non identifié
                                                    </div>
                                                ) : (
                                                    <div className="text-md text-uppercase fw-bold op-8">
                                                        {formatDate2(minDate)}
                                                    </div>
                                                )
                                            }

                                        </div>
                                        <div className="col-4 ps-0 text-end">
                                            {
                                                nbExamEnCours === "" ? (
                                                    <h3 className="fw-bold mb-1 ">0</h3>
                                                ) : (

                                                    <h3 className="fw-bold mb-1 ">{nbExamEnCours}</h3>
                                                )
                                            }

                                            <div className="text-md text-uppercase fw-bold op-8">
                                                Total
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card card-secondary bg-secondary-gradient">
                                <div className="card-body bubble-shadow">
                                    <img
                                        src="/assets/img/apparaisal.png"
                                        height="12.5"
                                        alt=""
                                    />
                                    <h2 className="py-4 mb-0">Inscriptions</h2>
                                    <div className="row">
                                        <div className="col-8 pe-0">
                                            <h3 className="fw-bold mb-1">Validé</h3>
                                            <div className="text-md text-uppercase fw-bold op-8">
                                                .
                                            </div>
                                        </div>
                                        <div className="col-4 ps-0 text-end">
                                            {
                                                nbInscription === "" ? (
                                                    <h3 className="fw-bold mb-1 ">0</h3>
                                                ) : (
                                                    <h3 className="fw-bold mb-1 ">{nbInscription}</h3>
                                                )
                                            }
                                            <div className="text-md text-uppercase fw-bold op-8">
                                                Total
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card card-secondary bg-secondary-gradient">
                                <div className="card-body curves-shadow">
                                    <img
                                        src="/assets/img/session.png"
                                        height="15"
                                        alt=""
                                    />
                                    <h2 className="py-4 mb-0">Examen suivant <strong>[{mat}]</strong></h2>
                                    <div className="row">
                                        <div className="col-8 pe-0">
                                            <h3 className="fw-bold mb-1">dans</h3>
                                            <div className="text-md text-uppercase fw-bold op-8">
                                                {timeLeft.j} J,  {timeLeft.h} H {timeLeft.min} min {timeLeft.sec} sec
                                            </div>
                                        </div>
                                        {/* <div className="col-4 ps-0 text-end">
                                        <h3 className="fw-bold mb-1">4/26</h3>
                                        <div className="text-small text-uppercase fw-bold op-8">
                                            Total
                                        </div>
                                    </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6" >
                            <div className="card card-round">
                                <div className="card-header">
                                    <div className="card-head-row">
                                        <div className="card-title">Récentes notifications</div>
                                    </div>
                                </div>


                                <div className="card-body" style={{ height: 'auto', minHeight: '500px' }}>

                                    {
                                        notificationRecent && notificationRecent.length > 0 ? (
                                            notificationRecent.map((not, index) => (

                                                <div key={index} className={not.ma_notification.statutNot === "Non lu" ? "fw-bold" : ""}>
                                                    <div className="d-flex">
                                                        <div className="avatar avatar">
                                                            <span
                                                                className="avatar-title rounded-circle border border-white"
                                                                style={{ backgroundColor: getColorForLetter(nom.charAt(0)) }}
                                                            >{nom.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex-1 ms-5 pt-1">
                                                            <h6 className="text-uppercase fw-bold mb-1">
                                                                {nom}
                                                                <span className={not.ma_notification.statutNot === "Non lu" ? "text-warning ps-3" : "text-success ps-3"}>{not.ma_notification.statutNot}</span>
                                                            </h6>
                                                            <span className="text-muted ">
                                                                {not.notificationOriginal.titre}
                                                            </span>


                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                                                            <div className="float-end pt-1">
                                                                <span className="text-muted">{formatDate(not.ma_notification.dateRecept)}</span>
                                                            </div>
                                                            <div className='float-end pt-3'>
                                                                <i className='fa fa-eye' onClick={() => showNotificationDetails(not)} style={{ cursor: 'pointer', fontSize: '20px' }}></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                {/* <i className='fa fa-trash-alt text-danger' style={{ cursor: 'pointer', fontSize: '20px' }}></i> */}
                                                            </div>
                                                        </div>


                                                    </div>
                                                    <div className="separator-dashed"></div>
                                                </div>
                                            )
                                            )
                                        ) : (
                                            <div className="text-center muted">Aucune nouvelle notification trouvée</div>
                                        )

                                    }

                                </div>


                            </div>
                        </div>


                        <div className="col-md-6">
                            <div className="card card-round">
                                <div className="card-header">
                                    <div className="card-head-row">
                                        <div className="card-title">Prochaines examens en cours</div>
                                    </div>
                                </div>



                                <div className="card-body" style={{ height: '500px', minHeight: '500px' }}>
                                    {
                                        prochaineExam && prochaineExam.length > 0 ? (
                                            <div className="table-responsive">

                                                <table className="table table-bordered table-head-bg-success  mt-0">
                                                    <thead>
                                                        <tr className='text-center fw-bold'>
                                                            <th scope='col'>SESSION</th>
                                                            <th scope="col">DATE</th>
                                                            <th scope="col">MATIERE</th>
                                                            <th scope="col">HORAIRE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="fw-bold">
                                                        {
                                                            prochaineExam && prochaineExam.map((ex, index) => (
                                                                <tr key={index} data-key={ex.idExam} className="text-center">
                                                                    <td>{ex.codeExam}</td>
                                                                    <td>{formatDate2(ex.dateExam)}</td>
                                                                    <td>{ex.matiere}</td>
                                                                    <td>{ex.heureDebut} à {ex.heureFin}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>

                                            </div>
                                        ) : (
                                            <div className="text-center">Aucun examens trouves</div>
                                        )
                                    }


                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Dashboard;