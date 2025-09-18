import { useContext } from "react";
import { UserContext } from "../../App";
import { Navigate, useNavigate } from "react-router-dom";
import Login from "../auth/login";
import swal from "sweetalert";
import api from "../API/api";

function TopNavBar() {
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);



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

    const handleLogout = () => {
        swal({
            title: "Déconnexion en cours...",
            text: "Veuillez patienter s'il vous plaît.",
            buttons: false,
            closeOnClickOutside: false,
            closeOnEsc: false,
            timer: 2000,
        });

        setTimeout(() => {
            api.post('/logout')
                .then((rep) => {
                    console.log(rep.data.message);
                    localStorage.removeItem('user');
                    setUser(undefined);
                    navigate('/', { replace: true });
                })

        }, 2000);

    }

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
                        {/* <li className="nav-item topbar-icon dropdown hidden-caret d-flex d-lg-none">
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
                        </li> */}


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
                                            <span className="fw-bold">{user.nomUt}</span>
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
                                                <a className="dropdown-item" onClick={handleLogout}>Se Déconnecter</a>
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