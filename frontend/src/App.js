// import logo from './logo.svg';
// import './App.css';
import './assets/css/bootstrap.min.css';
import './assets/css/kaiadmin.min.css';
import './assets/css/uf-style.css';
import './assets/css/fonts.min.css';
import 'nprogress/nprogress.css'
import './assets/css/nprogress-custom.css';

import Login from './components/auth/login';
import Register from './components/auth/register';
import HomeAdmin from './components/admin/home';
import HomeEtudiant from './components/etudiant/homeEtu';
import HomeSA from './components/super-admin/homeSA';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import React, { createContext, useContext, useEffect, useState } from "react";
import api from './components/API/api';
import ProtectRoute from './components/ProtectRoute';
export const UserContext = createContext();

function App() {

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const scripts = [
      { src: process.env.PUBLIC_URL + "/js/core/jquery-3.7.1.min.js" },
      { src: process.env.PUBLIC_URL + "/js/core/popper.min.js" },
      { src: process.env.PUBLIC_URL + "/js/core/bootstrap.min.js" },
      { src: process.env.PUBLIC_URL + "/js/plugin/jquery-scrollbar/jquery.scrollbar.min.js" },
      { src: process.env.PUBLIC_URL + "/js/kaiadmin.min.js" },
    ];

    const scriptElements = scripts.map(({ src }) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      return script;
    });

    return () => {
      scriptElements.forEach(script => document.body.removeChild(script));
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  });

  const [user, setUser] = useState(undefined);


  useEffect(() => {
    const saveduser = localStorage.getItem('user');

    if (saveduser) {
      setUser(JSON.parse(saveduser));
    }

    api.get('/utilisateur')
      .then((rep) => {
        const utilisateurConnecte = {
          idUt: rep.data.utilisateur['id_ut'],
          nomUt: rep.data.utilisateur['nom_ut'],
          mail: rep.data.utilisateur['email'],
          role: rep.data.utilisateur['role'],
        };
        setUser(utilisateurConnecte);
        localStorage.setItem('user', JSON.stringify(utilisateurConnecte));
      })
      .catch((error) => {
        console.log("Erreur: ", error);
        localStorage.removeItem('user');
        setUser(null);
      })
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="App">
        <Router>
          <Routes>
            <Route path='/' element={<Login />}></Route>
            <Route path='/register' element={<Register />}></Route>
            <Route path='/app/*' element={
              <ProtectRoute role="Responsable">
                <HomeAdmin />
              </ProtectRoute>
            } />
            <Route path='/etudiant/*' element={
              <ProtectRoute role="Etudiant">
                <HomeEtudiant />
              </ProtectRoute>
            } />
            <Route path='/exam-eazy-app/*' element={
              <ProtectRoute role="Admin">
                <HomeSA />
              </ProtectRoute>
            } />
          </Routes>
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export default App;
