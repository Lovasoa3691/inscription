// StripePaiement.js
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import api from "../API/api";

const stripePromise = loadStripe("pk_test_51QpVW4Rj5MZZFLXmBSbXHmfCUM9tdSjIV0F7xFTC1eJYIQbh1JdNzqKr2vTfNHcP2qlHI4gESKVmMK3nyjcol8se00W45hhY89");

const TestCheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Début du paiement...");

        // api.post('/stripe/payment')
        // .then((rep) => {
        //     console.log(rep.data);
        // })
        // .catch((error) => {
        //     console.error("❌ Erreur lors du paiement:", error.message);
        // })

        try {
            // console.log("🔹 Étape 1: Requête au backend pour récupérer le clientSecret...");
            // const { data } = api.post("/stripe/payment", {
            //     amount: 1000, // 10.00€
            //     currency: "Ar",
            // });

            api.post('/stripe/payment', {
                amount: 1000, // 10.00€
                currency: "Ar",
            })
                .then((rep) => {
                    console.log(rep.data)
                })
                .catch((error) => {
                    console.error("Erreur lors du paiement: ", error.message)
                })

            // console.log(data);

            // console.log("🔹 Étape 2: ClientSecret reçu ✅", data.clientSecret);

            // console.log("🔹 Étape 3: Confirmation du paiement avec Stripe...");
            // const result = await stripe.confirmCardPayment(data.clientSecret, {
            //     payment_method: { card: elements.getElement(CardElement) },
            // });

            // if (result.error) {
            //     console.error("❌ Erreur Stripe:", result.error.message);
            //     setMessage(result.error.message);
            // } else if (result.paymentIntent.status === "succeeded") {
            //     console.log("✅ Paiement réussi !");
            //     setMessage("Paiement réussi !");
            // }
        } catch (error) {
            console.error("❌ Erreur lors du paiement:", error.message);
            setMessage("Erreur de paiement.");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe || loading}>
                {loading ? "Paiement en cours..." : "Tester Paiement"}
            </button>
            <p>{message}</p>
        </form>
    );
};

const StripePaiement = () => (
    <Elements stripe={stripePromise}>
        <TestCheckoutForm />
    </Elements>
);

export default StripePaiement;
