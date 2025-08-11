// routes/auth.js
const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        req.session.user = { id: user._id, username: user.username };
        res.json({ success: true, message: 'Registrierung erfolgreich' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Benutzername existiert bereits.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await user.comparePassword(password)) {
        req.session.user = { id: user._id, username: user.username };
        res.json({ success: true, message: 'Login erfolgreich' });
    } else {
        res.status(401).json({ success: false, message: 'Ungültiger Benutzername oder Passwort.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout fehlgeschlagen' });
        }
        res.json({ success: true, message: 'Logout erfolgreich' });
    });
});

router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;