import { useState } from "react";

const Recu = ({ nom, prenom, mention, montant, niveau, descriptionPaie }) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Conversion si nécessaire
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours());
        const min = String(date.getMinutes());
        const sec = String(date.getSeconds());
        return `${year}/${month}/${day}_${hour}:${min}:${sec}`;
    }

    const formatDate1 = (dateString) => {
        const date = new Date(dateString); // Conversion si nécessaire
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours());
        const min = String(date.getMinutes());
        const sec = String(date.getSeconds());
        return `${year}/${month}/${day}`;
    }

    // const [montant, setMontant] = useState("");
    const [resultat, setResultat] = useState("");

    const unites = ["", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf"];
    const dizaines = ["", "Dix", "Vingt", "Trente", "Quarante", "Cinquante", "Soixante", "Soixante-dix", "Quatre-vingt", "Quatre-vingt-dix"];
    const exceptions = {
        11: "Onze", 12: "Douze", 13: "Treize", 14: "Quatorze", 15: "Quinze", 16: "Seize",
        71: "Soixante et onze", 72: "Soixante-douze", 73: "Soixante-treize", 74: "Soixante-quatorze",
        75: "Soixante-quinze", 76: "Soixante-seize", 91: "Quatre-vingt-onze", 92: "Quatre-vingt-douze"
    };

    const convertirEnLettres = (nombre) => {
        if (nombre === 0) return "Zéro";

        function enLettres(n) {
            if (n === 0) return "";
            if (n < 10) return unites[n];
            if (exceptions[n]) return exceptions[n];
            if (n < 20) return "Dix-" + unites[n % 10].toLowerCase();
            if (n < 100) {
                let dizaine = Math.floor(n / 10);
                let unite = n % 10;
                return dizaines[dizaine] + (unite ? "-" + unites[unite].toLowerCase() : "");
            }
            if (n < 1000) {
                let centaine = Math.floor(n / 100);
                let reste = n % 100;
                return (centaine > 1 ? unites[centaine] + " cent" : "Cent") + (reste ? " " + enLettres(reste).toLowerCase() : "");
            }
            if (n < 1000000) {
                let millier = Math.floor(n / 1000);
                let reste = n % 1000;
                return (millier > 1 ? enLettres(millier) + " mille" : "Mille") + (reste ? " " + enLettres(reste).toLowerCase() : "");
            }
            return "Nombre trop grand";
        }

        return enLettres(nombre) + " Ariary";
    };

    return (
        <div className="row bg-white" style={{

            padding: "40px", paddingTop: "70px", fontFamily: "Times New Roman", fontSize: "16px"
        }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: "80px" }}>

                    <div>
                        <div className="text-center d-flex justify-content-start gap-2 align-items-center">
                            <img src={`${process.env.PUBLIC_URL}/image/logoIft1.jpg`} width={70} height={40} alt="" />
                            <h4 className='text-primary text-center fw-bold'>INSTITUT DE FORMATION TECHNIQUE</h4>
                        </div>
                        <div className='text-center'>
                            <span>Lot C109 / 3702 Ambalapaiso Ambony, 301 FIANARANTSOA</span><br />
                            <span>Tél: 034 99 230 37</span>
                        </div>

                    </div>

                    <div className='text-center p-2'>
                        <h4>Somme</h4>
                        <h2 className="fw-bold">{montant}</h2>
                    </div>

                </div>

                <div className='col-md-12'>
                    <div className='text-center'>
                        <h2 className="fw-bold ">RECU</h2>
                    </div>

                    <br />
                    de Mr/Mlle : &nbsp;&nbsp;&nbsp;<strong>{nom.toUpperCase()} {prenom}</strong>  <br /><br />

                    La somme de : &nbsp;&nbsp;&nbsp;<strong>{convertirEnLettres(parseInt(montant))}</strong><br />
                    <br />

                    Pour : &nbsp;&nbsp;&nbsp;<strong>{descriptionPaie.join(', ')}</strong> <br /><br />
                    Classe de : &nbsp;&nbsp;&nbsp;<strong>{mention} {niveau}</strong> &nbsp;&nbsp;&nbsp; date: <strong>{formatDate1(Date.now())}</strong>

                </div>
            </div>

        </div>
    );
}

export default Recu;