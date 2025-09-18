import React, { useEffect, useRef, useState } from 'react'
import swal from 'sweetalert';
import NProgress from 'nprogress';
import api from '../API/api';
import { Navigate, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { createRoot } from 'react-dom/client'
import Convocation from './convocation';
import Recu from './recuPaiement';

function ExamenContent() {

    const [examensDispo, setExamensDispo] = useState([]);
    const [matriculeEtu, setMatriculeEtu] = useState('')
    const [descriptionAttendusData, setDescriptionsAttendusData] = useState([]);

    const navigate = useNavigate();

    const verifierPaiementEtudiant = () => {
        api.put('/paiements/en-attente/verification')
            .then((rep) => {
                console.log(rep.data)
            })
    }

    const chargerExamenDispo = () => {
        api.get('/examens')
            .then((rep) => {
                // console.log(rep.data);
                setMatriculeEtu(rep.data.etu['matricule']);
                // setExamensDispo(rep.data);
                const { examenTries, inscriptionAssocie } = rep.data;
                const fusionData = examenTries.map(exam => {
                    const inscription = inscriptionAssocie.find(ins => ins.idExam === exam.idExam);
                    return {
                        ...exam,
                        statutIns: inscription ? inscription.statutIns : null
                    };
                })
                setExamensDispo(fusionData);
            })
            .catch((error) => {
                localStorage.removeItem('token');
                console.log("Erreur lors de la recuperation des donnees: ", error);
            })
    }

    useEffect(() => {
        chargerExamenDispo();
        verifierPaiementEtudiant();
        const timer = setInterval(() => {
            verifierPaiementEtudiant();
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    // useEffect(() => {
    //     verifierPaiementEtudiant();
    //     const timer = setInterval(() => {
    //         verifierPaiementEtudiant();
    //     }, 60000);

    //     return () => clearInterval(timer);
    // }, []);

    const handleInscription = async (etudiantId, idExamen, dateExam, codeExam) => {
        try {
            NProgress.start();

            const descriptionAttendus = codeExam === "S1" || codeExam === "S3" ||
                codeExam === "S5" || codeExam === "S7" || codeExam === "S9" ?
                ["FF1", "FF2", "FF3", "FF4"] : codeExam === "S2" || codeExam === "S4"
                    || codeExam === "S6" || codeExam === "S8" || codeExam === "S10" ?
                    ["FF5", "FF6", "FF7", "FF8"] : [];

            setDescriptionsAttendusData(descriptionAttendus);

            setTimeout(() => {
                console.log(descriptionAttendus)
            }, 800)

            const rep = await api.post('/inscrire', {
                etudiantId, idExamen, dateExam, descriptionAttendus
            });

            swal({
                title: "Vérification en cours...",
                text: "Veuillez patienter s'il vous plait.",
                buttons: false,
                closeOnClickOutside: false,
                closeOnEsc: false
            });
            setTimeout(() => {
                NProgress.done();
                if (rep.data.succes) {
                    swal("Terminé!", rep.data.message, "success");
                } else {
                    swal("Erreur!", rep.data.message, "warning");
                    console.log(rep.data.paiementsManquantes)
                }
                chargerExamenDispo();
            }, 2000);
        } catch (error) {
            console.log(error.message)
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Conversion si nécessaire
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    const printPDF = useRef();
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [etuInfo, setEtuInfo] = useState(null);
    const [examens, setExamens] = useState(null);


    const chargerInfoEtudiant = () => {
        api.get('/inscriptions/etudiants/info')
            .then((rep) => {
                const rawData = rep.data;
                if (rawData.length > 0) {
                    const etudiants = rawData[0];

                    const etudiantInfo = {
                        matricule: etudiants.etuMatricule.matricule,
                        nom: etudiants.etuMatricule.nomEtu,
                        prenom: etudiants.etuMatricule.prenomEtu,
                        phone: etudiants.etuMatricule.contactEtu,
                        mention: etudiants.etuMatricule.mention,
                        niveau: etudiants.etuMatricule.niveau,
                    }

                    const examens = rawData.flatMap(etudiant =>
                        etudiant.examDetails.map(exam => ({
                            dateExam: exam.dateExam,
                            matiere: exam.matiere,
                            // duree: exam.duree, // Correction ici, au lieu de `codeExam`
                            heureDebut: exam.heureDebut,
                            heureFin: exam.heureFin
                        }))
                    )
                    // console.log(examens);
                    setEtuInfo({ ...etudiantInfo, examens });
                    setExamens(examens);
                }
            })
            .catch((error) => {
                console.log("Erreur lors de la recuperation: ", error.message);
            })
    }

    useEffect(() => {
        chargerInfoEtudiant();
        // console.log(examens);
    }, [etuInfo])



    const generatePDF = () => {
        setIsLoading(true);
        const div = document.createElement('div');
        document.body.appendChild(div);

        const root = createRoot(div);
        root.render(<Convocation {...etuInfo} />);

        setTimeout(() => {

            const opt = {
                margin: 1,
                filename: `convocation_${etuInfo.matricule}.pdf`,
                html2canvas: {
                    scale: 2,
                    logging: true,  // Activer la journalisation pour mieux comprendre ce qui se passe
                    useCORS: true,  // Autoriser le CORS pour les images externes
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                },
            };

            // Générer le PDF
            html2pdf()
                .from(div)
                .set(opt)
                .save().then(() => {
                    root.unmount();
                    document.body.removeChild(div);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }, 1000);
    };

    return (

        <div className="container">

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des examens disponibles</h3>

                    {
                        etuInfo && (
                            isLoading ? (
                                <span className='btn btn-primary btn-round btn-border ms-auto' >
                                    <i className="fa fa-spinner fa-spin"></i> &nbsp; Telechargement...
                                </span>
                            ) : (
                                <span className='btn btn-primary btn-round btn-border ms-auto'
                                    onClick={generatePDF}>
                                    <i className="fa fa-download"></i>&nbsp; Convocation
                                </span>
                            )
                        )
                    }

                </div>

                <div className="row justify-content-center align-item-center">
                    <div className="col-md-12">

                        <div className="row justify-content-start align-items-center">

                            {
                                examensDispo.length > 0 ? (

                                    examensDispo && examensDispo.map((item) => (
                                        <div className="col-md-3 ps-md-0 pe-md-4" key={item.idExam}>
                                            <div className="card card-pricing card-pricing-focus">
                                                <div className="card-header">
                                                    <h4 className="card-title">Examen {item.codeExam}</h4>
                                                    <div className="card-price">
                                                        <span className="text fw-bold text-secondary">{item.matiere}</span>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <ul className="specification-list">
                                                        <li>
                                                            <span className="name-specification">Date de l'examen</span>
                                                            <span className="status-specification">{formatDate(item.dateExam)}</span>
                                                        </li>
                                                        <li>
                                                            <span className="name-specification">Heure debut</span>
                                                            <span className="status-specification">{item.heureDebut}</span>
                                                        </li>
                                                        <li>
                                                            <span className="name-specification">Heure fin</span>
                                                            <span className="status-specification">{item.heureFin}</span>
                                                        </li>
                                                        <li>
                                                            <span className="name-specification">Duree</span>
                                                            <span className="status-specification">{item.duree}</span>
                                                        </li>

                                                    </ul>
                                                </div>
                                                <div className="card-footer">
                                                    {item.statutIns === "Valide" ? (
                                                        <div className="text-success"><i className="fas fa-2x fa-check-circle"></i> <b></b></div>
                                                    ) : item.statutIns === "En attente" ? (
                                                        <div className="text-warning"><i className="fas fa-2x fa-hourglass-half"></i> <b></b></div>
                                                    ) : (
                                                        <button onClick={() => handleInscription(matriculeEtu, item.idExam, item.dateExam, item.codeExam)} className="btn btn-primary w-80">
                                                            <b>Inscrire</b>
                                                        </button>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="container text-center fw-bold"
                                        // onLoad={showMessage}
                                        style={{
                                            fontSize: "30px"
                                        }}
                                    >Aucun examen diponible</div>
                                )

                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default ExamenContent;