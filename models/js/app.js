// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const dashboardView = document.getElementById('dashboardView');
    const authLinks = document.getElementById('authLinks');
    const userGreeting = document.getElementById('userGreeting');
    const welcomeText = document.getElementById('welcomeText');
    const websiteList = document.getElementById('websiteList');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const addWebsiteForm = document.getElementById('addWebsiteForm');

    // Routing-Funktion
    const navigate = (view) => {
        loginView.style.display = 'none';
        registerView.style.display = 'none';
        dashboardView.style.display = 'none';
        document.getElementById(`${view}View`).style.display = 'block';
    };

    const updateUI = (isAuth, user = null) => {
        if (isAuth) {
            authLinks.style.display = 'none';
            userGreeting.style.display = 'flex';
            welcomeText.textContent = `Willkommen, ${user.username}!`;
            navigate('dashboard');
            fetchWebsites();
        } else {
            authLinks.style.display = 'flex';
            userGreeting.style.display = 'none';
            navigate('login');
        }
    };

    // API-Kommunikation
    const fetchWebsites = async () => {
        const response = await fetch('/api/websites');
        if (response.ok) {
            const websites = await response.json();
            renderWebsites(websites);
        } else {
            console.error('Fehler beim Laden der Websites');
            updateUI(false);
        }
    };

    const renderWebsites = (websites) => {
        websiteList.innerHTML = '';
        if (websites.length === 0) {
            websiteList.innerHTML = '<p>Noch keine Websites hinzugefügt.</p>';
            return;
        }

        websites.forEach(website => {
            const card = document.createElement('div');
            card.className = `website-card status-${website.status}`;
            card.innerHTML = `
                <h3>${website.name}</h3>
                <p>${website.url}</p>
                <div class="card-footer">
                    <span>Status: <strong>${website.status.toUpperCase()}</strong></span>
                    <button class="delete-btn" data-id="${website._id}">Löschen</button>
                </div>
            `;
            websiteList.appendChild(card);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await fetch(`/api/websites/${id}`, { method: 'DELETE' });
                fetchWebsites(); // Dashboard neu laden
            });
        });
    };

    // Event-Listener für Authentifizierung
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = e.target.loginUsername.value;
        const password = e.target.loginPassword.value;
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (result.success) {
            checkSession();
        } else {
            document.getElementById('loginError').textContent = result.message;
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = e.target.registerUsername.value;
        const password = e.target.registerPassword.value;
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (result.success) {
            checkSession();
        } else {
            document.getElementById('registerError').textContent = result.message;
        }
    });

    addWebsiteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = e.target.addName.value;
        const url = e.target.addUrl.value;
        await fetch('/api/websites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url })
        });
        e.target.reset(); // Formular zurücksetzen
        fetchWebsites();
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout');
        updateUI(false);
    });

    // Navigations-Events
    document.getElementById('loginBtn').addEventListener('click', () => navigate('login'));
    document.getElementById('registerBtn').addEventListener('click', () => navigate('register'));
    document.getElementById('toLogin').addEventListener('click', (e) => { e.preventDefault(); navigate('login'); });
    document.getElementById('toRegister').addEventListener('click', (e) => { e.preventDefault(); navigate('register'); });

    // Initialen Sitzungsstatus überprüfen
    const checkSession = async () => {
        const response = await fetch('/api/session');
        const data = await response.json();
        updateUI(data.isAuthenticated, data.user);
    };

    checkSession();

    // Periodische Aktualisierung des Dashboards
    setInterval(fetchWebsites, 60000); // Alle 60 Sekunden aktualisieren
});