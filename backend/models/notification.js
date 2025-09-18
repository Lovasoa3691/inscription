const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    idNot: { type: String, unique: true, required: true },
    titre: { type: String },
    objet: { type: String },
    dateEnvoi: { type: Date, default: Date.now },
});

const notification = mongoose.model('notifications', NotificationSchema);

module.exports = notification;