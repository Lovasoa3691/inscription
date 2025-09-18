import React from "react";
import { useEffect, useState } from "react";
import api from "../components/API/api";
import {
    Chart as ChartJS,
    CategoryScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';


ChartJS.register(CategoryScale, ArcElement, Title, Tooltip, Legend);

const PieChart = () => {

    const [statEtudiant, setStatEtudiant] = useState(0);

    const getEtudiantCount = () => {
        api.get('/etudiants/count-by-mention')
            .then((rep) => {
                setStatEtudiant(rep.data)
            })
    }

    useEffect(() => {
        getEtudiantCount();
        const timer = setInterval(() => {
            getEtudiantCount();
            // console.log(dataStudent)
        }, 60000);

        return () => clearInterval(timer)
    }, []);

    const dataStudent = [
        statEtudiant.Droit,
        statEtudiant.Btp,
        statEtudiant.Info,
        statEtudiant.Gm,
        statEtudiant.Icj
    ];

    const data = {
        labels: ["DROIT", "BTP", "INFO", "GM", "ICJ"],
        datasets: [
            {
                data: dataStudent,
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FFA751", "#1D976C"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FFA751", "#1D976C"],
            },
        ],
    };

    return <Pie data={data} />;
};

export default PieChart;
