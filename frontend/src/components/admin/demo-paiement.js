import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import axios from 'axios';
import api from '../API/api';
import swal from 'sweetalert';

function PaiementContent() {

    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const savePaiement = async () => {
        try {
            // Obtenir le token
            const tokenResponse = await api.post('http://localhost:5000/api/mvola/token');
            const token = tokenResponse.data.access_token;

            // Effectuer le paiement
            const paymentResponse = await api.post('http://localhost:5000/api/mvola/payment', {
                phoneNumber,
                amount,
                token
            });

            setMessage(`Paiement réussi ! Transaction ID : ${paymentResponse.data.transactionId}`);
        } catch (error) {
            setMessage('Erreur lors du paiement');
        }
    };

    return (
        <div className="container">

            <div className="page-inner">
                {/* <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des paiements</h3>
                </div> */}


                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center">
                                    {/* <h4 className="card-title">Add Row</h4> */}
                                    <button
                                        className="btn btn-primary btn-round btn-border ms-auto"
                                        onClick={openModal}
                                    >
                                        <i className="fa fa-plus">&nbsp;&nbsp;</i>
                                        Nouveau Paiement
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div
                                    className="modal fade show d-block"
                                    // id="addRowModal"
                                    // tabindex="-1"
                                    role="dialog"
                                // aria-hidden="true"
                                >
                                    <form onSubmit={savePaiement}>
                                        <div className="modal-dialog" role="document">
                                            <div className="modal-content">
                                                <div className="modal-header border-0">
                                                    <h5 className="modal-title">
                                                        <span className="fw-mediumbold"> </span>
                                                        <span className="fw-light"> Paiement </span>
                                                    </h5>
                                                    <i className='fas fa-times fa-2x'></i>
                                                </div>
                                                <div className="modal-body">
                                                    {/* <p className="small">
                                                    Vous devraiz remplir tous les champs
                                                </p> */}

                                                    <div className="row">

                                                        {/* <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label>Type de paiement</label>
                                                                        <select name='typePaie'
                                                                            className="form-select"
                                                                            value={paiementForm.typePaie}
                                                                            onChange={handleChangeData}
                                                                        >
                                                                            <option value="Frais de formation">Frais de formation</option>
                                                                        </select>
                                                                    </div>
                                                                </div> */}

                                                        <div className="col-sm-12">
                                                            <div className="form-group">
                                                                <label>Numero Telephone</label>
                                                                <div className="input-group mb-3">
                                                                    <span className="input-group-text">Ar</span>
                                                                    <input
                                                                        value={phoneNumber}
                                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                                        type="text"
                                                                        name='montant'
                                                                        className="form-control"
                                                                        aria-label="Amount (to the nearest dollar)"
                                                                    />
                                                                    <span className="input-group-text">.00</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-sm-12">
                                                            <div className="form-group">
                                                                <label>Montant a paye</label>
                                                                <div className="input-group mb-3">
                                                                    <span className="input-group-text">Ar</span>
                                                                    <input
                                                                        value={amount}
                                                                        onChange={(e) => setAmount(e.target.value)}
                                                                        type="text"
                                                                        name='montant'
                                                                        className="form-control"
                                                                        aria-label="Amount (to the nearest dollar)"
                                                                    />
                                                                    <span className="input-group-text">.00</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="modal-footer border-0">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-success"

                                                    >
                                                        Enregistrer
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        data-dismiss="modal"

                                                    >
                                                        Fermer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PaiementContent;