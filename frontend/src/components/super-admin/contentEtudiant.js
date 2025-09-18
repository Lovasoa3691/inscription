import React, { useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component';
// import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../API/api';
import swal from 'sweetalert';
import Select from 'react-select';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function StudentContent() {

    const colonne = [
        {
            name: "MATRICULE",
            selector: row => row.matricule,
            sortable: true,
        },
        {
            name: "NOM",
            selector: row => (row.nomEtu).toUpperCase(),
            sortable: true,
        },
        {
            name: "PRENOM",
            selector: row => row.prenomEtu,
            sortable: true,
        },
        {
            name: "ADRESSE",
            selector: row => row.adresseEtu,
            sortable: true,
        },
        {
            name: "CONTACT",
            selector: row => row.contactEtu,
            sortable: true,
        },
        {
            name: "MENTION",
            selector: row => row.mention,
            sortable: true,
        },
        {
            name: "NIVEAU",
            selector: row => row.niveau,
            sortable: true,
        },

    ];


    const [EtuData, setEtuData] = useState([]);
    const [importedData, setImportedData] = useState([]);
    const fileInputRef = useRef(null);
    const [donneeFiltre, setDonneFiltre] = useState([]);

    const [filtre, setFiltre] = useState({
        matricule: '', nom: '', prenom: '', mention: '', niveau: ''
    });

    const [etudiantData, setEtudiantData] = useState({
        matricule: "", nomEtu: "", prenomEtu: "", adresseEtu: "", contactEtu: "", mention: "", niveau: ""
    });

    const [isVisible, setVisible] = useState(false);
    const [btnLabel, setBtnLabel] = useState('Enregistrer');
    const [isEdit, setIsEdit] = useState(false);

    const chargerEtudiants = () => {

        api.get('/etudiants')
            .then((rep) => {
                // console.log(rep.data.etudiant);
                setEtuData(rep.data.etudiant);
                setDonneFiltre(rep.data.etudiant);
            })
            .catch(error => {
                console.log("Erreur lors de la recuperation des donnees: ", error);
            })
    };

    useEffect(() => {
        chargerEtudiants();
        // console.log(JSON.stringify(EtuData))
    }, []);


    // const filtreChange = (e) => {
    //     const { name, value } = e.target;
    //     setFiltre({ ...filtre, [name]: value });

    //     const filtrer = EtuData.filter(item =>
    //         (item.matricule.toLowerCase().includes(filtre.matricule.toLowerCase())) &&
    //         (item.mention.toLowerCase().includes(filtre.mention.toLowerCase())) &&
    //         (item.niveau.toUpperCase().includes(filtre.niveau.toLowerCase()))
    //     );

    //     setDonneFiltre(filtrer);
    // }

    const [selectedMention, setSelectedMention] = useState(null);
    const [selectedNiveau, setSelectedNiveau] = useState(null);

    const mentionOptions = [
        { value: "DROIT", label: "DROIT" },
        { value: "BTP", label: "BTP" },
        { value: "INFO", label: "INFO" },
        { value: "GM", label: "GM" },
        { value: "ICJ", label: "ICJ" },
    ]

    const niveauOptions = [
        { value: "L1", label: "Licence 1" },
        { value: "L2", label: "Licence 2" },
        { value: "L3", label: "Licence 3" },
        { value: "M1", label: "Master 1" },
        { value: "M2", label: "Master 2" },
    ]

    const filtrerData = (mention, niveau) => {
        const filtered = EtuData.filter(item =>
            (!mention || item.mention === mention.value) &&
            (!niveau || item.niveau === niveau.value)
        )

        setDonneFiltre(filtered);
    }

    const handleMentionChange = (selectedMention) => {
        setSelectedMention(selectedMention)
        filtrerData(selectedMention, selectedNiveau)
    }

    const handleNiveauChange = (selectedNiveau) => {
        setSelectedNiveau(selectedNiveau)
        filtrerData(selectedMention, selectedNiveau)
    }

    const handleChangeData = (e) => {
        const { name, value } = e.target;
        setEtudiantData({ ...etudiantData, [name]: value });
    }

    const paginationComponentOptions = {
        rowsPerPageText: "Lignes par page",
        rangeSeparatorText: "de",
        noRowsPerPage: false,
        selectAllRowsItem: true,
        selectAllRowsItemText: "Tout",
    };

    const csvHeaders = [
        { label: 'Matricule', key: 'matricule' },
        { label: 'Nom', key: 'nomEtu' },
        { label: 'Prenom', key: 'prenomEtu' },
        { label: 'Adresse', key: 'adresseEtu' },
        { label: 'Contact', key: 'contactEtu' },
        { label: 'Mention', key: 'mention' },
        { label: 'Niveau', key: 'niveau' },
    ]

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(donneeFiltre);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Etudiant`);
        XLSX.writeFile(wb, 'etudiant.xlsx');
    };

    const exportCSV = () => {
        const csvData = XLSX.utils.json_to_sheet(donneeFiltre);
        const csv = XLSX.utils.sheet_to_csv(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf8;' });
        saveAs(blob, `Etudiant.csv`);
    }

    const importFile = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const importedData = XLSX.utils.sheet_to_json(sheet);
            setImportedData(importedData);
        };
        reader.readAsBinaryString(file);
    };

    const openFileDialog = () => {
        fileInputRef.current.click();
    }

    const extraireValeurs = (str) => {
        const match = str.match(/\(\+(\d+)\)(\d+)/);

        if (match) {
            const indicatif = `+${match[1]}`;
            const numero = match[2];

            return { indicatif, numero };

        }
        return { indicatif: '', numero: '' };
    }

    const tableRef = useRef(null);

    const ImprimerEtudiants = () => {
        const table = tableRef.current;

        const options = {
            margin: 5,
            filename: 'liste.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { orientation: "portrait" },
        };

        html2pdf().set(options).from(table).save();
    }

    const ImprimerEtudiantsPDF = () => {
        const doc = new jsPDF();
        const colonnes = ["MATRICULE", "NOM", "PRENOM"];
        const ligne = donneeFiltre.map((ligne) => [ligne.matricule, ligne.nomEtu, ligne.prenomEtu]);

        if (selectedMention && selectedNiveau) {
            doc.text(`Liste des etudiants ${selectedMention.value} ${selectedNiveau.value}`, 15, 10);
            doc.autoTable({
                head: [colonnes],
                body: ligne,
                startY: 20,
            });

            doc.save(`${selectedMention.value}_${selectedNiveau.value}.pdf`);
        } else {
            doc.text(`Liste des etudiants`, 15, 10);
            doc.autoTable({
                head: [colonnes],
                body: ligne,
                startY: 20,
            });

            doc.save(`liste_etudiant.pdf`);
        }
    }


    return (
        <div className="container">

            <div className="page-inner">
                <div className="page-header">
                    <h3 className="fw-bold mb-3">Liste des étudiants</h3>
                </div>


                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center">
                                    <div className="card-tools d-flex align-items-center">
                                        <div className="btn btn-label-info btn-round btn-sm"
                                            onClick={ImprimerEtudiantsPDF}
                                        >
                                            <span className="btn-label">
                                                <i className="fa fa-print"></i>
                                            </span> &nbsp;
                                            Imprimer
                                        </div>
                                        &nbsp;&nbsp;&nbsp;
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-label-success btn-round btn-sm dropdown-toggle"
                                                type="button"
                                                id="dropdownMenuButton"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                            >
                                                Exporter
                                            </button>
                                            <div
                                                className="dropdown-menu"
                                                aria-labelledby="dropdownMenuButton"
                                            >
                                                <a className="dropdown-item" onClick={exportExcel}>Excel</a>
                                                <a className="dropdown-item" onClick={exportCSV}>CSV</a>
                                            </div>
                                        </div>
                                        {/* &nbsp;&nbsp;&nbsp;
                                        <div className="btn btn-label-secondary btn-round btn-sm"
                                            onClick={openFileDialog}>
                                            <span className="btn-label">
                                                Importer
                                            </span>
                                            <input type="file"

                                                accept='.xlsx, .xls, .csv'
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                onChange={importFile}
                                            />
                                        </div> */}
                                    </div>

                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <DataTable
                                        className="table table-hover"
                                        columns={colonne}
                                        data={donneeFiltre}
                                        pagination
                                        highlightOnHover
                                        paginationComponentOptions={paginationComponentOptions}
                                        // striped
                                        subHeader
                                        subHeaderComponent={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                                <Select
                                                    options={mentionOptions}
                                                    placeholder="Selectionner une mention"
                                                    value={selectedMention}
                                                    onChange={handleMentionChange}
                                                    isClearable
                                                />
                                                &nbsp;&nbsp;&nbsp;

                                                <Select
                                                    options={niveauOptions}
                                                    placeholder="Selectionner un niveau"
                                                    value={selectedNiveau}
                                                    onChange={handleNiveauChange}
                                                    isClearable
                                                />


                                            </div>
                                        }

                                        customStyles={{
                                            rows: {
                                                style: {
                                                    backgroundColor: '#f8f9fa',
                                                    '&:nth-of-type(odd)': {
                                                        backgroundColor: '#e9ecef'
                                                    },
                                                }
                                            },
                                            headCells: {
                                                style: {
                                                    backgroundColor: '#343a40',
                                                    color: '#ffffff',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center'
                                                },
                                            },
                                            cells: {
                                                style: {
                                                    textAlign: 'center',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default StudentContent;