import { getUser, isAdmin } from '../ui/auth.js';
import { fetchPendingUsers, approveUser } from '../api/admin.js';
import { renderUsers } from '../ui/admin.js';

async function loadAdminPanel() {
    const container = document.getElementById('pending-accounts');

    if (!container) return;

    try {
        const users = await fetchPendingUsers();
        renderUsers(container, users, async (id) => {
            await approveUser(id);
            await loadAdminPanel();
        });
    } catch (err) {
        container.textContent = 'Error loading users: ' + err.message;
    }
}

import { requireAdmin } from '../ui/auth.js';

if (requireAdmin()) {
    loadAdminPanel();
}