const mongoose = require('mongoose');

const NotificationAdminSchema = new mongoose.Schema({
    idAdmin: { type: String },
    idNot: { type: String },
    dateRecept: { type: Date },
    statutNot: { type: String, default: "Non lu" }
});

const notificationAdmin = mongoose.model('notificationAdmins', NotificationAdminSchema);

module.exports = notificationAdmin;