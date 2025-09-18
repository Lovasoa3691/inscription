import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

function NavBar() {

    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState("Tableau de bord");

    const [isActive, setActive] = useState(() => {
        return localStorage.getItem("activeMenu") || "dashboard";
    });

    useEffect(() => {
        document.title = `${currentPage} - Mon Application`;
    })

    const menuClick = (menu, path) => {
        setActive(menu);
        localStorage.setItem("activeMenu", menu);
        // setLoading(true);
        setCurrentPage(menu);
        setTimeout(() => {
            navigate(path);
            // setLoading(false);
        }, 1000);
    };

    return (
        <div className="sidebar sidebar-style-2" data-background-color="dark">
            <div className="sidebar-logo">
                {/* <!-- Logo Header --> */}
                <div className="logo-header" data-background-color="dark">
                    <a className="logo">
                        <img
                            src=""
                            alt="navbar brand"
                            className="navbar-brand"
                            height="20"
                        />
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
                            className={isActive === "notification" ? "nav-item active" : "nav-item"} onClick={() => menuClick('notification', '/etudiant/notification')}>
                            <Link
                                // data-bs-toggle="collapse"
                                // className="collapsed"
                                // aria-expanded="false"
                                style={{ cursor: 'pointer', padding: '20px' }}
                            >
                                <i className="fas fa-bell"></i>
                                <p>Notifications</p>
                                <span className="badge badge-danger">4</span>
                                {/* <span className="caret"></span> */}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    );
}

export default NavBar;