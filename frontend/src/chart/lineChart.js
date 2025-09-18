import React from "react";


import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";


import { Line } from "react-chartjs-2";

// Enregistrement des composants nécessaires
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function LineChart() {

    const data = {
        labels: ["Jan", "Feb", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sept", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Inscrits",
                data: [30, 45, 60, 50, 70, 80, 30, 45, 60, 50, 70, 80],
                borderColor: "red",
                backgroundColor: "red",

                tension: 0.4,
            },
            {
                label: "Nouveau",
                data: [54, 12, 20, 14, 6, 58, 30, 45, 74, 32, 19, 78],
                borderColor: "orange",
                backgroundColor: "orange",
                tension: 0.4,
            },
            {
                label: "Actif",
                data: [24, 47, 52, 65, 89, 51, 74, 26, 10, 14, 98, 50],
                borderColor: "blue",
                backgroundColor: "blue",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: true, position: "top" },
        },
    };

    return <Line data={data} options={options} />;
};

export default LineChart;