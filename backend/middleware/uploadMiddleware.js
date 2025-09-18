const multer = require('multer');
const path = require('path');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => cb(null, file.originalname),
// });

// const upload = multer({ storage });

// module.exports = upload;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "uploads");
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const safeFilename = file.originalname.replace(/[:]/g, "-"); // Sécuriser le nom du fichier
        cb(null, safeFilename);
    },
});

const upload = multer({ storage });

module.exports = upload;
