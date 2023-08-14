const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  reservationExpiry: { type: Number, default: 7 }, // Default 7 dana
  returnDeadline: { type: Number, default: 30 }, // Default 30 dana
  conflictDeadline: { type: Number, default: 35 }, // Default 35 dana
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
