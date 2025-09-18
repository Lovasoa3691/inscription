import axios from "axios";

function Footer() {



    return (
        <footer className="footer">
            <div className="container-fluid d-flex justify-content-between">
                <nav className="pull-left">
                    <ul className="nav">
                        {/* <li className="nav-item">
                            <a className="nav-link" href="">
                                ThemeKita
                            </a>
                        </li> */}
                        <li className="nav-item">
                            <a className="nav-link"> Aide </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href=""> Licence </a>
                        </li>
                    </ul>
                </nav>
                <div className="copyright">
                    {/* <i className="fa fa-heart heart text-danger"></i> */}
                    2024, Créer par &nbsp;&nbsp;
                    <a ><strong>Juliannot Orion</strong></a>
                </div>
                {/* <div>
                    Distribue par 
                    <a target="_blank" >Material UI Data</a>.
                </div> */}
            </div>
        </footer>
    );
}

export default Footer;