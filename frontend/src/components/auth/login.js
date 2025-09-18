import { Link, replace, useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import swal from "sweetalert";
import { UserContext } from "../../App";
import api from "../API/api";
import exam from '../../assets/img/3.png';

function Login() {

    const navigate = useNavigate();

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     navigate("tableau_de_bord");
    // }

    const [loading, setLoading] = useState(false); // Ajouter un état pour gérer le spinner

    const changeUrl = (path) => {
        setLoading(true);
        setTimeout(() => {
            navigate(path);
            setLoading(false);
        }, 1000);
    };


    useEffect(() => {
        document.title = 'Authentification';
    })

    const { setUser } = useContext(UserContext);
    const [mail, setMail] = useState('');
    const [mdp, setMdp] = useState('');

    const handleConnecting = (e) => {
        e.preventDefault();
        // setLoading(true);

        api.post('/login', { email: mail, mdp: mdp })
            .then((rep) => {

                if (rep.data.succes) {
                    const { token, utilisateur } = rep.data;
                    // localStorage.setItem('token', token);

                    const Infoutilisateur = {
                        idUt: rep.data.utilisateur['id_ut'],
                        nomUt: rep.data.utilisateur['nom_ut'],
                        mail: rep.data.utilisateur['email'],
                        role: rep.data.utilisateur['role'],
                        // matricule: rep.data.etudiant['matricule'],
                        // mention: rep.data.etudiant['mention'],
                        // niveau: rep.data.etudiant['niveau'],
                    };

                    setUser(Infoutilisateur);
                    localStorage.setItem('user', JSON.stringify(Infoutilisateur));

                    swal({
                        title: "Connexion en cours...",
                        text: "",
                        buttons: false,
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                        timer: 1000,
                    });

                    setTimeout(() => {
                        // setLoading(false);
                        navigate(utilisateur.role === 'Responsable' ? '/app/tableau_de_bord' : utilisateur.role === 'Etudiant' ? '/etudiant/dashboard' : '/exam-eazy-app/tableau_de_bord', { replace: true });
                    }, 1000);


                } else {
                    swal({
                        title: rep.data.message,
                        icon: "error",
                        buttons: {
                            confirm: {
                                className: "btn btn-info",
                            },
                        },
                        timer: 1500,
                    });
                }
            })
            .catch(error => {
                swal({
                    title: "Erreur du serveur",
                    text: `${error}`,
                    icon: "error",
                    buttons: {
                        confirm: {
                            className: "btn btn-info",
                        },
                    },
                    // timer: 1000,
                });
                // alert(, JSON.stringify(error));
            })
    }

    const updateAllStudent = () => {
        api.put('/etudiants/all')
            .then((rep) => {
                alert(rep.data.message)
            })
    }


    return (
        <>

            {loading && (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                    {/* <div className="spinner-border text-primary" role="status"> */}
                    <div className='spinner-grow text-success' role='status'>
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            )}

            <div className="login">
                <div className="uf-form-signin">
                    <div className="text-center">
                        <img src={exam} alt="" width="250" height="250" />
                        {/* <h1 className="text-white h3">Connectez-vous</h1> */}
                    </div>
                    <form className="mt-4"
                    // onSubmit={updateAllStudent}
                    >
                        <div className="input-group uf-input-group input-group-lg mb-3">
                            <span className="input-group-text fa fa-user"></span>
                            <input type="text" className="form-control" name="email" value={mail} onChange={e => setMail(e.target.value)} required placeholder="Adresse mail" />
                        </div>
                        <div className="input-group uf-input-group input-group-lg mb-3">
                            <span className="input-group-text fa fa-lock"></span>
                            <input type="password" className="form-control" name="mdp" value={mdp} onChange={e => setMdp(e.target.value)} required placeholder="Mot de passe" />
                        </div>
                        <div className="d-flex mb-3 justify-content-between">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input uf-form-check-input" id="exampleCheck1" />
                                <label className="form-check-label text-white" >Se souvenir de moi</label>
                            </div>
                            {/* <a>Mot de passe oublie?</a> */}
                        </div>
                        <div className="d-grid mb-4">
                            <button type="button" onClick={handleConnecting} className="btn uf-btn-primary btn-lg">Connecter</button>
                        </div>
                        {/* <div className="d-flex mb-3">
                            <div className="dropdown-divider m-auto w-25"></div>
                            <small className="text-nowrap text-white">Ou se connecter avec</small>
                            <div className="dropdown-divider m-auto w-25"></div>
                        </div> */}
                        {/* <div className="uf-social-login d-flex justify-content-center">
                            <a className="uf-social-ic" title="Login with Facebook"><i className="fab fa-facebook-f"></i></a>
                            <a className="uf-social-ic" title="Login with Twitter"><i className="fab fa-twitter"></i></a>
                            <a className="uf-social-ic" title="Login with Google"><i className="fab fa-google"></i></a>
                        </div> */}
                        <div className="mt-4 text-center">
                            <span className="text-white">Vous n'a pas encore un compte? &nbsp; &nbsp;</span>
                            <Link onClick={() => changeUrl('register')} className="text-primary">S'inscrire</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;