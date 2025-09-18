import { Link, Navigate, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from "axios";
import swal from "sweetalert";
import exam from '../../assets/img/3.png';


function Register() {

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeUrl = (path) => {
        setLoading(true);
        setTimeout(() => {
            navigate(path);
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        document.title = 'Souscription';
    })

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [nomUt, setNomUt] = useState('');
    const [email, setMail] = useState('');
    const [mdp, setMdp] = useState('');

    const handleRegistering = (e) => {
        e.preventDefault();
        const formatPrenom = prenom
            .toUpperCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // alert(formatPrenom)

        axios.post('http://localhost:5000/api/inscription',
            { nom: nom.toLowerCase(), prenom: prenom.toLowerCase(), nomUt: nomUt, email: email, mdp: mdp }
        )
            .then((rep) => {
                if (rep.data.message === "sucess") {
                    swal({
                        title: "Votre compte à été crée avec succès",
                        text: "Voulez-vous connecter avec ce compte maintenant?",
                        icon: "info",
                        buttons: {
                            confirm: {
                                text: "Oui",
                                className: "btn btn-success",
                            },
                            cancel: {
                                text: "Non",
                                visible: true,
                                className: "btn btn-danger"
                            }
                        },
                        // dangerMode: true,
                    }).then((confirm) => {
                        if (confirm) {
                            navigate('/', { replace: true });
                            // swal("Poof! Votre donnee a ate supprime!", {
                            //     icon: "success",
                            //     buttons: {
                            //         confirm: {
                            //             className: "btn btn-success",
                            //         },
                            //     },
                            // });
                        } else {
                            swal.close();
                        }
                    });
                } else {
                    swal({
                        title: "Informations",
                        text: rep.data.message,
                        icon: "info",
                        buttons: true,
                    });
                }
            })
            .catch(error => {
                console.log("Erreur lors de la recuperation des donnees: ", error);
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

                        <h1 className="text-white h3">Registration</h1>
                        <h5 className="text-white">Fournir votre nom et prenoms exacte s'il vous plait!</h5>
                    </div>
                    <form className="mt-4" onSubmit={handleRegistering}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="input-group uf-input-group input-group-lg mb-3">
                                    <span className="input-group-text fa fa-user"></span>
                                    <input type="text" className="form-control" name="nom" value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre Nom" />
                                </div>

                            </div>

                            <div className="col-md-6">
                                <div className="input-group uf-input-group input-group-lg mb-3">
                                    <span className="input-group-text fa fa-user"></span>
                                    <input type="text" className="form-control" name="prenom" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Votre Prenom" />
                                </div>
                            </div>
                        </div>


                        <div className="input-group uf-input-group input-group-lg mb-3">
                            <span className="input-group-text fa fa-user"></span>
                            <input type="text" className="form-control" name="nomUt" value={nomUt} onChange={e => setNomUt(e.target.value)} placeholder="Nom d'utilisateur" />
                        </div>

                        <div className="input-group uf-input-group input-group-lg mb-3">
                            <span className="input-group-text fa fa-envelope"></span>
                            <input type="text" className="form-control" name="email" value={email} onChange={e => setMail(e.target.value)} placeholder="Adresse mail" />
                        </div>

                        <div className="input-group uf-input-group input-group-lg mb-3">
                            <span className="input-group-text fa fa-lock"></span>
                            <input type="password" className="form-control" name="mdp" value={mdp} onChange={e => setMdp(e.target.value)} placeholder="Mot de passe" />
                        </div>

                        <div className="input-group uf-input-group input-group-lg mb-3">
                            <span className="input-group-text fa fa-lock"></span>
                            <input type="password" className="form-control" placeholder="Confirmation" />
                        </div>

                        <div className="d-grid mb-4 text-center">
                            <button type="submit" className="btn uf-btn-primary btn-lg">Soumettre</button>
                        </div>

                        <div className="mt-4 text-center">
                            <span className="text-white">Déjà membre? &nbsp; &nbsp;</span>
                            <Link onClick={() => changeUrl('/')} className="text-primary">Se connecter</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Register;