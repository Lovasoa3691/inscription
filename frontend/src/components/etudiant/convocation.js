const Convocation = ({ matricule, nom, prenom, mention, phone, niveau, examens }) => {
    return (
        <div className="row bg-white" style={{

            padding: "50px", paddingTop: "70px", fontFamily: "Times New Roman", fontSize: "16px"
        }}>
            <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: "50px" }}>
                <img src={`${process.env.PUBLIC_URL}/image/logoIft1.jpg`} width={80} height={80} alt="" />
                <div className="text-center">
                    <h4 className='text-primary text-center fw-bold'>INSTITUT DE FORMATION TECHNIQUE</h4>
                    <span>Lot C109 / 3702 Ambalapaiso Ambony, 301 FIANARANTSOA</span><br />
                    <span>Tél : 034 99 230 37</span>
                </div>

                <img src={`${process.env.PUBLIC_URL}/image/logoIft2.jpg`} width={80} height={80} alt="" />
            </div>

            <div className="col-md-12">
                <div className="col">
                    <ul className="ms-auto mb-1" style={{ float: "right", listStyle: "none" }}>
                        <li>{prenom} {nom.toUpperCase()}</li>
                        <li>Tél : {phone}</li>
                        <li>Matricule : {matricule}</li>
                        <li>Classe : {mention} {niveau}</li>
                    </ul>
                </div>
            </div>

            <div className='col-md-12'>
                <span className="fw-bold">Objet : </span> Convocation aux examens
                <br /><br />
                Monsieur / Mademoiselle, <br /><br />

                Nous avons le plaisir de vous informer que vous êtes convoqué(e) aux examens suivants :<br />
                {
                    examens.map((exam, index) => (
                        <span className="fw-bold">{exam.matiere}, &nbsp;&nbsp;</span>
                    ))

                }
                {/* <table className="table table-bordered table-head-bg-info table-bordered-bd-info mt-2">
                    <thead>
                        <tr className='text-center'>
                            <th scope="col">DATE</th>
                            <th scope="col">MATIÈRE</th>
                            <th scope="col">HORAIRE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            examens.map((exam, index) => (
                                <tr className="text-center" key={index}>
                                    <td>{exam.dateExam}</td>
                                    <td>{exam.matiere}</td>
                                    <td>{exam.heureDebut} - {exam.heureFin}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table> */}
                <br /><br />
                L'examen se déroulera à l'adresse suivante : <br />
                <br />
                <div className="text-center fw-bold p-2" style={{ borderStyle: "ridge" }}>
                    Institut de Formation Technique <br />
                    Ambalapaiso Fianarantsoa
                </div>

                <div className="mt-4">
                    Nous vous prions de bien vouloir vous munir d'une pièce d'identité en cours de validité, ainsi que de votre convocation. <br /><br />

                    Nous vous souhaitons bonne chance pour cette session d'examen. <br /><br />

                    Veuillez agréer, Monsieur / Mademoiselle, nos salutations distinguées. <br /><br />

                    Signature
                </div>
            </div>

        </div>
    );
}

export default Convocation;