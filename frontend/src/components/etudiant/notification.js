import React, { useEffect } from 'react';
import { useState } from 'react';
import swal from 'sweetalert';
import api from '../API/api';
import Swal from 'sweetalert2';


function NotificationContent() {



    const formatDate = (dateReception) => {
        const current = new Date(dateReception);
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const hours = String(current.getHours()).padStart(2, '0');
        const minutes = String(current.getMinutes()).padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}`;
    };


    const [notifications, setNotifications] = useState([]);

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

    useEffect(() => {
        chargerNotifications();
        const interval = setInterval(() => {
            chargerNotifications();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const chargerNotifications = () => {
        api.get('/notifications')
            .then((rep) => {
                // console.log(rep.data);
                // console.log(rep.data);
                setNotifications(rep.data);
            })
    }

    const showNotificationDetails = (notification) => {
        // swal({
        //     title: `${nom}`,
        //     text: `${notification.notificationOriginal.titre}\n\n\n Objet\n
        //     ${notification.notificationOriginal.objet}
        //     \n\n${notification.ma_notification.dateRecept}`,

        //     buttons: {
        //         confirm: {
        //             text: "Fermer",
        //             value: true,
        //             visible: true,
        //             className: "btn btn-primary",
        //             closeModal: true
        //         }
        //     }
        // });
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
                chargerNotifications();
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
            console.log("Erreur de requete", error)
        }
    }

    const deleteNotification = (idNot) => {
        swal({
            title: "Êtes-vous sûr ?",
            text: "Une fois supprimé, vous ne pourrez plus récupérer cet information !",
            icon: "warning",
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
        }).then((willDelete) => {
            if (willDelete) {
                api.delete(`/notification/${idNot}`)
                    .then((rep) => {
                        if (rep.data.succes) {
                            swal(`${rep.data.message}`, {
                                icon: "success",
                                buttons: {
                                    confirm: {
                                        className: "btn btn-success",
                                    },
                                },
                            });
                            chargerNotifications();
                        }
                        else {
                            swal(`${rep.data.message}`, {
                                icon: "error",
                                buttons: {
                                    confirm: {
                                        className: "btn btn-success",
                                    },
                                },
                            });
                            chargerNotifications();
                        }
                    })

            } else {
                swal.close();
            }
        });
    }

    const nom = "INSITUT DE FORMATION TECHNIQUE";

    return (
        <div className="container">
            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Tous mes notifications</h3>
                </div>
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-head-row">
                                <div className="card-title">Notifications</div>

                            </div>
                        </div>
                        <div className="card-body">
                            {

                                notifications && notifications.length > 0 ? (
                                    notifications.map((not, index) => (

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
                                                        <i className='fa fa-trash-alt text-danger' onClick={() => deleteNotification(not.ma_notification.idNot)} style={{ cursor: 'pointer', fontSize: '20px' }}></i>
                                                    </div>
                                                </div>


                                            </div>
                                            <div className="separator-dashed"></div>
                                        </div>
                                    )
                                    )
                                ) : (
                                    <div className="text-center">Aucune nouvelle notification trouvée</div>
                                )

                            }



                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
}

export default NotificationContent;