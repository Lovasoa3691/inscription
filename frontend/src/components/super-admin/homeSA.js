import React, { useEffect, useState } from 'react';

import Dashboard from "./dashboard";
import TopNavBar from "./topBar";
import Footer from "../footer";
import StudentContent from "./contentEtudiant";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import SalleContent from './salle';
import ExamenContent from './examen';
import UtilisateurContent from './utilisateur';
// import PaiementContent from './paiement';
import NotificationContent from './notification';

function Home() {

    const [isActive, setActive] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState("Tableau de bord");

    useEffect(() => {
        document.title = `${currentPage}`;
    })

    const menuClick = (menu, path) => {
        setActive(menu);
        localStorage.setItem("menuActive", menu);
        setLoading(true);
        setCurrentPage(menu);
        setTimeout(() => {
            navigate(path);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="wrapper">
            <div className="sidebar" data-background-color="dark">
                <div className="sidebar-logo">

                    <div className="logo-header" data-background-color="dark">
                        <a className="logo">
                            <h3 className='text-white fw-bold'>Exam Eazy</h3>
                        </a>
                        <div className="nav-toggle">
                            <button className="btn btn-toggle toggle-sidebar">
                                <i className="gg-menu-right"></i>
                            </button>
                            <button className="btn btn-toggle sidenav-toggler">
                                <i className="gg-menu-left"></i>
                            </button>
                        </div>
                        <button className="topbar-toggler more">
                            <i className="gg-more-vertical-alt"></i>
                        </button>
                    </div>

                </div>
                <div className="sidebar-wrapper scrollbar scrollbar-inner">
                    <div className="sidebar-wrapper">
                        <div className="sidebar-content">
                            <ul className="nav nav-secondary">
                                <li className="nav-section">
                                    <span className="sidebar-mini-icon">
                                        <i className="fa fa-ellipsis-h"></i>
                                    </span>
                                    <h4 className="text-section">Accueil</h4>
                                </li>

                                <li className={isActive === "Tableau de bord" ? "nav-item active" : "nav-item"} onClick={() => menuClick('Tableau de bord', '/exam-eazy-app/tableau_de_bord')}>
                                    <Link to='#'
                                        // data-bs-toggle="collapse"
                                        // className="collapsed"
                                        // aria-expanded="false"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-home"></i>
                                        <p>Tableau de bord</p>

                                    </Link>

                                </li>

                                <li className="nav-section">
                                    <span className="sidebar-mini-icon">
                                        <i className="fa fa-ellipsis-h"></i>
                                    </span>
                                    <h4 className="text-section">Ressources</h4>
                                </li>

                                <li className={isActive === "Etudiant" ? "nav-item active" : "nav-item"} onClick={() => menuClick('Etudiant', '/exam-eazy-app/etudiant')}>
                                    <Link to='#'
                                        // data-bs-toggle="collapse"
                                        // className="collapsed"
                                        // aria-expanded="false"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-graduation-cap"></i>
                                        <p>Etudiants</p>


                                    </Link>

                                </li>

                                <li className={isActive === "Examen" ? "nav-item active" : "nav-item"} onClick={() => menuClick('Examen', '/exam-eazy-app/examen')}>
                                    <Link
                                        // data-bs-toggle="collapse"
                                        // className="collapsed"
                                        // aria-expanded="false"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-calendar-alt"></i>
                                        <p>Session examens</p>


                                    </Link>
                                </li>

                                <li className={isActive === "Salle d'examen" ? "nav-item active" : "nav-item"} onClick={() => menuClick("Salle d'examen", '/exam-eazy-app/salle')}>
                                    <Link
                                        // data-bs-toggle="collapse"
                                        // className="collapsed"
                                        // aria-expanded="false"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-table"></i>
                                        <p>Salle d'examen</p>

                                    </Link>

                                </li>

                                <li className="nav-section">
                                    <span className="sidebar-mini-icon">
                                        <i className="fa fa-ellipsis-h"></i>
                                    </span>
                                    <h4 className="text-section">Autres</h4>
                                </li>

                                {/* <li className={isActive === "Notification" ? "nav-item active" : "nav-item"} onClick={() => menuClick('Notification', '/exam-eazy-app/notification')}>
                                    <Link
                                        // data-bs-toggle="collapse"
                                        // className="collapsed"
                                        // aria-expanded="false"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-bell"></i>
                                        <p>Notifications</p>

                                    </Link>
                                </li> */}

                                <li className={isActive === "Utilisateur" ? "nav-item active" : "nav-item"} onClick={() => menuClick('Utilisateur', '/exam-eazy-app/utilisateur')}>
                                    <Link
                                        // data-bs-toggle="collapse"
                                        // className="collapsed"
                                        // aria-expanded="false"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-users"></i>
                                        <p>Utilisateurs</p>

                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>


            <div className="main-panel">
                <TopNavBar />

                {loading && (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                        {/* <div className="spinner-border text-primary" role="status"> */}
                        <div className='spinner-grow text-success' role='status'>
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                )}

                <Routes>
                    <Route path="tableau_de_bord" element={<Dashboard />}></Route>
                    <Route path="etudiant" element={<StudentContent />}></Route>
                    <Route path="salle" element={<SalleContent />}></Route>
                    <Route path="examen" element={<ExamenContent />}></Route>
                    <Route path="utilisateur" element={<UtilisateurContent />}></Route>
                    {/* <Route path="paiement" element={<PaiementContent />}></Route> */}
                    {/* <Route path="notification" element={<NotificationContent />}></Route> */}
                </Routes>
                <Footer />
            </div>


        </div>
    );
}

export default Home;