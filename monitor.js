// monitor.js
const axios = require('axios');
const Website = require('./models/Website');

const checkWebsite = async (website) => {
    try {
        const response = await axios.get(website.url, { timeout: 5000 });
        website.status = (response.status >= 200 && response.status < 300) ? 'up' : 'down';
    } catch (error) {
        website.status = 'down';
    } finally {
        website.lastChecked = new Date();
        await website.save();
    }
};

const checkAllWebsites = async () => {
    const websites = await Website.find();
    websites.forEach(checkWebsite);
};

module.exports = { checkAllWebsites };