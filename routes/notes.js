// routes/notes.js
const express = require('express');
const Note = require('../models/Note');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Nicht authentifiziert' });
};

// ALLE Notizen abrufen
router.get('/notes', isAuthenticated, async (req, res) => {
    const notes = await Note.find({ owner: req.session.user.id }).sort({ createdAt: -1 });
    res.json(notes);
});

// EINE Notiz erstellen
router.post('/notes', isAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    const newNote = new Note({ title, content, owner: req.session.user.id });
    await newNote.save();
    res.status(201).json(newNote);
});

// EINE Notiz aktualisieren
router.put('/notes/:id', isAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, owner: req.session.user.id },
        { title, content },
        { new: true } // Gibt die aktualisierte Notiz zurück
    );
    if (note) {
        res.json(note);
    } else {
        res.status(404).json({ success: false, message: 'Notiz nicht gefunden' });
    }
});

// EINE Notiz löschen
router.delete('/notes/:id', isAuthenticated, async (req, res) => {
    const result = await Note.findOneAndDelete({ _id: req.params.id, owner: req.session.user.id });
    if (result) {
        res.json({ success: true, message: 'Notiz gelöscht' });
    } else {
        res.status(404).json({ success: false, message: 'Notiz nicht gefunden' });
    }
});

module.exports = router;