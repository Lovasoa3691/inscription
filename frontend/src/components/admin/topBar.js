import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Login from "../auth/login";
import swal from "sweetalert";
import api from "../API/api";

function TopNavBar() {

    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);

    const [newNotification, setNewNotification] = useState(() => {
        return localStorage.getItem("countNotify") || '0';
    });

    const [notificatLength, setNotificatLength] = useState([]);

    const [menuActive, setMenuActive] = useState('');


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

    const actualiseNotification = () => {
        api.get('/notification/admin/count')
            .then((rep) => {
                if (rep.data.count !== '0') {
                    // console.log(rep.data)
                    setNotificatLength(rep.data);
                    // setNewNotification(rep.data.count);
                }
            })
    }

    useEffect(() => {
        // document.title = `${menuActive}`
        // localStorage.setItem('activeMenu', menuActive)

        const interval = setInterval(() => {
            actualiseNotification();
        }, 5000);
        return () => clearInterval(interval);
    })

    const handleLogout = () => {
        swal({
            title: "Deconnection en cours...",
            text: "Veuillez patienter s'il vous plait.",
            buttons: false,
            closeOnClickOutside: false,
            closeOnEsc: false,
            timer: 2000,
        });

        setTimeout(() => {
            api.post('/logout')
                .then((rep) => {
                    // console.log(rep.data.message);
                    localStorage.removeItem('user');
                    setUser(undefined);
                    navigate('/', { replace: true });
                })
        }, 2000);
    }

    // const menuClick = (menu) => {
    //     setMenuActive(menu)
    // }

    return (
        <div className="main-header">
            <div className="main-header-logo">
                {/* <!-- Logo Header --> */}
                <div className="logo-header" data-background-color="dark">
                    <a className="logo">
                        <img src="" alt="navbar brand" className="navbar-brand" height="20" />
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
                {/* <!-- End Logo Header --> */}
            </div>
            {/* <!-- Navbar Header --> */}
            <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
                <div className="container-fluid">
                    {/* <nav className="navbar navbar-header-left navbar-expand-lg navbar-form nav-search p-0 d-none d-lg-flex">
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <button type="submit" className="btn btn-search pe-1">
                                    <i className="fa fa-search search-icon"></i>
                                </button>
                            </div>
                            <input type="text" placeholder="Recherche ..." className="form-control" />
                        </div>
                    </nav> */}

                    <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
                        <li className="nav-item topbar-icon dropdown hidden-caret d-flex d-lg-none">
                            <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" role="button"
                                aria-expanded="false" aria-haspopup="true">
                                <i className="fa fa-search"></i>
                            </a>
                            <ul className="dropdown-menu dropdown-search animated fadeIn">
                                <form className="navbar-left navbar-form nav-search">
                                    <div className="input-group">
                                        <input type="text" placeholder="Search ..." className="form-control" />
                                    </div>
                                </form>
                            </ul>
                        </li>


                        {/* Boite de message */}
                        {/* <li className="nav-item topbar-icon dropdown hidden-caret">
                            <a className="nav-link dropdown-toggle"  id="messageDropdown" role="button"
                                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i className="fa fa-envelope"></i>
                            </a>
                            <ul className="dropdown-menu messages-notif-box animated fadeIn" aria-labelledby="messageDropdown">
                                <li>
                                    <div className="dropdown-title d-flex justify-content-between align-items-center">
                                        Messages
                                        <a  className="small">Marquer tous comme lus</a>
                                    </div>
                                </li>
                                <li>
                                    <div className="message-notif-scroll scrollbar-outer">
                                        <div className="notif-center">
                                            <a >
                                                <div className="notif-img">
                                                    <img src="" alt="Img Profile" />
                                                </div>
                                                <div className="notif-content">
                                                    <span className="subject">Jimmy Denis</span>
                                                    <span className="block"> How are you ? </span>
                                                    <span className="time">5 minutes ago</span>
                                                </div>
                                            </a>

                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a className="see-all" >Voir tous<i className="fa fa-angle-right"></i>
                                    </a>
                                </li>
                            </ul>
                        </li> */}
                        <li className="nav-item topbar-icon dropdown hidden-caret">
                            <a className="nav-link dropdown-toggle" id="notifDropdown" role="button" data-bs-toggle="dropdown"
                                aria-haspopup="true" aria-expanded="false">
                                <i className="fa fa-bell"></i>
                                {
                                    notificatLength && notificatLength.length > 0 ?
                                        (
                                            <span className="notification">{notificatLength.length}</span>
                                        ) : (
                                            <span></span>
                                        )
                                }

                            </a>
                            <ul className="dropdown-menu notif-box animated fadeIn" aria-labelledby="notifDropdown">
                                <li>
                                    {
                                        notificatLength.length > 0 ? (
                                            <div className="dropdown-title">
                                                Vous avez {notificatLength.length} nouveau notification
                                            </div>
                                        ) : (
                                            <div className="dropdown-title">

                                            </div>
                                        )
                                    }

                                </li>
                                <li>
                                    <div className="notif-scroll scrollbar-outer">
                                        <div className="notif-center">
                                            {
                                                notificatLength.length > 0 ? (
                                                    notificatLength && notificatLength.map(item => (
                                                        <a key={item._id}>
                                                            <div className="notif-icon notif-primary">
                                                                <i className="fa fa-user-plus"></i>
                                                            </div>
                                                            <div className="notif-content">
                                                                <span className="block"> {item.titre} </span>
                                                                <span className="time">5 minutes passe</span>
                                                            </div>
                                                        </a>
                                                    ))
                                                ) : (
                                                    <div className="text-center">Aucun nouveaux notification</div>
                                                )

                                            }
                                        </div>
                                    </div>
                                </li>
                                <li style={{ cursor: 'pointer' }}>
                                    <Link className="see-all" to="/app/notification" >Voir tous les notifications<i className="fa fa-angle-right"></i>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item topbar-icon dropdown hidden-caret">
                            <a className="nav-link" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="fas fa-layer-group"></i>
                            </a>
                            <div className="dropdown-menu quick-actions animated fadeIn">
                                <div className="quick-actions-header">
                                    <span className="title mb-1">Actions Rapide</span>
                                    <span className="subtitle op-7">Raccourcis</span>
                                </div>
                                <div className="quick-actions-scroll scrollbar-outer">
                                    <div className="quick-actions-items">
                                        <div className="row m-0">
                                            <Link to="/app/etudiant" className="col-6 col-md-4 p-0" >
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-danger rounded-circle">
                                                        <i className="fas fa-graduation-cap"></i>
                                                    </div>
                                                    <span className="text">Etudiants</span>
                                                </div>
                                            </Link>
                                            <Link to="/app/salle" className="col-6 col-md-4 p-0" >
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-warning rounded-circle">
                                                        <i className="fas fa-file"></i>
                                                    </div>
                                                    <span className="text">Salles</span>
                                                </div>
                                            </Link>
                                            <Link to="/app/examen" className="col-6 col-md-4 p-0" >
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-info rounded-circle">
                                                        <i className="fas fa-calendar-alt"></i>
                                                    </div>
                                                    <span className="text">Examens</span>
                                                </div>
                                            </Link>

                                            <Link to="/app/paiement" className="col-6 col-md-4 p-0">
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-secondary rounded-circle">
                                                        <i className="fas fa-credit-card"></i>
                                                    </div>
                                                    <span className="text">Paiements</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>

                        {
                            user && user.nomUt ? (
                                <li className="nav-item topbar-user dropdown hidden-caret">
                                    <a className="dropdown-toggle profile-pic" data-bs-toggle="dropdown" aria-expanded="false">
                                        <div className="avatar-sm">
                                            <span
                                                className="avatar-title rounded-circle border border-white"
                                                style={{ backgroundColor: getColorForLetter(user.nomUt.charAt(0)) }}
                                            >
                                                {user.nomUt.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="profile-username">
                                            {/* <span className="op-7">Hi,</span> */}
                                            <span className="fw-bold">{user.nomUt} <strong>[ {(user.role).toUpperCase()} ]</strong></span>
                                        </span>
                                    </a>
                                    <ul className="dropdown-menu dropdown-user animated fadeIn">
                                        <div className="dropdown-user-scroll scrollbar-outer">
                                            <li>
                                                <div className="user-box">
                                                    <div className="avatar-lg">
                                                        <span
                                                            className="avatar-title rounded-circle border border-white"
                                                            style={{ backgroundColor: getColorForLetter(user.nomUt.charAt(0)) }}
                                                        >
                                                            {user.nomUt.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="u-text">
                                                        <h4>{user.nomUt}</h4>
                                                        <p className="text-muted">{user.mail}</p>
                                                        {/* <a className="btn btn-xs btn-secondary btn-sm">Voir Profile</a> */}
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                {/* <div className="dropdown-divider"></div>
                                        <a className="dropdown-item">Mon Profil</a> */}

                                                <div className="dropdown-divider"></div>
                                                <a className="dropdown-item" onClick={handleLogout}>Se Deconnecter</a>
                                            </li>
                                        </div>
                                    </ul>
                                </li>
                            ) : (
                                <div></div>
                            )}
                    </ul>
                </div>
            </nav>
            {/* <!-- End Navbar --> */}
        </div>
    );
}

export default TopNavBar;