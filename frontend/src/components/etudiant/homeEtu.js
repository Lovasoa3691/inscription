import React, { useEffect, useState } from 'react';

import DashboardEtu from "./dashboardEtu";
import TopNavBar from "./topBarEtu";
import Footer from "../footer";

import { Route, Routes, Link, useNavigate } from "react-router-dom";

import ExamenContent from './examenEtu';
import MyExamContent from './mes_examens';
import NotificationContent from './notification';
import HistoriqueContent from './historique';
import Paiemnt from './paiementForm';
import api from '../API/api';
import EXAM from '../../assets/img/EXAM.png'
import MyInscription from './mes_inscriptions';


function Home() {

    const [isActive, setActive] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState();
    const [newNotification, setNewNotification] = useState(() => {
        return localStorage.getItem("countNotify") || '0';
    });

    useEffect(() => {
        document.title = `${currentPage}`;
    })

    useEffect(() => {
        const interval = setInterval(() => {
            actualiseNotification();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const actualiseNotification = () => {
        api.get('/notification/count')
            .then((rep) => {
                // console.log(rep.data.count)
                if (rep.data.count !== '0') {
                    setNewNotification(rep.data.count);
                }

            })
    }

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
            <div className="sidebar sidebar-style-2" data-background-color="dark">
                <div className="sidebar-logo">
                    {/* <!-- Logo Header --> */}
                    <div className="logo-header" data-background-color="dark">
                        <a className="logo">
                            <h3 className='text-white fw-bold'>Exam Eazy</h3>
                        </a>
                        <div className="nav-toggle" >
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
                    {/* <!-- End Logo Header --> */}
                </div>
                {/* <div className="sidebar-wrapper scrollbar scrollbar-inner"> */}
                <div className="sidebar-wrapper">
                    <div className="sidebar-content">
                        <ul className="nav nav-secondary">
                            <li
                                className={isActive === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => menuClick('dashboard', '/etudiant/dashboard')}>
                                <Link to='#'
                                    // data-bs-toggle="collapse"
                                    // className="collapsed"
                                    // aria-expanded="false"
                                    style={{ cursor: 'pointer', padding: '20px' }}
                                >
                                    <i className="fas fa-home"></i>
                                    <p>Mon Tableau de bord</p>
                                    {/* <span className="caret"></span> */}
                                </Link>

                            </li>

                            <li
                                className={isActive === "examens" ? "nav-item active" : "nav-item"} onClick={() => menuClick('examens', '/etudiant/examens')}>
                                <Link to='#'
                                    // data-bs-toggle="collapse"
                                    // className="collapsed"
                                    // aria-expanded="false"
                                    style={{ cursor: 'pointer', padding: '20px' }}
                                >
                                    <i className="fas fa-th-list"></i>
                                    <p>Examens disponibles</p>
                                    {/* <span className="caret"></span> */}

                                </Link>

                            </li>

                            <li
                                className={isActive === "mes_examens" ? "nav-item active" : "nav-item"} onClick={() => menuClick('mes_examens', '/etudiant/mes_examens')}>
                                <Link
                                    // data-bs-toggle="collapse"
                                    // className="collapsed"
                                    // aria-expanded="false"
                                    style={{ cursor: 'pointer', padding: '20px' }}
                                >
                                    <i className="fas fa-calendar"></i>
                                    <p>Mes examens</p>
                                    {/* <span className="caret"></span> */}

                                </Link>
                            </li>

                            <li
                                className={isActive === "mes_inscriptions" ? "nav-item active" : "nav-item"} onClick={() => menuClick('mes_inscriptions', '/etudiant/inscriptions')}>
                                <Link
                                    // data-bs-toggle="collapse"
                                    // className="collapsed"
                                    // aria-expanded="false"
                                    style={{ cursor: 'pointer', padding: '20px' }}
                                >
                                    <i className="fas fa-archive"></i>
                                    <p>Mes inscriptions</p>
                                    {/* <span className="caret"></span> */}

                                </Link>
                            </li>

                            <li
                                className={isActive === "historique" ? "nav-item active" : "nav-item"} onClick={() => menuClick("historique", '/etudiant/historique')}>
                                <Link
                                    // data-bs-toggle="collapse"
                                    // className="collapsed"
                                    // aria-expanded="false"
                                    style={{ cursor: 'pointer', padding: '20px' }}
                                >
                                    <i className="fas fa-file"></i>
                                    <p>Historiques</p>
                                    {/* <span className="caret"></span> */}
                                </Link>

                            </li>

                            <li
                                className={isActive === "notification" ? "nav-item active" : "nav-item"} onClick={() => menuClick('notification', `/etudiant/notification`)}>
                                <Link
                                    // data-bs-toggle="collapse"
                                    // className="collapsed"
                                    // aria-expanded="false"
                                    style={{ cursor: 'pointer', padding: '20px' }}
                                >
                                    <i className="fas fa-bell"></i>
                                    <p>Notifications</p>
                                    {
                                        newNotification === 0 ?
                                            (
                                                <span></span>
                                            ) : (
                                                <span className="badge badge-danger">{newNotification}</span>
                                            )
                                    }

                                    {/* <span className="caret"></span> */}
                                </Link>
                            </li>


                            {/* <li
                                className={isActive === "paiement" ? "nav-item active" : "nav-item"} onClick={() => menuClick("paiement", '/etudiant/paiement')}>
                                <Link
                                    // data-bs-toggle="collapse"
                                    // className="collapsed"
                                    // aria-expanded="false"
                                    style={{ cursor: 'pointer', padding: '20px' }}
                                >
                                    <i className="fas fa-file"></i>
                                    <p>Paiements</p>
                                   
                                </Link>

                            </li> */}
                        </ul>
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
                    <Route path="dashboard" element={<DashboardEtu />}></Route>
                    {/* <Route path="etudiant" element={<StudentContent />}></Route> */}
                    <Route path="examens" element={<ExamenContent />}></Route>
                    <Route path="mes_examens" element={<MyExamContent />}></Route>
                    <Route path="historique" element={<HistoriqueContent />}></Route>
                    <Route path="notification" element={<NotificationContent />}></Route>
                    <Route path="inscriptions" element={<MyInscription />}></Route>
                </Routes>
                <Footer />
            </div>

        </div>
    );
}

export default Home;