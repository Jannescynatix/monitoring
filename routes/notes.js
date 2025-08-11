// routes/note.js
const express = require('express');
const Website = require('../models/Note');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Nicht authentifiziert' });
};

router.get('/websites', isAuthenticated, async (req, res) => {
    const websites = await Website.find({ owner: req.session.user.id });
    res.json(websites);
});

router.post('/websites', isAuthenticated, async (req, res) => {
    const { url, name } = req.body;
    const newWebsite = new Website({ url, name, owner: req.session.user.id });
    await newWebsite.save();
    res.status(201).json(newWebsite);
});

router.delete('/websites/:id', isAuthenticated, async (req, res) => {
    const result = await Website.findOneAndDelete({ _id: req.params.id, owner: req.session.user.id });
    if (result) {
        res.json({ success: true, message: 'Website gelöscht' });
    } else {
        res.status(404).json({ success: false, message: 'Website nicht gefunden' });
    }
});

module.exports = router;