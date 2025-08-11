// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('DB connection error:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'supergeheimerschluessel',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: 'auto' }
}));

const authRoutes = require('./routes/auth');
// WICHTIG: Importiere die neuen Notizen-Routen
const notesRoutes = require('./routes/notes');

app.use('/api', authRoutes);
app.use('/api', notesRoutes); // Verwende die neuen Routen

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Keine Cron-Job mehr für Notizen
// cron.schedule(...)

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});