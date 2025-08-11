// monitor.js
const axios = require('axios');
const Website = require('./models/Website');

const checkWebsite = async (website) => {
    console.log(`Starte Überprüfung für: ${website.url}`);
    try {
        // Erhöhen wir das Timeout auf 10 Sekunden, um Netzwerkprobleme zu vermeiden
        const response = await axios.get(website.url, { timeout: 10000 });
        website.status = (response.status >= 200 && response.status < 300) ? 'up' : 'down';
        console.log(`Überprüfung erfolgreich für ${website.url}: Status ${website.status}`);
    } catch (error) {
        website.status = 'down';
        console.error(`Überprüfung fehlgeschlagen für ${website.url}. Fehler: ${error.message}`);
    } finally {
        website.lastChecked = new Date();
        await website.save();
    }
};

const checkAllWebsites = async () => {
    try {
        const websites = await Website.find();
        // Verwenden von Promise.all, um sicherzustellen, dass alle asynchronen Checks abgeschlossen werden
        const checkPromises = websites.map(website => checkWebsite(website));
        await Promise.all(checkPromises);
        console.log('Alle Websites wurden erfolgreich überprüft.');
    } catch (error) {
        console.error('Ein Fehler ist bei der Überprüfung aller Websites aufgetreten:', error);
    }
};

module.exports = { checkAllWebsites };