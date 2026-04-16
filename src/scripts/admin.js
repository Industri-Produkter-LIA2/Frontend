import { fetchPendingUsers, approveUser, rejectUser } from '../api/admin.js';
import { renderUsers } from '../ui/admin.js';

async function loadAdminPanel() {
    const container = document.getElementById('pending-accounts');

    if (!container) return;

    try {
        const users = await fetchPendingUsers();
        renderUsers(container, users, {
            onApprove: async (id) => {
                await approveUser(id);
                await loadAdminPanel();
            },
            onReject: async (id) => {
                await rejectUser(id);
                await loadAdminPanel();
            }
        });
        
    } catch (err) {
        container.textContent = 'Error loading users: ' + err.message;
    }
}

import { requireAdmin } from '../ui/auth.js';

if (requireAdmin()) {
    loadAdminPanel();
}