import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../../App";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Login from "../auth/login";
import swal from "sweetalert";
import api from "../API/api";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, useStripe, useElements, cardElement } from "@stripe/react-stripe-js"

function TopNavBar() {

    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);

    const [newNotification, setNewNotification] = useState(() => {
        return localStorage.getItem("countNotify") || '0';
    });

    const [notificatLength, setNotificatLength] = useState([]);

    const [menuActive, setMenuActive] = useState('');

    const [anneeUniv, setAnneeUniv] = useState([]);

    const chargerAnneeUniv = () => {
        api.get('/annee/all')
            .then((rep) => {
                console.log(rep.data)
                setAnneeUniv(rep.data.annee)
            })
            .catch((err) => {
                console.log(err.message)
            })
    }

    useEffect(() => {
        chargerAnneeUniv();
    }, []);


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

    const [isVisible, setVisible] = useState(false);

    const openModal = () => {
        setVisible(true)
    }

    const closeModal = () => {
        setVisible(false)
    }

    const [startYear, setStartYear] = useState("2000");
    const [endYear, setEndYear] = useState("2100");

    // Fonction pour limiter l'entrée à 4 chiffres
    const handleYearChange = (setter) => (e) => {
        const value = e.target.value.slice(0, 4); // On garde seulement les 4 premiers chiffres
        setter(value);
    };

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fonction pour fermer si on clique à l'extérieur
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    // Ajouter l'écouteur d'événement lorsque le menu est ouvert
    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const saveAnnee = (e) => {
        e.preventDefault();
        api.post('/annee/save', {
            debut: startYear,
            fin: endYear
        })
            .then((rep) => {
                // console.log(rep.data)
                if (rep.data.succes) {
                    swal({
                        text: `Année crée avec succès !`,
                        icon: "success",
                        buttons: false,
                        timer: 1500
                    },
                    )
                    setVisible(false)
                } else {
                    swal({
                        text: `Cet année existe déjà !`,
                        icon: "error",
                        buttons: false,
                        timer: 1500
                    },
                    )
                    // setVisible(false)
                }
                chargerAnneeUniv();
            })
    }

    const activeAnnee = (annee) => {
        // e.preventDefault();
        api.put(`/annee/active/${annee}`, {
            debut: startYear,
            fin: endYear
        })
            .then((rep) => {
                if (rep.data.success) {
                    // setSelectedAnnee(annee)
                    chargerAnneeUniv();
                }
            })
    }

    const [selectedAnnee, setSelectedAnnee] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            api.get('/annee/active')
                .then((rep) => {
                    if (rep.data.success) {
                        // console.log(rep.data.activeAnnee)
                        setSelectedAnnee(rep.data.activeAnnee.idAnnee)
                    }
                })
        }, 500);

        return () => clearInterval(timer);
    }, [])

    const updateAll = () => {
        api.put(`/all/update/${selectedAnnee}`)
            .then((rep) => {
                console.log(rep.data)
            })
    }

    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const savePaiement = async () => {
        try {
            // Obtenir le token
            // const tokenResponse = api.post('/mvola/token');
            // const token = tokenResponse.data;

            // console.log(token);

            await api.post('/mvola/token')
                .then((rep) => {
                    console.log(rep.data)
                })
            // const token = "eyJ4NXQiOiJOMkpqTWpOaU0yRXhZalJrTnpaalptWTFZVEF4Tm1GbE5qZzRPV1UxWVdRMll6YzFObVk1TlEiLCJraWQiOiJNREpsTmpJeE4yRTFPR1psT0dWbU1HUXhPVEZsTXpCbU5tRmpaalEwWTJZd09HWTBOMkkwWXpFNFl6WmpOalJoWW1SbU1tUTBPRGRpTkRoak1HRXdNQV9SUzI1NiIsInR5cCI6ImF0K2p3dCIsImFsZyI6IlJTMjU2In0";

            // Effectuer le paiement
            // const paymentResponse = await api.post('/mvola/payment', {
            //     phoneNumber: "0345416063",
            //     amount: "10000",
            //     token
            // });

            // console.log(`Paiement réussi ! Transaction ID : ${paymentResponse.data.transactionId}`)

            // setMessage(`Paiement réussi ! Transaction ID : ${paymentResponse.data.transactionId}`);
        } catch (error) {
            setMessage('Erreur lors du paiement');
        }
    };

    // const stripe = useStripe();
    // const elements = useElements();
    // const [loading, setLoading] = useState(false);
    // const [message, setMessage] = useState("");

    // const stripePromise = loadStripe("pk_test_51QpVW4Rj5MZZFLXmBSbXHmfCUM9tdSjIV0F7xFTC1eJYIQbh1JdNzqKr2vTfNHcP2qlHI4gESKVmMK3nyjcol8se00W45hhY89")

    // const stripePaiement = async (e) => {
    //     // e.preventDefault();
    //     setLoading(true);

    //     const { data } = api.post("/stripe/payment", {
    //         amount: 1000, // Montant en centimes (10.00€)
    //         currency: "Ar",
    //     });

    //     const { clientSecret } = data;
    //     const result = await stripe.confirmCardPayment(clientSecret, {
    //         payment_method: { card: elements.getElement(cardElement) },
    //     });

    //     if (result.error) {
    //         setMessage(result.error.message);
    //         console.log(result.error.message);
    //     } else if (result.paymentIntent.status === "succeeded") {
    //         setMessage("Paiement réussi !");
    //         console.log("Paiement reussi !");
    //     }

    //     setLoading(false);
    // };

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

            {
                isVisible && (
                    <div
                        className="modal fade show d-block"
                        id="addRowModal"
                        // tabindex="-1"
                        role="dialog"

                    >
                        <form onSubmit={saveAnnee}>
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header border-0">
                                        <h5 className="modal-title">
                                            <span className="fw-mediumbold"> Nouvelle</span>
                                            <span className="fw-light"> année universitaire </span>
                                        </h5>
                                        <i className='fas fa-times fa-2x text-danger' onClick={closeModal}></i>
                                    </div>
                                    <div className="modal-body">

                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Annee de debut</label>
                                                    <input
                                                        type="number"
                                                        min="2000"
                                                        max="2100"
                                                        step="1"
                                                        placeholder="AAAA"
                                                        className="form-control"
                                                        value={startYear}
                                                        onChange={handleYearChange(setStartYear)}
                                                        name="dateExam"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Annee de fin</label>
                                                    <input
                                                        type="number"
                                                        min="2000"
                                                        max="2100"
                                                        step="1"
                                                        value={endYear}
                                                        placeholder="AAAA"
                                                        onChange={handleYearChange(setEndYear)}
                                                        className="form-control"
                                                        name="dateExam"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button
                                            onClick={saveAnnee}
                                            type="button"
                                            className="btn btn-success"
                                        >
                                            <i className='fas fa-save'></i> &nbsp;&nbsp;
                                            Creer
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

                        {/* <li className="nav-item topbar-icon dropdown hidden-caret">
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
                        </li> */}

                        {/* <li className="nav-item topbar-icon dropdown hidden-caret" ref={dropdownRef}>
                            <a
                                className="nav-link"
                                onClick={() => setIsOpen(true)}
                                aria-expanded={isOpen}
                            >
                                <i className="fas fa-calendar-alt"></i>
                            </a>

                            {isOpen && (
                                <div className="dropdown-menu quick-actions animated fadeIn">
                                    <div className="quick-actions-header">
                                        <span className="title mb-1">Année Universitaire</span>
                                    </div>
                                    <div className="quick-actions-scroll scrollbar-outer">
                                        <div className="quick-actions-items">
                                            <div className="row m-2">
                                                <div className="col">
                                                    <button className="btn btn-rounded btn-primary">Créer</button>
                                                    <label className="selectgroup-item">
                                                        <input type="radio" name="classe" className="selectgroup-input" />
                                                        <span className="selectgroup-button">2019-2020</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li> */}

                        <li className="nav-item topbar-icon dropdown hidden-caret" >
                            <a className="nav-link" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="fas fa-calendar-alt"></i>
                            </a>
                            <div className="dropdown-menu quick-actions animated fadeIn" >
                                <div className="quick-actions-header">
                                    <span className="title mb-1">Année Universitaire</span>
                                    {/* <span className="subtitle op-7">Raccourcis</span> */}
                                </div>
                                <div className="quick-actions-scroll scrollbar-outer">
                                    <div className="quick-actions-items">
                                        <div className="row m-2">
                                            <div className="col">
                                                <button className="btn btn-primary" onClick={openModal}>Creer</button><br /><br />
                                                <span >

                                                    <div className="selectgroup selectgroup-pills" style={{
                                                        display: 'flex',
                                                        // justifyContent: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: '10px'
                                                    }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >

                                                        {
                                                            anneeUniv && anneeUniv.length > 0 ? (
                                                                anneeUniv.map((item) => (
                                                                    <label className="selectgroup-item" key={item.idAnnee}>
                                                                        <input
                                                                            onChange={() => activeAnnee(item.idAnnee)}
                                                                            type="radio"
                                                                            name="annee"
                                                                            value={item.annee}
                                                                            className="selectgroup-input"
                                                                            checked={selectedAnnee === item.idAnnee}
                                                                        />
                                                                        <span
                                                                            className={`selectgroup-button ${selectedAnnee === item.idAnnee ? "btn-success" : ""
                                                                                }`}
                                                                        >
                                                                            {item.annee}
                                                                        </span>
                                                                        {/* <span className="selectgroup-button">{item.annee}</span> */}
                                                                    </label>
                                                                ))
                                                            ) : (
                                                                <div className="text-center">Aucun annee Universitaire mise en place</div>
                                                            )
                                                        }

                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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

                                            <Link to="/exam-eazy/etudiant" className="col-6 col-md-4 p-0" >
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-danger rounded-circle">
                                                        <i className="fas fa-graduation-cap"></i>
                                                    </div>
                                                    <span className="text">Etudiants</span>
                                                </div>
                                            </Link>
                                            <Link to="/exam-eazy/salle" className="col-6 col-md-4 p-0" >
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-warning rounded-circle">
                                                        <i className="fas fa-file"></i>
                                                    </div>
                                                    <span className="text">Salles</span>
                                                </div>
                                            </Link>
                                            <Link to="/exam-eazy/examen" className="col-6 col-md-4 p-0" >
                                                <div className="quick-actions-item">
                                                    <div className="avatar-item bg-info rounded-circle">
                                                        <i className="fas fa-calendar-alt"></i>
                                                    </div>
                                                    <span className="text">Examens</span>
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