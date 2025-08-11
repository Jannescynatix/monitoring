// public/Website.js
const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema({
    url: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, default: 'unknown' },
    lastChecked: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Website', WebsiteSchema);