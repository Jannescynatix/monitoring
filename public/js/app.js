// public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const dashboardView = document.getElementById('dashboardView');
    const authLinks = document.getElementById('authLinks');
    const userGreeting = document.getElementById('userGreeting');
    const welcomeText = document.getElementById('welcomeText');
    const notesList = document.getElementById('notesList');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const addNoteForm = document.getElementById('addNoteForm');

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
            fetchNotes();
        } else {
            authLinks.style.display = 'flex';
            userGreeting.style.display = 'none';
            navigate('login');
        }
    };

    // API-Kommunikation für Notizen
    const fetchNotes = async () => {
        const response = await fetch('/api/notes');
        if (response.ok) {
            const notes = await response.json();
            renderNotes(notes);
        } else {
            if (response.status === 401) {
                updateUI(false);
            }
            console.error('Fehler beim Laden der Notizen');
        }
    };

    const renderNotes = (notes) => {
        notesList.innerHTML = '';
        if (notes.length === 0) {
            notesList.innerHTML = '<p>Noch keine Notizen vorhanden.</p>';
            return;
        }

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="card-footer">
                    <small>Erstellt am: ${new Date(note.createdAt).toLocaleDateString()}</small>
                    <button class="delete-btn" data-id="${note._id}">Löschen</button>
                </div>
            `;
            notesList.appendChild(noteCard);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await fetch(`/api/notes/${id}`, { method: 'DELETE' });
                fetchNotes();
            });
        });
    };

    // Event-Listener für Notizen
    addNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;

        await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        e.target.reset();
        fetchNotes();
    });

    // ... Event-Listener für Login, Register, Logout, etc. (bleiben gleich)
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

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout');
        updateUI(false);
    });

    document.getElementById('loginBtn').addEventListener('click', () => navigate('login'));
    document.getElementById('registerBtn').addEventListener('click', () => navigate('register'));
    document.getElementById('toLogin').addEventListener('click', (e) => { e.preventDefault(); navigate('login'); });
    document.getElementById('toRegister').addEventListener('click', (e) => { e.preventDefault(); navigate('register'); });

    const checkSession = async () => {
        const response = await fetch('/api/session');
        const data = await response.json();
        updateUI(data.isAuthenticated, data.user);
    };

    checkSession();
});