import { getUser, isAdmin } from '../ui/auth.js';

const API_BASE = 'https://localhost:7040/api/auth';

async function fetchPendingUsers() {
    const res = await fetch(`${API_BASE}/pending`);
    if (!res.ok) throw new Error('Failed to fetch pending users'); 
    return res.json();
}

async function approveUser(id) {
    const res = await fetch(`${API_BASE}/approve/${id}`, { method: 'PATCH' });

    if (!res.ok) throw new Error('Failed to approve user');
    await loadAdminPanel();
}

function renderUsers(container, users) {
    container.innerHTML = '';

    if (users.length === 0) {
        container.textContent = 'No pending accounts';
        return;
    }

    users.forEach(user => {
        const div = document.createElement('div');

        div.innerHTML = `
            <p>
                <strong>${user.username}</strong> (${user.email})<br>
                Company Name: ${user.companyName ?? 'N/A'}<br>
                Organization Number: ${user.orgNumber ?? 'N/A'}
            </p>
            <button>Approve</button>
            <hr>
        `;
    
        const button = div.querySelector('button');
        button.onclick = async () => {
            button.disabled = true;
            button.textContent = 'Approving...';

            try {
                await approveUser(user.id);
            } catch (err) {
                alert('Error approving user: ' + err.message);
                button.disabled = false;
                button.textContent = 'Approve';
            }
        };

        container.appendChild(div);
    });
}

export async function loadAdminPanel() {
    const container = document.getElementById('pending-accounts');

    if (!container) return;

    try {
        const users = await fetchPendingUsers();
        renderUsers(container, users);
    } catch (err) {
        container.textContent = 'Error loading users: ' + err.message;
    }
}

const user = getUser();
if (!user || !isAdmin()) {
    window.location.href = '/';
    alert('Access denied. Admins only.');
} else {
    loadAdminPanel();
}