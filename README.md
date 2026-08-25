# Système de Gestion d’Inscriptions aux Examens

Cette application web, développée avec le **stack MERN (MongoDB, Express.js, React.js, Node.js)**, permet de **gérer efficacement les inscriptions aux examens** au sein de l'Insitut de Formation Technique.  
Elle comprend deux espaces distincts : **Responsable** et **Étudiant**, chacun disposant de fonctionnalités spécifiques.

---

## Fonctionnalités principales

### Espace Responsable
Le responsable dispose d’un tableau de bord complet lui permettant de :
- **Gérer les étudiants** (ajout, modification, suppression, recherche)
- **Contrôler le paiement** des frais de formation avant l’inscription
- **Gérer les sessions d’examens** :
  - Création et planification des sessions  
  - Mise à jour et suppression  
  - Définition des critères d’inscription
- **Envoyer des notifications ou messages** aux étudiants (par email ou via le système interne)

---

### Espace Étudiant
Chaque étudiant peut :
- **Consulter les examens disponibles** (date, horaires, session, conditions)
- **S’inscrire à un examen** 
- **Consulter l’historique de ses inscriptions**
- **Recevoir des notifications et messages** de l’établissement (email ou interne)

---

## Technologies utilisées

| Catégorie | Technologies |
|------------|--------------|
| **Frontend** | React.js  |
| **Backend** | Node.js + Express.js |
| **Base de données** | MongoDB avec Mongoose |
| **Authentification** | JWT (JSON Web Token) |
| **Email & Notifications** | Nodemailer / Système interne |
| **Autres outils** | Axios, React Router, Bootstrap |

---

## Installations

1. **Cloner le dépôt**
 ```bash
 git clone https://github.com/Lovasoa3691/inscription.git
 cd inscription
 ```

2. **Installer les dependances
```bash
  cd backend
  npm install

  cd frontend
  npm install
```

3. **Lancer le server
```bash
  # backend
  npm run dev

  # frontend
  npm start
```

Je pouvez-vous utilisé les informations suivants pour tester l'application:
```
email: orionscotty@gmail.com
password: admin3691
```

