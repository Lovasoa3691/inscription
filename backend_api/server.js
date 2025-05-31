const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const salleRoute = require('./routes/SalleRoutes');
const etuRoute = require('./routes/etudiantRoute');
const smsRoute = require('./routes/smsRoute');
const authRoutes = require('./routes/authRoutes')
const examRoutes = require('./routes/examRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const historiqueRoutes = require('./routes/historiqueRoutes');
const paiementRoutes = require('./routes/paiementRoutes')
const anneeRoutes = require('./routes/anneeRoutes');
const cron = require('node-cron')
const mement = require('moment')

const verifierPaiementEtudiant = require('./controllers/PaiementController');

const app = express();
const PORT = 5000;


app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/systeme_inscription', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connexion reussie!'))
    .catch(err => console.error('Erreur de connexion a MongoDB :', err));

cron.schedule('0 0 * * *', async () => {
    console.log('Debut de la verification des paiemnts');
    try {
        await verifierPaiementEtudiant();
        console.log('Verification termine avec succes');
    } catch (error) {
        console.error('Erreur lors de la verification des paiements')
    }
})

app.use('/api', salleRoute);
app.use('/api', etuRoute);
app.use('/api', smsRoute);
app.use('/api', authRoutes);
app.use('/api', examRoutes);
app.use('/api', notificationRoutes);
app.use('/api', historiqueRoutes);
app.use('/api', paiementRoutes);
app.use('/api', anneeRoutes);

app.listen(PORT, () => {
    console.log('Serveur en cours sur le port: ', PORT);
});
